import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ElapsedTime, Numeric } from '../../../../components/formatters';
import { showInfoMessage } from '../../../../store/ui/actions';
import BidForm from './BidForm';

type AuctionViewProps = OwnProps & DispatchProps;

interface OwnProps {
  data: Auction;
}

interface DispatchProps {
  onBid: () => void;
}

const AuctionView = React.memo(({ data: auction, onBid }: AuctionViewProps) => (
  <Card>
    <Title>
      {auction.sellToken}/{auction.buyToken}
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
                <Numeric value={auction.currentPrice} decimals={7} />
              )}
            </Value>
          </Row>
          <Row>
            <Label>Sell volume</Label>
            <Value>
              {auction.sellVolume === undefined ? (
                <Loading />
              ) : (
                <Numeric value={auction.sellVolume} decimals={7} />
              )}
            </Value>
          </Row>
          <Row>
            <Label>Buy volume</Label>
            <Value>
              {auction.buyVolume === undefined ? (
                <Loading />
              ) : (
                <Numeric value={auction.buyVolume} decimals={7} />
              )}
            </Value>
          </Row>
          <Row>
            <Label>Started time</Label>
            <Value>
              {auction.auctionStart === undefined ? <Loading /> : <ElapsedTime from={auction.auctionStart} />}
            </Value>
          </Row>
        </Table>
        <BidForm auction={auction} onBid={onBid} />
      </>
    )}
  </Card>
));

const Card = styled.div`
  padding: var(--spacing-normal);
  border-radius: 8px;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.05);
  background-color: var(--color-main-bg);
  transition: all 2s ease;
`;

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

const Title = styled.h3.attrs({
  title: (props: any) => props.children,
})`
  margin-bottom: 1rem;
  font-size: 2em;
  font-weight: 900;
  text-align: left;
  color: var(--color-light-grey-blue);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onBid: () => dispatch(showInfoMessage('info', 'Cannot bid', 'Bid is not yet implemented')),
  };
}

export default connect(
  null,
  mapDispatchToProps,
)(AuctionView);
