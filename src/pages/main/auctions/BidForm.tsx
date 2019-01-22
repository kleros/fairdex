import { ellipsis } from 'polished';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as utils from '../../../contracts/utils';
import {
  getCurrentAccount,
  getLiqContribPercentage,
  getToken,
  loadAvailableTokens,
} from '../../../store/blockchain';
import { showNotification } from '../../../store/ui/actions';

import Button from '../../../components/Button';
import DecimalInput from '../../../components/DecimalInput';
import { DecimalValue } from '../../../components/formatters';
import Icon from '../../../components/icons';
import Popup from '../../../components/Popup';
import Tooltip from '../../../components/Tooltip';

type Props = OwnProps & AppStateProps & DispatchProps;

interface OwnProps {
  auction: Auction;
}

interface AppStateProps {
  currentAccount: Address;
  buyToken: Token;
  feeRate: BigNumber;
}

interface DispatchProps {
  dispatch: any;
}

interface State {
  amount: BigNumber;
  currentStep?: 1 | 2 | 3;
  loading?: boolean;
  showDialog?: boolean;
}

const { ZERO } = utils;

class BidForm extends React.PureComponent<Props, State> {
  state: State = { amount: ZERO };

  private inputRef = React.createRef<HTMLInputElement>();

  getInitialStep = () => {
    return utils.auction.isAbovePriorClosingPrice(this.props.auction) ? 1 : 2;
  };

  handleAmountChange = (amount: BigNumber) => {
    this.setState({ amount });
  };

  handleBack = () => {
    if (this.state.currentStep === 3) {
      this.showAmountForm();
    }
  };

  handleClose = () => {
    if (!this.state.loading) {
      this.setState({ showDialog: false, currentStep: undefined, amount: ZERO });
    }
  };

  handleInputFocus: React.FocusEventHandler<HTMLInputElement> = event => {
    event.target.select();
  };

  handleSubmit = (event?: any) => {
    const { amount } = this.state;

    if (amount && amount.isGreaterThan(ZERO)) {
      const { auction, buyToken, currentAccount } = this.props;

      this.setState({ loading: true });

      dx.postBid(
        auction.sellTokenAddress,
        auction.buyTokenAddress,
        auction.auctionIndex,
        utils.fromDecimal(amount, buyToken ? buyToken.decimals : 18),
      )
        .send({
          from: currentAccount,
          // TODO: gasPrice
          // TODO: nonce
        })
        .once('transactionHash', transactionHash => {
          this.props.dispatch(
            showNotification(
              'info',
              'Bid request sent',
              <p>
                Bid transaction has been sent.{' '}
                <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target='_blank'>
                  More info
                </a>
              </p>,
            ),
          );
        })
        .once('confirmation', (confNumber, receipt) => {
          this.props.dispatch(
            showNotification(
              'success',
              'Bid confirmed',
              <p>
                Bid transaction has been confirmed.{' '}
                <a href={`https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`} target='_blank'>
                  More info
                </a>
              </p>,
            ),
          );

          // Reload token balances and auction list
          this.props.dispatch(loadAvailableTokens());

          this.setState({ loading: false });
          this.handleClose();
        })
        .once('error', err => {
          this.props.dispatch(
            showNotification(
              'error',
              'Bid failed',
              <p>
                {err.message.substring(err.message.lastIndexOf(':') + 1).trim()}
                <br />
                Please try again later.
              </p>,
            ),
          );

          this.setState({ loading: false });
        });
    }

    if (event) {
      event.preventDefault();
    }
  };

  showDialog = () => {
    this.setState({ showDialog: true });
  };

  showAmountForm = (event?: any) => {
    if (event) {
      event.preventDefault();
    }

    this.setState({ currentStep: 2 });
  };

  showConfirmation = (event?: any) => {
    if (event) {
      event.preventDefault();
    }

    this.setState({ currentStep: 3 });
  };

