import React from 'react';
import styled from 'styled-components';

import { DecimalValue } from '../../../components/formatters';
import { getDxBalance, getTotalBalance, getWalletBalance } from '../../../contracts/utils/tokens';

import ButtonGroup from '../../../components/ButtonGroup';
import Card from '../../../components/Card';
import { ZERO } from '../../../contracts/utils';
import DepositForm from './DepositForm';
import EnabelForTradingForm from './EnableForTradingForm';
import { TokenContextProvider } from './TokenContext';
import WithdrawForm from './WithdrawForm';

interface Props {
  data: Token;
}

const DEFAULT_DECIMALS = 3;

class TokenView extends React.PureComponent<Props> {
  render() {
    const { data: token } = this.props;

    return (
      <TokenContextProvider>
        <Card>
          <Title title={token.symbol} data-testid={`token-card-title-${token.address}`}>
            <span>{token.symbol}</span>
          </Title>
          <Table>
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
              <Label>Total holdings</Label>
              <Value>
                {token.balance === undefined ? (
                  <Loading />
                ) : (
                  <DecimalValue value={getTotalBalance(token)} decimals={DEFAULT_DECIMALS} />
                )}
              </Value>
            </Row>
            <EnabelForTradingForm token={token} enabled={token.allowance ? token.allowance.gt(0) : false} />
          </Table>
          <ButtonGroup>
            {getWalletBalance(token).gt(ZERO) && <DepositForm token={token} />}
            {getDxBalance(token).gt(ZERO) && <WithdrawForm token={token} />}
          </ButtonGroup>
        </Card>
      </TokenContextProvider>
    );
  }
}

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

export default TokenView;
