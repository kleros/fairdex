import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { DecimalValue } from '../../../components/formatters';
import { toDecimal, ZERO } from '../../../contracts/utils';
import { getTokensWithBalance, getTopBalances } from '../../../store/blockchain';
import WalletCard, { Content, Header, Item } from './WalletCard';

interface StateProps {
  tokens: Token[];
  topBalances: TokenWithBalance[];
  currentAccount?: Address;
}

type WalletProps = StateProps & RouteComponentProps;

const DEFAULT_DECIMALS = 3;

const WalletInfo = ({ tokens, topBalances, currentAccount }: WalletProps) => {
  const [ethBalance, setEthBalance] = useState(ZERO);

  useEffect(() => {
    if (currentAccount) {
      window.web3.eth.getBalance(currentAccount).then(balance => {
        setEthBalance(toDecimal(balance.toString(), 18) || ZERO);
      });
    }
  });

  return (
    <Container>
      <WalletHeader>
        <div>Available balance</div>
        <ViewAllTokens to='/wallet'>View all tokens &#x279C;</ViewAllTokens>
      </WalletHeader>
      <Content>
        <Item>
          <DecimalValue value={ethBalance} decimals={DEFAULT_DECIMALS} />
          <small>ETH</small>
        </Item>
        <Item>
          {topBalances[0] && topBalances[0].totalBalance.gt(0) && (
            <>
              <DecimalValue value={topBalances[0].totalBalance} decimals={DEFAULT_DECIMALS} />
              <small>{topBalances[0].symbol}</small>
            </>
          )}
        </Item>
        <Item>
          {topBalances[1] && topBalances[1].totalBalance.gt(0) && (
            <>
              <DecimalValue value={topBalances[1].totalBalance} decimals={DEFAULT_DECIMALS} />
              <small>{topBalances[1].symbol}</small>
            </>
          )}
        </Item>
        <Item>
          {topBalances[2] && topBalances[2].totalBalance.gt(0) && (
            <>
              <DecimalValue value={topBalances[2].totalBalance} decimals={DEFAULT_DECIMALS} />
              <small>{topBalances[2].symbol}</small>
            </>
          )}
        </Item>
      </Content>
    </Container>
  );
};

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
    tokens: getTokensWithBalance(state),
    topBalances: getTopBalances(state),
    currentAccount: state.blockchain.currentAccount,
  };
}

export default withRouter(connect(mapStateToProps)(WalletInfo));
