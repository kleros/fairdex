import { abi } from '@gnosis.pm/dx-contracts/build/contracts/DutchExchange.json';
import { DutchExchangeProxy } from '@gnosis.pm/dx-contracts/networks.json';
import { BlockType } from 'web3/eth/types';

import BaseContract from './BaseContract';
import { fromFraction, timeout, toDecimal } from './utils';

class DutchExchange extends BaseContract {
  constructor(networkId: string) {
    super({
      jsonInterface: abi,
      address: DutchExchangeProxy[networkId].address,
    });
  }

  get methods() {
    return this.instance.methods;
  }

  async getClearedAuctions(params: { fromBlock?: BlockType; toBlock?: BlockType } = {}) {
    const events = await this.instance.getPastEvents('AuctionCleared', params);

    return events.map(result => {
      return {
        block: result.blockNumber,
        data: marshallAuction(result.returnValues),
      };
    });
  }

  @timeout()
  async getAuctionStart(sellToken: Token, buyToken: Token): Promise<number | null> {
    const auctionStart: string = await this.methods
      .getAuctionStart(sellToken.address, buyToken.address)
      .call();

    const epoch = parseInt(auctionStart, 10) * 1_000;

    return isNaN(epoch) ? null : epoch;
  }

  @timeout()
  async getPreviousClosingPrice(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const closingPrice: Fraction = await this.methods
      .getPriceInPastAuction(sellToken.address, buyToken.address, auctionIndex)
      .call();

    return fromFraction(closingPrice);
  }

  @timeout()
  async getCurrentPrice(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const currentPrice: Fraction = await this.methods
      .getCurrentAuctionPrice(sellToken.address, buyToken.address, auctionIndex)
      .call();

    return fromFraction(currentPrice);
  }

  @timeout()
  async getSellVolume(sellToken: Token, buyToken: Token) {
    const sellVolume: string = await this.methods
      .sellVolumesCurrent(sellToken.address, buyToken.address)
      .call();

    return toDecimal(sellVolume, sellToken.decimals);
  }

  @timeout()
  async getBuyVolume(sellToken: Token, buyToken: Token) {
    const buyVolume: string = await this.methods.buyVolumes(sellToken.address, buyToken.address).call();

    return toDecimal(buyVolume, buyToken.decimals);
  }

  @timeout()
  async getFeeRatio(accountAddress: Address) {
    const currentFeeRatio: Fraction = await this.methods.getFeeRatio(accountAddress).call();

    return fromFraction(currentFeeRatio);
  }

  @timeout()
  async getLatestAuctionIndex(sellToken: Token, buyToken: Token): Promise<string> {
    const auctionIndex: string = await this.methods
      .getAuctionIndex(sellToken.address, buyToken.address)
      .call();

    return auctionIndex;
  }

  @timeout()
  async getRunningTokenPairs(tokens: Address[]): Promise<Array<[Address, Address]>> {
    const { tokens1, tokens2 } = await this.methods.getRunningTokenPairs(tokens).call();

    const pairs = tokens1.map((_: void, i: number) => {
      return [tokens1[i].toLowerCase(), tokens2[i].toLowerCase()];
    });

    return pairs;
  }
}

function marshallAuction(data: any): Partial<Auction> {
  return {
    auctionIndex: data.auctionIndex,
    buyToken: getTokenSymbol(data.buyToken),
    buyTokenAddress: data.buyToken,
    buyVolume: data.buyVolume,
    sellToken: getTokenSymbol(data.sellToken),
    sellTokenAddress: data.sellToken,
    sellVolume: data.sellVolume,
  };
}

function getTokenSymbol(tokenAddress: Address) {
  return `${tokenAddress}`;
}

export default DutchExchange;
