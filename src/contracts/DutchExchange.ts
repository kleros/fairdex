import { abi } from '@gnosis.pm/dx-contracts/build/contracts/DutchExchange.json';
import { DutchExchangeProxy as proxy } from '@gnosis.pm/dx-contracts/networks.json';

import BaseContract from './BaseContract';
import { getErc20Contract, getWethContract } from './index';
import {
  Decimal,
  formatPriceWithDecimals,
  fromDecimal,
  toBigNumber,
  toDecimal,
  toFractional,
  ZERO,
} from './utils';

type Event =
  | 'AuctionCleared'
  | 'Fee'
  | 'NewBuyOrder'
  | 'NewBuyerFundsClaim'
  | 'NewDeposit'
  | 'NewWithdrawal'
  | 'NewTokenPair';

interface Fraction {
  num: string | number;
  den: string | number;
}

class DutchExchange extends BaseContract<Event> {
  static async create(networkId: number) {
    if (!proxy[networkId]) {
      throw Error(`DutchX is not available in network with id=${networkId}`);
    }

    const { address, transactionHash } = proxy[networkId];
    const { blockNumber } = await web3.eth.getTransaction(transactionHash);

    return new DutchExchange(address, blockNumber);
  }

  private constructor(address: Address, initialBlock?: number) {
    super({ jsonInterface: abi, address, initialBlock });
  }

  postBid(sellToken: Address, buyToken: Address, auctionIndex: string, buyAmount: Decimal) {
    const amount = toBigNumber(buyAmount);

    return this.contract.methods.postBuyOrder(sellToken, buyToken, auctionIndex, amount.toString(10));
  }

  postClaim(sellToken: Address, buyToken: Address, auctionIndex: string, accountAddress: Address) {
    return this.contract.methods.claimBuyerFunds(sellToken, buyToken, accountAddress, auctionIndex);
  }

  toggleAllowance(token: Token) {
    return getErc20Contract(token.address).approve(
      this.address,
      token.allowance && token.allowance.gt(0) ? 0 : -1,
    );
  }

  wrapEther(token: Token) {
    return getWethContract(token).deposit();
  }

  unwrapEther(token: Token, value: BigNumber) {
    return getWethContract(token).withdraw(value);
  }

  depositToken(token: Token, amount: BigNumber) {
    return this.contract.methods.deposit(token.address, fromDecimal(amount, token.decimals));
  }

  withdrawToken(token: Token, amount: BigNumber) {
    return this.contract.methods.withdraw(token.address, fromDecimal(amount, token.decimals));
  }

  async getAvailableMarkets(fromBlock = this.initialBlock) {
    const intervals = await this.getSweepIntervals(fromBlock);
    const markets = (await Promise.all(
      intervals.map(interval =>
        this.contract.getPastEvents('NewTokenPair', {
          fromBlock: interval.fromBlock,
          toBlock: interval.toBlock,
        }),
      ),
    )).reduce((acc, curr) => [...acc, ...curr]);

    return markets.map<[Address, Address]>(log => {
      const { buyToken, sellToken } = log.returnValues;

      return [buyToken, sellToken];
    });
  }

  async getBuyOrders(account: Address, fromBlock = this.initialBlock) {
    const intervals = await this.getSweepIntervals(fromBlock);
    const buyOrders = (await Promise.all(
      intervals.map(interval =>
        this.contract.getPastEvents('NewBuyOrder', {
          fromBlock: interval.fromBlock,
          toBlock: interval.toBlock,
          filter: { user: account },
        }),
      ),
    )).reduce((acc, curr) => [...acc, ...curr]);

    return Object.values(
      buyOrders.reduce<{ [key: string]: BuyOrder }>((all, { blockNumber, returnValues: result }) => {
        const { sellToken, buyToken, auctionIndex } = result;

        all[`${sellToken}-${buyToken}-${auctionIndex}`] = {
          blockNumber,
          sellToken,
          buyToken,
          auctionIndex,
        };

        return all;
      }, {}),
    );
  }

  async getAuctionStart(sellToken: Token, buyToken: Token) {
    const auctionStart: string = await this.contract.methods
      .getAuctionStart(sellToken.address, buyToken.address)
      .call();

    const epoch = parseInt(auctionStart, 10);

    return epoch ? (epoch > 1 ? epoch * 1_000 : epoch) : undefined;
  }

