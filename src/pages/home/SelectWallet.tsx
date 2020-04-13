import React, { FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import Logos from '../../components/Logos';
import Separator from '../../components/Separator';
import * as images from '../../images';
import { getNetworkType, init } from '../../store/blockchain';
import spinner from './spinner';
import { Container, Content } from './utils';

type Props = AppStateProps & DispatchProps;

interface AppStateProps {
  network?: Network | null;
  wallet?: Wallet;
}

interface DispatchProps {
  onSelectWallet: (wallet: Wallet) => void;
}

const AVAILABLE_NETWORKS = ['main', 'rinkeby'];

const SelectWallet: FunctionComponent<Props> = ({ network, wallet, onSelectWallet }) => {
  const handleInstallWalletSelection = useCallback(link => window.open(link, '_blank'), []);
  const installWallet = (link: string) => () => handleInstallWalletSelection(link);

  const handleWalletSelection = useCallback(
    (selected: Wallet) => {
      if (onSelectWallet) {
        onSelectWallet(selected);
      }
    },
    [onSelectWallet, wallet],
  );

  const selectWallet = (selected: Wallet) => () => handleWalletSelection(selected);

  if (wallet && !network) {
    handleWalletSelection(wallet);
    return spinner;
  } else if (wallet && network && !AVAILABLE_NETWORKS.includes(network)) {
    return <Redirect to='/network-not-available' />;
  } else if (wallet && network) {
    return <Redirect to='/auctions' />;
  } else if (!window.web3 && !window.ethereum) {
    return (
      <Container>
        <Content>
          <h2>Wallet Detected</h2>
          <Separator />
          <h5>Please install a wallet</h5>
          <WalletList>
            <Wallet onClick={installWallet('https://metamask.io')}>
              <WalletLogos>
                <img src={images.wallet.MetaMask} alt='MetaMask' />
              </WalletLogos>
              <h3>Metamask</h3>
            </Wallet>
            <Wallet onClick={installWallet('https://gnosis-safe.io/')}>
              <WalletLogos>
                <img src={images.wallet.Safe} alt='Gnosis Safe' />
              </WalletLogos>
              <h3>Gnosis Safe</h3>
            </Wallet>
          </WalletList>
        </Content>
        <Logos />
      </Container>
    );
  } else {
    return (
      <Container>
        <Content>
          <h2>Select Wallet</h2>
          <Separator />
          <WalletList>
            <Wallet onClick={selectWallet('standard')}>
              <WalletLogos>
                <img src={images.wallet.MetaMask} alt='MetaMask' />
                <img src={images.wallet.Safe} alt='Gnosis Safe' />
              </WalletLogos>
              <h3>Standard Wallet</h3>
              <p>MetaMask, Safe</p>
            </Wallet>
          </WalletList>
        </Content>
        <Logos />
      </Container>
    );
  }
};

const WalletList = styled.div`
  display: grid;
  grid-gap: var(--spacing-normal);
  margin: var(--spacing-normal) 0 0;

  @media (min-width: 801px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Wallet = styled.button`
  padding: var(--spacing-normal);
  background-color: var(--color-main-bg);
  border: none;
  border-radius: 8px;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;

  transition: transform 100ms ease-in-out;
  will-change: transform;

  &:disabled {
    pointer-events: none;
    touch-action: none;
    opacity: 0.5;
  }

  &:focus {
    outline: 0;
  }

  &:hover {
    box-shadow: 0 24px 60px 0 rgba(133, 195, 214, 0.5);
    transform: translateY(-2%);
  }
`;

const WalletLogos = styled.div`
  display: grid;
  grid-gap: var(--spacing-normal);
  grid-auto-flow: column;
  place-content: center;
  margin: var(--spacing-normal) 0;

  img {
    width: 48px;
    height: 48px;
  }

  p {
    height: var(--spacing-normal);
    line-height: var(--spacing-normal);
    margin-bottom: var(--spacing-narrow);
  }
`;

function mapStateToProps(state: AppState): AppStateProps {
  return {
    network: getNetworkType(state),
    wallet: state.blockchain.wallet,
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    onSelectWallet: wallet => dispatch(init(wallet)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectWallet);
