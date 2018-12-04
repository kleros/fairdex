import React from 'react';
import styled from 'styled-components';

interface AuctionCardProps {
  data: Auction;
  mode?: 'compact';
}

const AuctionCard = (props: AuctionCardProps) => {
  const { data } = props;
  const title = `${data.buyToken}/${data.sellToken}`;

  return (
    <Wrapper>
      <Title>{title}</Title>
      <Table>
        <Row>
          <Label>Current price</Label>
          <Value>2.452156</Value>
        </Row>
        <Row>
          <Label>To end volume</Label>
          <Value>628</Value>
        </Row>
        <Row>
          <Label>Started time</Label>
          <Value>{data.auctionStart}</Value>
        </Row>
      </Table>
      <Button>BID</Button>
    </Wrapper>
  );
};

AuctionCard.defaultProps = {
  mode: 'compact'
};

const Wrapper = styled.div`
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
    content: '...................................................................................................';
    color: var(--color-grey);
    margin-left: var(--spacing-text);
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
  margin-bottom: 1rem;
  font-size: 2em;
  font-weight: 900;
  text-align: left;
  color: var(--color-light-grey-blue);
`;

const Button = styled.button`
  display: block;
  width: 100%;
  margin-top: var(--spacing-normal);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 0.8rem;
  background: var(--color-main-bg);
  border: 2px solid var(--color-content-bg);
  color: var(--color-text-orange);
  cursor: pointer;
`;

export default React.memo(AuctionCard);