  async getAuctionEnd(
    sellToken: Token,
    buyToken: Token,
    auctionIndex: string,
    fromBlock = this.initialBlock,
  ) {
    const intervals = await this.getSweepIntervals(fromBlock);
    const [event] = (await Promise.all(
      intervals.map(interval =>
        this.contract.getPastEvents('AuctionCleared', {
          fromBlock: interval.fromBlock,
          toBlock: interval.toBlock,
          filter: { sellToken: sellToken.address, buyToken: buyToken.address, auctionIndex },
        }),
      ),
    )).reduce((acc, curr) => [...acc, ...curr]);

    if (event) {
      const block = await web3.eth.getBlock(event.blockNumber);

      if (block) {
        return block.timestamp * 1_000;
      }
    }

    return 0;
  }

  async getEndedAuctionStart(
    sellToken: Token,
    buyToken: Token,
    auctionIndex: string,
    fromBlock = this.initialBlock,
  ) {
    const tokens = await this.contract.methods.getTokenOrder(sellToken.address, buyToken.address).call();
    const intervals = await this.getSweepIntervals(fromBlock);
    const [event] = (await Promise.all(
      intervals.map(interval =>
        this.contract.getPastEvents('AuctionStartScheduled', {
          fromBlock: interval.fromBlock,
          toBlock: interval.toBlock,
          filter: { sellToken: tokens[0], buyToken: tokens[1], auctionIndex },
        }),
      ),
    )).reduce((acc, curr) => [...acc, ...curr]);

    if (event) {
      return event.returnValues.auctionStart * 1_000;
    }

    return 0;
  }

  async getBalance(token: Token, accountAddress: Address) {
    const balance = await this.contract.methods.balances(token.address, accountAddress).call();

    return toDecimal(balance, token.decimals) || ZERO;
  }

  async getUnclaimedFunds(sellToken: Token, buyToken: Token, auctionIndex: string, accountAddress: Address) {
    const { unclaimedBuyerFunds } = await this.contract.methods
      .getUnclaimedBuyerFunds(sellToken.address, buyToken.address, accountAddress, auctionIndex)
      .call();

    return toDecimal(unclaimedBuyerFunds, sellToken.decimals) || ZERO;
  }

  async getCurrentPrice(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const currentPrice: Fraction = await this.contract.methods
      .getCurrentAuctionPrice(sellToken.address, buyToken.address, auctionIndex)
      .call();

    const formatedWithDecimals = toFractional(
      formatPriceWithDecimals({
        price: currentPrice,
        tokenBDecimals: buyToken.decimals,
        tokenADecimals: sellToken.decimals,
      }),
    );

    const fractional = toFractional(currentPrice);

    // we need to maintain original num and den to be used in getAvailableVolume and sellTokenAmount
    return {
      ...fractional,
      value: formatedWithDecimals.value,
    };
  }

  async getClosingPrice(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const closingPrice: Fraction = await this.contract.methods
      .closingPrices(sellToken.address, buyToken.address, auctionIndex)
      .call();

    return toFractional(
      formatPriceWithDecimals({
        price: closingPrice,
        tokenBDecimals: buyToken.decimals,
        tokenADecimals: sellToken.decimals,
      }),
    );
  }

  async getPreviousClosingPrice(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const closingPrice: Fraction = await this.contract.methods
      .getPriceInPastAuction(sellToken.address, buyToken.address, auctionIndex)
      .call();

    return toFractional(
      formatPriceWithDecimals({
        price: closingPrice,
        tokenBDecimals: buyToken.decimals,
        tokenADecimals: sellToken.decimals,
      }),
    );
  }

  async getSellVolume(
    sellToken: Token,
    buyToken: Token,
    auctionIndex?: string,
    fromBlock = this.initialBlock,
  ) {
    if (auctionIndex) {
      const intervals = await this.getSweepIntervals(fromBlock);
      const [event] = (await Promise.all(
        intervals.map(interval =>
          this.contract.getPastEvents('AuctionCleared', {
            fromBlock: interval.fromBlock,
            toBlock: interval.toBlock,
            filter: {
              sellToken: sellToken.address,
              buyToken: buyToken.address,
              auctionIndex,
            },
          }),
        ),
      )).reduce((acc, curr) => [...acc, ...curr]);

      if (event) {
        return toDecimal(event.returnValues.sellVolume, sellToken.decimals);
      }
    } else {
      const volume: string = await this.contract.methods
        .sellVolumesCurrent(sellToken.address, buyToken.address)
        .call();

      return toDecimal(volume, sellToken.decimals);
    }
  }

