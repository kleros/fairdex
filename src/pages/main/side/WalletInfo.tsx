import React from 'react';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { DecimalValue } from '../../../components/formatters';
import Spinner from '../../../components/Spinner';

import { getEthBalance, getTopBalances } from '../../../store/blockchain';
import TokenBalance from './TokenBalance';
import WalletCard, { Content, Header, Item } from './WalletCard';

interface StateProps {
  ethBalance?: BigNumber;
  topBalances: TokenWithBalance[];
}

type WalletProps = StateProps & RouteComponentProps;

const DEFAULT_DECIMALS = 3;

const WalletInfo = ({ topBalances, ethBalance }: WalletProps) => (
  <Container>
    <WalletHeader>
      <div>Available balances</div>
      <ViewAllTokens to='/wallet'>View all tokens &#x279C;</ViewAllTokens>
    </WalletHeader>
    <Content>
      <Item>
        {ethBalance != null ? (
          <>
            <DecimalValue value={ethBalance} decimals={DEFAULT_DECIMALS} data-testid='ETH-balance' />
            <small title='Ethereum'>ETH</small>
          </>
        ) : (
          <Spinner size='small' inline />
        )}
      </Item>
      <Item>
        {topBalances[0] && topBalances[0].totalBalance.gt(0) && (
          <TokenBalance token={topBalances[0]} decimals={DEFAULT_DECIMALS} />
        )}
      </Item>
      <Item>
        {topBalances[1] && topBalances[1].totalBalance.gt(0) && (
          <TokenBalance token={topBalances[1]} decimals={DEFAULT_DECIMALS} />
        )}
      </Item>
      <Item>
        {topBalances[2] && topBalances[2].totalBalance.gt(0) && (
          <TokenBalance token={topBalances[2]} decimals={DEFAULT_DECIMALS} />
        )}
      </Item>
    </Content>
  </Container>
);

const Container = styled(WalletCard)`
  background-image: linear-gradient(49deg, #e5c234, #ffd8be);
`;

const ViewAllTokens = styled(NavLink)`
  text-transform: uppercase;
`;

const WalletHeader = styled(Header)`
  height: 79px;

  &&& > div:nth-of-type(1) {
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 2.14;
    letter-spacing: -0.4px;
    color: var(--color-text-primary);
  }

  & > ${ViewAllTokens} {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: -0.3px;
    color: rgba(48, 59, 62, 0.42);
  }
`;

function mapStateToProps(state: AppState): StateProps {
  return {
    ethBalance: getEthBalance(state),
    topBalances: getTopBalances(state),
  };
}

export default withRouter(connect(mapStateToProps)(WalletInfo));
