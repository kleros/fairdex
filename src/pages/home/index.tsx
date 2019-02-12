import React from 'react';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import * as images from '../../images';
import { getNetworkType } from '../../store/blockchain';
import spinner from './spinner';

const MainPage = Loadable({
  loader: () => import('../main'),
  loading: () => spinner,
});

const NetworkNotAvailable = Loadable({
  loader: () => import('./NetworkNotAvailable'),
  loading: () => spinner,
});

const SelectWallet = Loadable({
  loader: () => import('./SelectWallet'),
  loading: () => spinner,
});

interface Props {
  network?: Network | null;
  wallet?: Wallet;
}

const AVAILABLE_NETWORKS = ['main', 'rinkeby'];

const HomePage = React.memo(({ network, wallet }: Props) => {
  let content = null;

  if (!wallet || !network) {
    content = <SelectWallet />;
  } else if (!AVAILABLE_NETWORKS.includes(network)) {
    content = <NetworkNotAvailable />;
  } else {
    return <MainPage />;
  }

  return (
    <Container>
      <Content>{content}</Content>
      <Footer>
        <img src={images.geco} /> <span>Grant by the Gnosis Ecosystem Fund</span>
      </Footer>
    </Container>
  );
});

const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  min-height: 100vh;

  h2 {
    text-transform: uppercase;
  }

  h3 {
    font-size: 32px;
    font-weight: 800;
    text-align: center;
    color: var(--color-light-grey-blue);
  }

  p {
    margin: 0;
    font-size: 14px;
    font-weight: normal;

    color: var(--color-greyish);
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Footer = styled.footer`
  margin: var(--spacing-wide) 0;
  user-select: none;

  img {
    width: 60px;
    height: 60px;
    vertical-align: middle;
  }

  span {
    margin-left: 10px;
    color: var(--color-greyish);
  }
`;

function mapStateToProps(state: AppState): Props {
  return {
    network: getNetworkType(state),
    wallet: state.blockchain.wallet,
  };
}

export default connect(mapStateToProps)(HomePage);
