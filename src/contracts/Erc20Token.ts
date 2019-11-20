import { abi } from '@gnosis.pm/dx-contracts/build/contracts/EtherToken.json';

import BaseContract from './BaseContract';
import { toDecimal, ZERO } from './utils';

class Erc20Token extends BaseContract {
  private decimals!: number;

  constructor(address: Address) {
    super({ jsonInterface: abi, address });
  }

  async getAllowance(owner: Address, spender: Address, decimals: number) {
    const allowed = await this.contract.methods.allowance(owner, spender).call();
    return toDecimal(allowed, decimals) || ZERO;
  }

  async getBalance(account: Address, decimals: number) {
    const balance = await this.contract.methods.balanceOf(account).call();
    return toDecimal(balance, decimals) || ZERO;
  }

  async attemptFetchDecimals() {
    // ERC20 contracts may not implement the `decimals` function.
    const decimals = this.decimals || (await this.contract.methods.decimals().call());
    this.decimals = decimals;
    return decimals;
  }

  approve(spender: Address, value: number) {
    return this.contract.methods.approve(spender, value);
  }
}

export default Erc20Token;
