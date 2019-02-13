import React from 'react';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Router, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { history, pageview } from '../../analytics';
import Spinner from '../../components/Spinner';
import logo from '../../images/protofire.svg';
import { fetchData } from '../../store/blockchain';
import { ClaimProvider } from './auctions/claim/ClaimContext';

import { Content, Filters, Layout, MessageHandler, NavBar, Sidebar } from './layout';
import AccountInfo from './side/AccountInfo';
import WalletInfo from './side/WalletInfo';

const EndedAuctions = Loadable({
  loader: () => import('./auctions/tabs/EndedAuctions'),
  loading: () => <Spinner size='large' />,
});

const RunningAuctions = Loadable({
  loader: () => import('./auctions/tabs/RunningAuctions'),
  loading: () => <Spinner size='large' />,
});

const ScheduledAuctions = Loadable({
  loader: () => import('./auctions/tabs/ScheduledAuctions'),
  loading: () => <Spinner size='large' />,
});

const WalletOverview = Loadable({
  loader: () => import('./wallet-overview'),
  loading: () => <Spinner size='large' />,
});

interface DispatchProps {
  fetchData: () => void;
}

class MainPage extends React.Component<DispatchProps> {
  componentDidMount() {
    this.props.fetchData();

    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });

    pageview(history.location.pathname);

    history.listen(location => pageview(location.pathname));
  }

  render() {
    return (
      <Router history={history}>
        <Layout>
          <Sidebar>
            <Branding>
              <NavLink to='/'>
                <img src={logo} height={40} />
              </NavLink>
            </Branding>
            <SideContent>
              <AccountInfo />
              <WalletInfo />
            </SideContent>
          </Sidebar>
          <MessageHandler />
          <Filters />
          <Content>
            <ClaimProvider>
              <NavBar />
              <Section>
                <Switch>
                  <Route path='/running' component={RunningAuctions} />
                  <Route path='/scheduled' component={ScheduledAuctions} />
                  <Route path='/ended' component={EndedAuctions} />
                  <Route path='/wallet' component={WalletOverview} />
                  <Redirect to='/running' />
                </Switch>
              </Section>
            </ClaimProvider>
          </Content>
        </Layout>
      </Router>
    );
  }
}

const Branding = styled.header`
  display: flex;
  align-items: center;
  text-align: left;
  height: var(--header-height);
  padding: 0 var(--spacing-normal);
  border-bottom: 1px solid var(--color-border);
  user-select: none;

  & > * {
    width: 0;
    transition: width var(--animation-duration) ease-in-out;

    @media (min-width: 801px) {
      width: 100%;
      text-align: center;
    }
  }
`;

const Section = styled.section`
  height: 100%;
  min-height: calc(100vh - var(--header-height));
  padding: var(--spacing-normal);
`;

const SideContent = styled.div`
  display: grid;
  padding: var(--spacing-normal);
  gap: var(--spacing-normal);
`;

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    fetchData: () => dispatch(fetchData()),
  };
}

export default connect(
  null,
  mapDispatchToProps,
)(MainPage);
