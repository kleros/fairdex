import React from 'react';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { getNetworkType, init } from '../../store/blockchain';
import Landing from './Landing';
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

interface HomePageStateProps {
  network?: Network | null;
  wallet?: Wallet;
}

interface DispatchProps {
  initWallet: (wallet: Wallet) => void;
}

type Props = HomePageStateProps & DispatchProps;

const HomePage = React.memo(({ network, wallet, initWallet }: Props) => {
  if (wallet && !network) {
    initWallet(wallet);
    return spinner;
  } else {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={Landing} />
          <Route path='/select-wallet' exact component={SelectWallet} />
          <Route path='/network-not-available' exact component={NetworkNotAvailable} />
          <Route component={MainPage} />
        </Switch>
      </Router>
    );
  }
});

function mapStateToProps(state: AppState): HomePageStateProps {
  return {
    network: getNetworkType(state),
    wallet: state.blockchain.wallet,
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    initWallet: wallet => dispatch(init(wallet)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomePage);
