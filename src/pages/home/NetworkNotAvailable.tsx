import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { getNetworkType, init } from '../../store/blockchain';

import Logos from '../../components/Logos';
import Separator from '../../components/Separator';
import * as images from '../../images';
import spinner from './spinner';
import { Container, Content, Footer } from './utils';

type Props = NetworkNotAvailableStateProps & DispatchProps;

interface NetworkNotAvailableStateProps {
  network?: Network | null;
  wallet?: Wallet;
}

interface DispatchProps {
  initializeWallet: (wallet: Wallet) => void;
}

const NetworkNotAvailable: FunctionComponent<Props> = ({ network, wallet, initializeWallet }) => {
  if (!wallet) {
    return <Redirect to='/select-wallet' />;
  } else if (!network) {
    initializeWallet(wallet);
    return spinner;
  } else if (network && network === 'rinkeby') {
    return <Redirect to='/' />;
  }

  return (
    <Container>
      <Content>
        <h2>This ÐApp is not available on your network</h2>
        <Separator />
        <p>Make sure you're connected to either Mainnet or Rinkeby Test Network</p>
      </Content>
      <Logos />
    </Container>
  );
};

function mapStateToProps(state: AppState): NetworkNotAvailableStateProps {
  return {
    network: getNetworkType(state),
    wallet: state.blockchain.wallet,
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    initializeWallet: wallet => dispatch(init(wallet)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NetworkNotAvailable);
