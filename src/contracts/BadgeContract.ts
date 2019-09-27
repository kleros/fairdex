import abi from './tcr-abi/badge.json';

import BaseContract from './BaseContract';
import { ZERO_ADDRESS } from './utils';

const filter = [
  false, // Do not include items which are not on the TCR.
  true, // Include registered items.
  false, // Do not include items with pending registration requests.
  true, // Include items with pending clearing requests.
  false, // Do not include items with challenged registration requests.
  true, // Include items with challenged clearing requests.
  false, // Include token if caller is the author of a pending request.
  false, // Include token if caller is the challenger of a pending request.
];

class BadgeContract extends BaseContract {
  constructor(address: Address) {
    super({ jsonInterface: abi, address });
  }

  async getAddressesWithBadge(): Promise<Address[]> {
    let addresses: Address[] = [];
    let lastAddress = ZERO_ADDRESS;
    let hasMore = true;
    while (hasMore) {
      const result = await this.contract.methods
        .queryAddresses(
          lastAddress, // A token address to start/end the query from. Set to zero means unused.
          500, // Number of items to return at once.
          filter,
          true, // Return oldest first.
        )
        .call();

      hasMore = result.hasMore;
      addresses = addresses.concat(result.values.filter((address: string) => address !== ZERO_ADDRESS));
      lastAddress = addresses[addresses.length - 1];
    }

    return addresses;
  }
}

export default BadgeContract;
