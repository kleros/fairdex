import { ZERO } from './decimal';

export const ZERO_ID = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function getDxBalance(token?: Token) {
  if (!token || !token.balance || !token.balance.length) {
    return ZERO;
  }

  return token.balance[0];
}

export function getTotalBalance(token?: Token) {
  if (!token || !token.balance || !token.balance.length) {
    return ZERO;
  }

  return token.balance.reduce((total, balance) => total.plus(balance), ZERO);
}

export function getWalletBalance(token?: Token) {
  if (!token || !token.balance || !token.balance.length || token.balance.length <= 1) {
    return ZERO;
  }

  return token.balance[1];
}

export function isWeth(token: Token) {
  return token.symbol === 'WETH';
}
