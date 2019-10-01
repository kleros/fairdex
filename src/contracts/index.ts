import BadgeContract from './BadgeContract';
import Erc20Token from './Erc20Token';
import TokensView from './TokensView';
import Weth from './Weth';

const cache = new Map<Address, Erc20Token>();
let weth: Weth;
let tokensView: TokensView;
const badgeCache = new Map<Address, BadgeContract>();

export function getErc20Contract(tokenAddress: Address) {
  const contract = cache.get(tokenAddress) || new Erc20Token(tokenAddress);

  if (contract != null && !cache.has(tokenAddress)) {
    cache.set(tokenAddress, contract);
  }

  return contract;
}

export function getWethContract(token: Token) {
  const contract = weth || new Weth(token);

  if (contract != null && !weth) {
    weth = contract;
  }

  return contract;
}

export function getTokensViewContract(address: Address, target: Address) {
  const contract = tokensView || new TokensView(address, target);

  if (contract != null && !weth) {
    tokensView = contract;
  }

  return contract;
}

export function getBadgeContract(address: Address) {
  const contract = badgeCache.get(address) || new BadgeContract(address);

  if (contract != null && !badgeCache.has(address)) {
    badgeCache.set(address, contract);
  }

  return contract;
}
