import abi from './tcr-abi/tokens-view.json';

import BaseContract from './BaseContract';
import { token, ZERO_ADDRESS } from './utils';

class TokensView extends BaseContract {
  private target: Address;

  constructor(address: Address, target: Address) {
    super({ jsonInterface: abi, address });
    this.target = target;
  }

  async getTokensIDsForAddresses(addresses: Address[]): Promise<Bytes32[]> {
    return (await this.contract.methods.getTokensIDsForAddresses(this.target, addresses).call()).filter(
      (ID: string) => ID !== token.ZERO_ID,
    );
  }

  async getTokens(tokenIDs: Bytes32[]): Promise<Token[]> {
    return (await this.contract.methods.getTokens(this.target, tokenIDs).call())
      .filter((tokenInfo: any) => tokenInfo[3] !== ZERO_ADDRESS)
      .map((tokenInfo: any) => ({
        address: tokenInfo[3],
        decimals: Number(tokenInfo[6]),
        name: tokenInfo[1],
        symbol: tokenInfo[2],
      }));
  }
}

export default TokensView;