  render() {
    const { auction, buyToken, feeRate } = this.props;

    if (auction.state !== 'running') {
      return null;
    }

    const { amount: bidAmount, currentStep = this.getInitialStep() } = this.state;
    const currentPrice = auction.currentPrice || ZERO;
    const sellTokenAmount = currentPrice.isZero() ? ZERO : bidAmount.div(currentPrice);
    const availableSellVolume = utils.auction.getAvailableVolume(auction);
    const availableBidVolume = availableSellVolume.times(auction.currentPrice || ZERO);

    const bidTokenBalance = utils.token.getDxBalance(buyToken);

    const setMaxVolume = (event?: any) => {
      if (event) {
        event.preventDefault();
      }

      this.setState({ amount: availableBidVolume.decimalPlaces(4, 1) }, () =>
        setImmediate(() => {
          if (this.inputRef.current) {
            this.inputRef.current.select();
          }
        }),
      );
    };

    return (
      <Popup.Container
        onClickOutside={this.handleClose}
        onEscPress={this.handleClose}
        onBackspacePress={currentStep === 3 ? this.handleBack : null}
      >
        {this.state.showDialog && (
          <Popup.Content theme={currentStep === 1 ? 'accent' : 'default'}>
            {currentStep === 1 && (
              <Step1 onSubmit={this.showAmountForm}>
                <p>
                  You are bidding above the previous <br /> closing price for {auction.sellToken}/
                  {auction.buyToken}
                </p>
                <Text>
                  <DecimalValue value={auction.closingPrice} decimals={4} postfix={auction.sellToken} />
                </Text>
                <Button type='submit' autoFocus>
                  Proceed
                </Button>
              </Step1>
            )}

            {currentStep === 2 && (
              <Step2 onSubmit={this.showConfirmation}>
                <Field>
                  <label>Bid volume</label>
                  <Tooltip
                    theme='error'
                    position='bottom right'
                    content={
                      bidAmount.gt(availableBidVolume) && (
                        <p>
                          You will close this auction with <br />
                          <DecimalValue value={availableBidVolume} decimals={4} postfix={buyToken.symbol} />
                          <br />
                          <a href='' onClick={setMaxVolume}>
                            [set max]
                          </a>
                        </p>
                      )
                    }
                  >
                    <DecimalInput
                      value={bidAmount.toString(10)}
                      right={auction.buyToken}
                      ref={this.inputRef}
                      onValueChange={this.handleAmountChange}
                      onFocus={this.handleInputFocus}
                      autoFocus={true}
                    />
                  </Tooltip>
                </Field>

                <Field>
                  <label>To buy at least:</label>
                  <TextBox align='right'>
                    <DecimalValue value={sellTokenAmount} decimals={4} postfix={auction.sellToken} />
                  </TextBox>
                </Field>

                <Button
                  type='submit'
                  disabled={!auction.currentPrice || auction.currentPrice.lte(ZERO) || bidAmount.lte(ZERO)}
                >
                  Next
                </Button>
              </Step2>
            )}

            {currentStep === 3 && (
              <>
                <Popup.Header>
                  <BackButton onClick={currentStep === 3 ? this.showAmountForm : undefined} />
                  <h4>Your bid</h4>
                </Popup.Header>
                <Step3 onSubmit={this.handleSubmit}>
                  <div>
                    <div>
                      <small>&nbsp;</small>
                      <h4>
                        <DecimalValue value={bidAmount} decimals={2} />
                      </h4>
                      <span>{auction.buyToken}</span>
                    </div>
                    <Separator>▶</Separator>
                    <div>
                      <small>min getting</small>
                      <h4>
                        <DecimalValue value={sellTokenAmount} decimals={2} />
                      </h4>
                      <span>{auction.sellToken}</span>
                    </div>
                  </div>

                  {bidTokenBalance.lt(bidAmount) ? (
                    <ErrorMessage>
                      You don't have enough {buyToken.symbol} available.{' '}
                      <Link to='/wallet'>Deposit more</Link>
                    </ErrorMessage>
                  ) : (
                    <p>
                      liquidity contribution (<DecimalValue value={feeRate} decimals={2} postfix='%' />)
                      included
                    </p>
                  )}

                  <Button
                    type='submit'
                    disabled={this.state.loading || bidAmount.lte(ZERO) || bidTokenBalance.lt(bidAmount)}
                    autoFocus
                  >
                    {this.state.loading ? 'Bid in progress...' : 'Confirm'}
                  </Button>
                </Step3>
              </>
            )}
          </Popup.Content>
        )}

        {this.state.showDialog ? (
          <Button mode='dark' onClick={this.handleClose}>
            Cancel
          </Button>
        ) : (
          <Button mode='secondary' onClick={this.showDialog}>
            Bid
          </Button>
        )}
      </Popup.Container>
    );
  }
}

const Step = styled.form`
  width: 100%;
  display: inline-grid;
  grid-template-columns: 1fr;
  grid-gap: var(--spacing-narrow);
  padding: var(--spacing-narrow);
  justify-items: center;

  h4 {
    margin: 0;
    font-weight: bold;
    line-height: 1.25;
    letter-spacing: -0.4px;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: -0.3px;
  }

  div {
    width: 100%;
  }

  label {
    font-weight: bold;
  }
`;

const Step1 = styled(Step)`
  grid-gap: var(--spacing-normal);

  h4 {
    ${ellipsis('100%')};
    display: block;
    text-align: center;
    letter-spacing: -0.6px;
    color: var(--color-text-primary);
  }

  p {
    text-align: center;
  }
`;

const Text = styled.h4`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.25;
  letter-spacing: -0.6px;
  color: var(--color-text-primary);
  margin: var(--spacing-normal) 0;
`;

const Step2 = styled(Step)`
  display: grid;
  align-items: baseline;
  justify-items: left;

  & > p {
    width: 100%;
    line-height: var(--spacing-narrow);
    text-align: center;
    color: var(--color-text-secondary);

    a {
      color: var(--color-text-orange);

      &:hover {
        text-decoration: underline;
      }
    }
  }

  input {
    text-align: right;
  }
`;

const Field = styled.div`
  display: block;
  min-height: var(--input-height);
`;

const TextBox = styled.div`
  display: inline-flex;
  ${ellipsis('100%')};
  height: var(--input-height);
  padding: 12px 10px;
  text-align: ${(props: { align?: 'left' | 'right' }) => props.align};
  overflow: hidden;
`;

const Step3 = styled(Step)`
  & > div {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin: var(--spacing-text) 0;

    div {
      text-align: center;

      h4 {
        font-size: 1.5rem;
        line-height: 1.25;
        letter-spacing: -0.6px;
        text-align: center;
      }

      small {
        color: var(--color-text-secondary);
      }
    }
  }

  & > p {
    text-align: center;
  }
`;

const BackButton = styled(Icon.Back)`
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  &&& {
    padding: var(--spacing-text);
    border-radius: 4px;
    background: #fce4e4;
    border: 1px solid #fcc2c3;
  }

  a {
    font-weight: bold;
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  color: var(--color-grey);
  margin: 0 var(--spacing-text);
`;

function mapStateToProps(state: AppState, props: OwnProps): AppStateProps {
  return {
    buyToken: getToken(state, props.auction.buyTokenAddress) as Token,
    currentAccount: getCurrentAccount(state),
    feeRate: getLiqContribPercentage(state),
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BidForm);
