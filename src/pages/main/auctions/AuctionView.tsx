import React from 'react';
import styled from 'styled-components';

import { DecimalValue, Duration, Timestamp } from '../../../components/formatters';
import { ZERO } from '../../../contracts/utils';
import {
  getAvailableVolume,
  getClosingPriceRate,
  getCurrentPriceRate,
  getEstimatedEndTime,
} from '../../../contracts/utils/auctions';

import Card from '../../../components/Card';
import Popup from '../../../components/Popup';
import BidForm from './BidForm';
import ClaimForm from './claim/ClaimForm';

interface AuctionViewProps {
  data: Auction;
}

const DEFAULT_DECIMALS = 3;

const AuctionView = React.memo(({ data: auction }: AuctionViewProps) => (
  <Card id={`${auction.sellToken}-${auction.buyToken}-${auction.auctionIndex}`}>
    <Title title={`Bid with ${auction.buyToken} to buy ${auction.sellToken}`}>
      <span>{auction.buyToken}</span>
      <Separator>▶</Separator>
      <span>{auction.sellToken}</span>
    </Title>

    {auction.state === 'running' && (
      <>
        <Table>
          <Row>
            <Label>Current price</Label>
            <Value>
              {auction.currentPrice === undefined ? (
                <Loading />
              ) : (
                <span title={getCurrentPriceRate(auction)}>
                  <DecimalValue value={auction.currentPrice} decimals={DEFAULT_DECIMALS} hideTitle={true} />
                  <small>
                    {' '}
                    {auction.buyToken}/{auction.sellToken}
                  </small>
                </span>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Previous closing price</Label>
            <Value>
              {auction.closingPrice === undefined ? (
                <Loading />
              ) : (
                <span title={getClosingPriceRate(auction)}>
                  <DecimalValue value={auction.closingPrice} decimals={DEFAULT_DECIMALS} hideTitle={true} />
                  <small>
                    {' '}
                    {auction.buyToken}/{auction.sellToken}
                  </small>
                </span>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Volume needed to end</Label>
            <Value>
              {auction.sellVolume === undefined || auction.buyVolume === undefined ? (
                <Loading />
              ) : (
                <>
                  <DecimalValue value={getAvailableVolume(auction)} decimals={DEFAULT_DECIMALS} />
                  <small> {auction.sellToken}</small>
                </>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Estimated time to end</Label>
            <Value>
              {auction.auctionStart === undefined ? (
                <Loading />
              ) : (
                <Duration to={getEstimatedEndTime(auction)} />
              )}
            </Value>
          </Row>
        </Table>

        <ButtonGroup>
          <BidForm auction={auction} />
          {auction.buyerBalance && auction.buyerBalance.isGreaterThan(ZERO) && (
            <ClaimForm auction={auction} />
          )}
        </ButtonGroup>
      </>
    )}

    {auction.state === 'scheduled' && (
      <>
        <Table>
          <Row>
            <Label>{auction.auctionIndex === '0' ? 'Initial' : 'Previous'} closing price</Label>
            <Value>
              {auction.closingPrice === undefined ? (
                <Loading />
              ) : (
                <span title={getClosingPriceRate(auction)}>
                  <DecimalValue value={auction.closingPrice} decimals={DEFAULT_DECIMALS} hideTitle={true} />
                  <small>
                    {' '}
                    {auction.buyToken}/{auction.sellToken}
                  </small>
                </span>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Sell volume</Label>
            <Value>
              {auction.sellVolume === undefined ? (
                <Loading />
              ) : (
                <>
                  <DecimalValue value={auction.sellVolume} decimals={DEFAULT_DECIMALS} />
                  <small> {auction.sellToken}</small>
                </>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Estimated time to start</Label>
            <Value>
              {auction.auctionStart === undefined ? <Loading /> : <Duration to={auction.auctionStart} />}
            </Value>
          </Row>
        </Table>
      </>
    )}

    {auction.state === 'ended' && (
      <>
        <Table>
          <Row>
            <Label>{auction.auctionIndex === '0' ? 'Initial' : 'Closing'} price</Label>
            <Value>
              {auction.closingPrice === undefined ? (
                <Loading />
              ) : (
                <span title={getClosingPriceRate(auction)}>
                  <DecimalValue value={auction.closingPrice} decimals={DEFAULT_DECIMALS} hideTitle={true} />
                  <small>
                    {' '}
                    {auction.buyToken}/{auction.sellToken}
                  </small>
                </span>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Sell volume</Label>
            <Value>
              {auction.sellVolume === undefined ? (
                <Loading />
              ) : (
                <>
                  <DecimalValue value={auction.sellVolume} decimals={DEFAULT_DECIMALS} />
                  <small> {auction.sellToken}</small>
                </>
              )}
            </Value>
          </Row>
          <Row>
            <Label>Buy volume</Label>
            <Value>
              {auction.buyVolume === undefined ? (
                <Loading />
              ) : (
                <>
                  <DecimalValue value={auction.buyVolume} decimals={DEFAULT_DECIMALS} />
                  <small> {auction.buyToken}</small>
                </>
              )}
            </Value>
          </Row>
          <Row>
            <Label>End time</Label>
            <Value>
              {auction.auctionEnd === undefined ? <Loading /> : <Timestamp value={auction.auctionEnd} />}
            </Value>
          </Row>
        </Table>

        <ButtonGroup>
          {auction.buyerBalance && auction.buyerBalance.isGreaterThan(ZERO) && (
            <ClaimForm auction={auction} />
          )}
        </ButtonGroup>
      </>
    )}
  </Card>
));

const Label = styled.dt`
  position: relative;
  flex: 1;
  overflow: hidden;
  color: var(--color-greyish);

  &:after {
    position: absolute;
    content: '${'.'.repeat(200)}';
    color: var(--color-grey);
    margin-left: var(--spacing-text);
  }
`;

const Loading = styled.span.attrs({
  children: '…',
  title: 'Calculating value',
})`
  color: var(--color-greyish);
  user-select: none;
  cursor: progress;

  &:hover {
    color: inherit;
  }
`;

const Value = styled.dd`
  margin-left: var(--spacing-text);
  font-weight: 600;
  color: var(--color-text-primary);
`;

const Row = styled.div`
  display: flex;
  overflow: hidden;

  ${Label}, ${Value} {
    line-height: 1.5rem;
  }
`;

const Table = styled.dl`
  display: grid;
  font-size: 0.875rem;
  letter-spacing: -0.4px;
`;

const Title = styled.h3`
  display: inline-flex;
  align-items: center;
  font-size: 2em;
  font-weight: 900;
  color: var(--color-light-grey-blue);
`;

const Separator = styled.span`
  font-size: 40%;
  color: var(--color-grey);
  margin: 0 var(--spacing-text);
`;

const ButtonGroup = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: var(--spacing-narrow);

  & > * {
    width: 100%;

    &:nth-child(n + 2) {
      margin-left: var(--spacing-narrow);
    }
  }

  & ${Popup.Container}:not(:only-child) {
    position: unset;

    &:nth-child(-n + 1) {
      ${Popup.Content} {
        left: 0;

        &:after {
          left: calc(25% - var(--box-arrow-height) / 2);
        }
      }
    }

    &:nth-child(n + 2) {
      ${Popup.Content} {
        right: 0;

        &:after {
          left: calc(75% - var(--box-arrow-height) / 2);
        }
      }
    }
  }
`;

export default AuctionView;