  async getExtraTokens(sellToken: Token, buyToken: Token, auctionIndex: string) {
    const extraTokensVolume: string = await this.contract.methods
      .extraTokens(sellToken.address, buyToken.address, auctionIndex)
      .call();

    return extraTokensVolume ? toDecimal(extraTokensVolume, sellToken.decimals) : ZERO;
  }

  async getBuyVolume(
    sellToken: Token,
    buyToken: Token,
    auctionIndex?: string,
    fromBlock = this.initialBlock,
  ) {
    if (auctionIndex) {
      const intervals = await this.getSweepIntervals(fromBlock);
      const [event] = (await Promise.all(
        intervals.map(interval =>
          this.contract.getPastEvents('AuctionCleared', {
            fromBlock: interval.fromBlock,
            toBlock: interval.toBlock,
            filter: {
              sellToken: sellToken.address,
              buyToken: buyToken.address,
              auctionIndex,
            },
          }),
        ),
      )).reduce((acc, curr) => [...acc, ...curr]);

      if (event) {
        return toDecimal(event.returnValues.buyVolume, buyToken.decimals);
      }
    } else {
      const volume: string = await this.contract.methods
        .buyVolumes(sellToken.address, buyToken.address)
        .call();

      return toDecimal(volume, buyToken.decimals);
    }
  }

  async getFeeRatio(accountAddress: Address) {
    const currentFeeRatio: Fraction = await this.contract.methods.getFeeRatio(accountAddress).call();

    return toFractional(currentFeeRatio);
  }

  async getLatestAuctionIndex(sellToken: Token, buyToken: Token) {
    const auctionIndex: string = await this.contract.methods
      .getAuctionIndex(sellToken.address, buyToken.address)
      .call();

    return auctionIndex;
  }

  async getRunningTokenPairs(tokens: Address[]): Promise<Array<[Address, Address]>> {
    const { tokens1, tokens2 } = await this.contract.methods.getRunningTokenPairs(tokens).call();

    return tokens1.map((_: void, i: number) => {
      return [tokens1[i], tokens2[i]];
    });
  }

  async getFrtAddress() {
    const frtAddress: Address = await this.contract.methods.frtToken().call();

    return frtAddress;
  }

  async getEthTokenAddress() {
    const ethTokenAddress: Address = await this.contract.methods.ethToken().call();

    return ethTokenAddress;
  }

  async getOwlAddress() {
    const owlAddress: Address = await this.contract.methods.owlToken().call();

    return owlAddress;
  }

  async getPriceOfTokenInLastAuction(token: Token) {
    try {
      // in case whe call getPriceOfTokenInLastAuction for a token without market (like we do with OWL)
      const price = await this.contract.methods.getPriceOfTokenInLastAuction(token.address).call();

      return toFractional(price);
    } catch (error) {
      return toFractional({ den: '1', num: '0' });
    }
  }

  async getBuyerBalance(sellToken: Token, buyToken: Token, auctionIndex: string, accountAddress: Address) {
    const buyerBalance = await this.contract.methods
      .buyerBalances(sellToken.address, buyToken.address, auctionIndex, accountAddress)
      .call();

    return toDecimal(buyerBalance, buyToken.decimals) || ZERO;
  }

  private async getSweepIntervals(fromBlock: number) {
    // Fetching event logs in a single request can (this was happening) cause
    // the provider to timeout the request.
    // To get around this we can split it into multiple, smaller requests.
    const { number: currentBlock } = await web3.eth.getBlock('latest');
    const totalBlocks = currentBlock - fromBlock;
    const BLOCKS_PER_REQUEST = 200000;
    const numRequests = Math.ceil(totalBlocks / BLOCKS_PER_REQUEST);
    const intervals = [{ fromBlock, toBlock: fromBlock + BLOCKS_PER_REQUEST }];
    for (let i = 1; i < numRequests; i++) {
      intervals[i] = {
        fromBlock: intervals[i - 1].toBlock + 1,
        toBlock: intervals[i - 1].toBlock + 1 + BLOCKS_PER_REQUEST,
      };
    }
    return intervals;
  }
}

export default DutchExchange;
