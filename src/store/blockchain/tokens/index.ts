import { Action, ActionCreator, AnyAction, Reducer } from 'redux';

import { getBadgeContract, getErc20Contract, getTokensViewContract } from '../../../contracts';
import { toDecimal, ZERO } from '../../../contracts/utils';
import { loadAuctions } from '../auctions';
import { getCurrentAccount, getNetworkType } from '../web3';

import Erc20Token from '../../../contracts/Erc20Token';
import networks from './networks.json';
import { getAllTokens } from './selectors';
import TokenWhitelist from './whitelist';

export * from './selectors';

const DECIMALS_DICTIONARY: any = {
  '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a': 9, // DGD
};

// Actions
const UPDATE_ETH_BALANCE = 'UPDATE_ETH_BALANCE';
const SET_MARKETS = 'SET_MARKETS';
const SET_TOKENS = 'SET_TOKENS';
const UPDATE_BALANCES = 'UPDATE_BALANCES';
const SET_TOKEN_ALLOWANCE = 'SET_TOKEN_ALLOWANCE';

const initialState: TokensState = {
  markets: [],
  tokens: new Map<Address, Token>(),
};

const reducer: Reducer<TokensState> = (state = initialState, action) => {
  switch (action.type) {
    case SET_MARKETS:
      return {
        ...state,
        markets: Array.from(action.payload),
      };

    case SET_TOKENS:
    case UPDATE_BALANCES:
      return {
        ...state,
        tokens: new Map<Address, Token>(action.payload.map((token: Token) => [token.address, token])),
      };

    case UPDATE_ETH_BALANCE:
      return {
        ...state,
        ethBalance: action.payload,
      };

    case SET_TOKEN_ALLOWANCE:
      return {
        ...state,
        tokens: new Map<Address, Token>(
          Array.from(state.tokens).map(
            ([_, token]): [Address, Token] => {
              const newToken = { ...token };

              if (token.address === action.payload.address) {
                newToken.allowance = action.payload.allowance;
              }

              return [newToken.address, newToken];
            },
          ),
        ),
      };

    default:
      return state;
  }
};

export function loadTokens() {
  return async (dispatch: any, getState: () => AppState) => {
    const accountAddress = getCurrentAccount(getState());
    const network = getNetworkType(getState());

    const erc20Badge = getBadgeContract(networks.ERC20Badge[network].address);
    const dutchXBadge = getBadgeContract(networks.DutchXBadge[network].address);
    const [tokensWithERC20Badge, tokensWithDutchXBadge] = await Promise.all([
      erc20Badge.getAddressesWithBadge(),
      dutchXBadge.getAddressesWithBadge(),
    ]);

    const tokensView = getTokensViewContract(
      networks.TokensView[network].address,
      networks.T2CR[network].address,
    );
    const tokenIDs = await tokensView.getTokensIDsForAddresses(tokensWithERC20Badge);
    const whitelist = new TokenWhitelist(
      (await tokensView.getTokens(tokenIDs)).map(token => ({
        ...token,
        tradeable: true,
        hasDutchXBadge: tokensWithDutchXBadge.includes(token.address),
      })),
    );

    const tokens = whitelist.whitelist || [];

    await Promise.all(
      tokens
        .filter(token => token.decimals === 0)
        .map(async token => {
          try {
            const tokenContract = new Erc20Token(token.address);
            const decimals = (await tokenContract.attemptFetchDecimals()).toNumber();
            token.decimals = decimals;
          } catch (err) {
            // Missing decimals for this token.
            // Contract does not implement decimals function. Check dictionary of known tokens.
            // If not present, assume 18 decimal places.
            if (DECIMALS_DICTIONARY[token.address.toLowerCase()] != null) {
              // Use value from dictionary.
              token.decimals = DECIMALS_DICTIONARY[token.address.toLowerCase()];
            } else {
              // Use default 18.
              token.decimals = 18;
              token.usingFallbackDecimals = true;
            }
          }
        }),
    );

    if (accountAddress) {
      const markets: Market[] = (await dx.getAvailableMarkets()).filter(([token1, token2]) => {
        return whitelist.isWhitelisted(token1) && whitelist.isWhitelisted(token2);
      });

      dispatch(setMarkets(markets));
      dispatch(setTokens(tokens));

      if (tokens.length > 0) {
        dispatch(updateBalances());

        // Load auctions if needed
        const { blockchain } = getState();

        if (!blockchain.auctions) {
          dispatch(loadAuctions());
        }
      }
    }
  };
}

export function updateBalances() {
  return async (dispatch: any, getState: () => AppState) => {
    const accountAddress = getCurrentAccount(getState());
    const tokens = Array.from(getAllTokens(getState()).values());

    if (tokens.length) {
      const tokensWithBalances = await Promise.all(
        tokens.map(async token => {
          const tokenContract = getErc20Contract(token.address);

          const [contractBalance, walletBalance, priceEth, allowance] = await Promise.all([
            dx.getBalance(token, accountAddress),
            tokenContract.getBalance(accountAddress, token.decimals),
            dx.getPriceOfTokenInLastAuction(token),
            tokenContract.getAllowance(accountAddress, dx.address, token.decimals),
          ]);

          return {
            ...token,
            balance: [contractBalance, walletBalance],
            priceEth: priceEth.value,
            allowance,
          };
        }),
      );

      dispatch(setBalances(tokensWithBalances));
    }
  };
}

export function updateEthBalance() {
  return async (dispatch: any, getState: () => AppState) => {
    if (web3) {
      const currentAccount = getCurrentAccount(getState());

      if (currentAccount) {
        const balance = await web3.eth.getBalance(currentAccount);

        if (balance) {
          const ethBalance = toDecimal(balance, 18) || ZERO;

          dispatch(setEthBalance(ethBalance));
        }
      }
    }
  };
}

export const updateTokenAllowance = (token: Token) => {
  return async (dispatch: any, getState: () => AppState) => {
    const currentAccount = getCurrentAccount(getState());
    const tokenContract = getErc20Contract(token.address);

    const allowance = await tokenContract.getAllowance(currentAccount, window.dx.address, token.decimals);

    dispatch(setTokenAllowance(token.address, allowance));
  };
};

const setMarkets: ActionCreator<AnyAction> = (markets: Market[]) => {
  return {
    type: SET_MARKETS,
    payload: markets,
  };
};

const setTokens: ActionCreator<AnyAction> = (tokens: Token[]) => {
  return {
    type: SET_TOKENS,
    payload: tokens,
  };
};

const setBalances: ActionCreator<AnyAction> = (tokensWithBalances: Token[]) => {
  return {
    type: UPDATE_BALANCES,
    payload: tokensWithBalances,
  };
};

const setEthBalance: ActionCreator<AnyAction> = (balance: BigNumber) => {
  return {
    type: UPDATE_ETH_BALANCE,
    payload: balance,
  };
};

const setTokenAllowance: ActionCreator<Action> = (address: Address, allowance: BigNumber) => {
  return {
    type: SET_TOKEN_ALLOWANCE,
    payload: { address, allowance },
  };
};

export default reducer;
