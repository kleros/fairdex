import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Separator from '../../components/Separator';
import * as images from '../../images';
import { connect as connectWallet } from '../../store/wallet/actions';

interface Props {
  actions: {
    onSelectWallet: (wallet: WalletType) => void;
  };
}

class SelectWallet extends React.PureComponent<Props> {
  handleWalletSelection = (wallet: WalletType) => {
    const { actions } = this.props;

    if (actions.onSelectWallet) {
      actions.onSelectWallet(wallet);
    }
  };

  selectStandardWallet = () => this.handleWalletSelection('standard');
  selectLedgerWallet = () => this.handleWalletSelection('ledger');

  render() {
    return (
      <>
        <h2>Select Wallet</h2>
        <Separator />
        <WalletList>
          <Wallet onClick={this.selectStandardWallet}>
            <Images>
              <img src={images.wallet.MetaMask} alt='MetaMask' />
              <img src={images.wallet.Parity} alt='Parity' />
              <img src={images.wallet.Cipher} alt='Cipher' />
            </Images>
            <h3>Standard Wallet</h3>
            <p>MetaMask, Parity, Cipher, Local Node</p>
          </Wallet>
          <Wallet disabled={true} onClick={this.selectLedgerWallet}>
            <Images>
              <img src={images.wallet.LedgerNano} alt='Ledger Nano' />
            </Images>
            <h3>Ledger Nano</h3>
            <p />
          </Wallet>
        </WalletList>
      </>
    );
  }
}

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
    transform: translateY(-5%);
  }
`;

const Images = styled.div`
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

function mapDispatchToProps(dispatch: any): Props {
  return {
    actions: {
      onSelectWallet: wallet => dispatch(connectWallet(wallet))
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(SelectWallet);
