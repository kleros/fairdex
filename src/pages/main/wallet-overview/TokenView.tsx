import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import ButtonGroup from '../../../components/ButtonGroup';
import Card from '../../../components/Card';
import { DecimalValue } from '../../../components/formatters';
import { ZERO } from '../../../contracts/utils';
import { getDxBalance, getTotalBalance, getWalletBalance, isWeth } from '../../../contracts/utils/tokens';
import { getEthBalance } from '../../../store/blockchain';

import DepositWithdrawForm from './DepositWithdrawForm';
import EnableForTradingForm from './EnableForTradingForm';
import WrapUnwrapForm from './WrapUnwrapForm';

interface TokenViewProps {
  data: Token;
}

interface AppStateProps {
  ethBalance?: BigNumber;
}

const DEFAULT_DECIMALS = 3;

const TokenView = ({ data: token, ethBalance }: TokenViewProps & AppStateProps) => (
  <Card
    title={
      token.symbol === 'OWL'
        ? 'On the DutchX Protocol, a liquidity contribution is levied on users in place of traditional fees. These do not go to us or an operator. Liquidity contributions are committed to the next running auction for the respective auction pair and are thus redistributed to you and all other users of the DutchX Protocol! This incentivises volume and use of the Protocol.'
        : ''
    }
  >
    <Header>
      <Title title={token.symbol} data-testid={`token-card-title-${token.address}`}>
        <span>{token.symbol}</span>
      </Title>
      {isWeth(token) && <WrapUnwrapForm token={token} />}
    </Header>
    <Table>
      {isWeth(token) && (
        <Row>
          <Label>ETH balance</Label>
          <Value>
            {ethBalance === undefined ? (
              <Loading />
            ) : (
              <DecimalValue value={ethBalance} decimals={DEFAULT_DECIMALS} />
            )}
          </Value>
        </Row>
      )}
      <Row>
        <Label>Wallet balance</Label>
        <Value>
          {token.balance === undefined ? (
            <Loading />
          ) : (
            <DecimalValue value={getWalletBalance(token)} decimals={DEFAULT_DECIMALS} />
          )}
        </Value>
      </Row>
      <Row>
        <Label>DX balance</Label>
        <Value>
          {token.balance === undefined ? (
            <Loading />
          ) : (
            <DecimalValue value={getDxBalance(token)} decimals={DEFAULT_DECIMALS} />
          )}
        </Value>
      </Row>
      <Row>
        <Label>Total balance</Label>
        <Value>
          {token.balance === undefined ? (
            <Loading />
          ) : (
            <DecimalValue value={getTotalBalance(token)} decimals={DEFAULT_DECIMALS} />
          )}
        </Value>
      </Row>
      <EnableForTradingForm token={token} enabled={token.allowance ? token.allowance.gt(0) : false} />
    </Table>
    <ButtonGroup>
      {token.tradeable && getWalletBalance(token).gt(ZERO) && (
        <DepositWithdrawForm action={'Deposit'} token={token} />
      )}

      {token.tradeable && getDxBalance(token).gt(ZERO) && (
        <DepositWithdrawForm action={'Withdraw'} token={token} />
      )}
    </ButtonGroup>
  </Card>
);

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

const Loading = styled.span.attrs(props => ({
  children: '…',
  title: 'Calculating value',
}))`
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

const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 2em;
  font-weight: 900;
  color: var(--color-light-grey-blue);
`;

function mapStateToProps(state: AppState): AppStateProps {
  return {
    ethBalance: getEthBalance(state),
  };
}

export default connect(mapStateToProps)(TokenView);
