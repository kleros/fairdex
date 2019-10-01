interface TokenStatus {
  address: Address;
  name: string;
  symbol: string;
  etherScanLink?: string;
  decimals?: number;
  hasTrueCryptosystemBadge?: boolean;
}

class TokenWhitelist {
  readonly whitelist?: TokenStatus[];

  constructor(whitelist?: TokenStatus[]) {
    this.whitelist = whitelist;
  }

  isWhitelisted(token: Address) {
    if (!this.whitelist) {
      return true;
    }

    return this.whitelist.some(({ address }) => token.toLowerCase() === address.toLowerCase());
  }

  getTokenData(token: Address) {
    if (!this.whitelist) {
      return undefined;
    }

    return this.whitelist.find(t => t.address.toLowerCase() === token.toLowerCase());
  }
}

export default TokenWhitelist;
