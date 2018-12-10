import { ActionCreator, AnyAction, Dispatch, Reducer } from 'redux';

import { getAvailableTokens } from '../tokens';

export * from './selectors';

// Actions
const SET_RUNNING_AUCTIONS = 'SET_RUNNING_AUCTIONS';

const reducer: Reducer<AuctionsState> = (state = {}, action) => {
  switch (action.type) {
    case SET_RUNNING_AUCTIONS:
      return {
        ...state,
        auctions: action.payload
      };

    default:
      return state;
  }
};

const RUNNING_AUCTION_INTERVAL = 1000 * 60; // 1 minute

export function fetchRunningAuctions() {
  const { dx } = window;

  let subscription: any;

  return async (dispatch: Dispatch, getState: () => AppState) => {
    await checkForUpdates();

    async function checkForUpdates() {
      const state = getState();
      const tokens = getAvailableTokens(state);
      const tokenAddresses = Object.keys(tokens);

      if (tokenAddresses.length) {
        const tokenPairs = await dx.getRunningTokenPairs(tokenAddresses);

        const runningAuctions = await Promise.all(
          tokenPairs.map(
            async ([t1, t2]): Promise<Auction> => {
              const [auctionIndex, auctionStart, sellVolume, buyVolume] = await Promise.all([
                dx.getLatestAuctionIndex(t1, t2),
                dx.getAuctionStart(t1, t2),
                dx.getSellVolume(t1, t2),
                dx.getBuyVolume(t1, t2)
              ]);

              const currentPrice = await dx.getCurrentPrice(t1, t2, auctionIndex);

              const sellTokenAddress = t1.toLowerCase();
              const sellToken = tokens[sellTokenAddress];
              const buyTokenAddress = t2.toLowerCase();
              const buyToken = tokens[buyTokenAddress];

              return {
                auctionIndex,
                sellToken: sellToken ? sellToken.symbol : '',
                sellTokenAddress,
                sellVolume,
                buyToken: buyToken ? buyToken.symbol : '',
                buyTokenAddress,
                buyVolume,
                auctionStart,
                auctionEnd: '',
                currentPrice,
                state: 'running'
              };
            }
          )
        );

        dispatch(setRunningAuctions(runningAuctions));
      }

      clearTimeout(subscription);
      subscription = setTimeout(checkForUpdates, RUNNING_AUCTION_INTERVAL);
    }
  };
}

const setRunningAuctions: ActionCreator<AnyAction> = (auctions: Auction[]) => {
  return {
    type: SET_RUNNING_AUCTIONS,
    payload: auctions
  };
};

export default reducer;
