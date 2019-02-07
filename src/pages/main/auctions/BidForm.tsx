import BigNumber from 'bignumber.js';
import { ellipsis } from 'polished';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as utils from '../../../contracts/utils';
import {
  getCurrentAccount,
  getLiqContribPercentage,
  getOwl,
  getToken,
  loadAvailableTokens,
} from '../../../store/blockchain';
import { showNotification } from '../../../store/ui/actions';

import Button from '../../../components/Button';
import ButtonGroup from '../../../components/ButtonGroup';
import DecimalInput from '../../../components/DecimalInput';
import { DecimalValue } from '../../../components/formatters';
import Icon from '../../../components/icons';
import Popup from '../../../components/Popup';
import Tooltip from '../../../components/Tooltip';
import { getTotalBalance } from '../../../contracts/utils/tokens';

type Props = OwnProps & AppStateProps & DispatchProps;

interface OwnProps {
  auction: Auction;
}

interface AppStateProps {
  currentAccount: Address;
  bidToken: Token;
  feeRate: BigNumber;
  owl?: Token;
}

interface DispatchProps {
  dispatch: any;
}

const { ZERO } = utils;

const BidForm = React.memo(({ auction, bidToken, currentAccount, feeRate, owl, dispatch }: Props) => {
  if (auction.state !== 'running') {
    return null;
  }

  const { currentPrice = ZERO } = auction;

  const [bidAmount, setBidAmount] = useState(ZERO);
  const [bidding, setBidding] = useState(false);
  const [currentStep, setCurrentStep] = useState(utils.auction.isAbovePriorClosingPrice(auction) ? 1 : 2);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [approving, setApproving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const selectInput = useCallback(() => {
    setImmediate(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    });
  }, []);

  const sellTokenAmount = useMemo(
    () => {
      if (currentPrice.isPositive()) {
        const liquidityContribution = bidAmount.times(feeRate).div(100);

        return bidAmount.minus(liquidityContribution).div(currentPrice);
      }

      return ZERO;
    },
    [bidAmount, currentAccount, feeRate],
  );

  const availableSellVolume = useMemo(
    () => {
      return utils.auction.getAvailableVolume(auction);
    },
    [auction],
  );

  const availableBidVolume = useMemo(
    () => {
      return availableSellVolume.times(currentPrice);
    },
    [availableSellVolume, currentPrice],
  );

  const bidTokenBalance = useMemo(
    () => {
      return utils.token.getDxBalance(bidToken);
    },
    [bidToken],
  );

  const bidTokenTotalBalance = useMemo(
    () => {
      return utils.token.getTotalBalance(bidToken);
    },
    [bidToken],
  );

  const setMaxAvailableVolume = useCallback(
    (event?: any) => {
      if (event) {
        event.preventDefault();
      }

      setBidAmount(availableBidVolume.decimalPlaces(4, BigNumber.ROUND_DOWN));
      selectInput();
    },
    [availableBidVolume],
  );

  const setMaxBidVolume = useCallback(
    (event?: any) => {
      if (event) {
        event.preventDefault();
      }

      setBidAmount(BigNumber.min(bidTokenBalance, availableBidVolume).decimalPlaces(4, BigNumber.ROUND_DOWN));
      selectInput();
    },
    [availableBidVolume, bidTokenBalance],
  );

  const showDialog = useCallback((event?: any) => {
    if (event) {
      event.preventDefault();
    }

    setDialogVisible(true);
  }, []);

  const goToNextStep = useCallback(
    (event?: any) => {
      if (event) {
        event.preventDefault();
      }

      setCurrentStep(prevValue => {
        if (prevValue === 4) {
          return 4;
        }

        const nextStep = prevValue + 1;
        return nextStep !== 3 ||
          (nextStep === 3 && owl && owl.allowance && owl.allowance.eq(0) && getTotalBalance(owl).gt(0))
          ? nextStep
          : 4;
      });
    },
    [owl],
  );

  const goToBackStep = useCallback(
    (event?: any) => {
      if (event) {
        event.preventDefault();
      }

      setCurrentStep(prevValue => {
        if (prevValue === 1) {
          return 1;
        }

        const nextStep = prevValue - 1;
        return nextStep !== 3 ||
          (nextStep === 3 && owl && owl.allowance && owl.allowance.eq(0) && getTotalBalance(owl).gt(0))
          ? nextStep
          : 2;
      });
    },
    [owl],
  );

  const handleClose = useCallback(
    () => {
      if (!bidding) {
        setDialogVisible(false);
        setBidAmount(ZERO);
        setCurrentStep(utils.auction.isAbovePriorClosingPrice(auction) ? 1 : 2);
      }
    },
    [bidding],
  );

  const handleInputFocus = useCallback<React.FocusEventHandler<HTMLInputElement>>(
    event => {
      event.target.select();
    },
    [inputRef],
  );

  const handleSubmit = useCallback(
    (event?: any) => {
      if (bidAmount && bidAmount.isGreaterThan(ZERO)) {
        setBidding(true);

        dx.postBid(
          auction.sellTokenAddress,
          auction.buyTokenAddress,
          auction.auctionIndex,
          utils.fromDecimal(bidAmount, bidToken ? bidToken.decimals : 18),
        )
          .send({
            from: currentAccount,
            // TODO: gas
            // TODO: gasPrice
          })
          .once('transactionHash', transactionHash => {
            dispatch(
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
            dispatch(
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
            dispatch(loadAvailableTokens());

            setBidding(false);
            handleClose();
          })
          .once('error', err => {
            dispatch(
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

            setBidding(false);
          });
      }

      if (event) {
        event.preventDefault();
      }
    },
    [auction, bidAmount, bidToken, currentAccount],
  );

  const handleApprove = useCallback(
    (event?: any) => {
      if (event) {
        event.preventDefault();
      }
      setApproving(true);

      dx.toggleAllowance(owl)
        .send({
          from: currentAccount,
          // TODO: estimated gas
          // TODO: gas price from oracle
        })
        .once('transactionHash', transactionHash => {
          setApproving(true);
          dispatch(
            showNotification(
              'info',
              'Approve request sent',
              <p>
                Approve transaction has been sent.{' '}
                <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target='_blank'>
                  More info
                </a>
              </p>,
            ),
          );
        })
        .once('confirmation', (confNumber, receipt) => {
          setApproving(false);
          dispatch(
            showNotification(
              'success',
              'Approve confirmed',
              <p>
                Approve transaction has been confirmed.{' '}
                <a href={`https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`} target='_blank'>
                  More info
                </a>
              </p>,
            ),
          );

          goToNextStep();
        })
        .once('error', (err: Error) => {
          setApproving(false);
          dispatch(
            showNotification(
              'error',
              'Approve failed',
              <p>
                {err.message.substring(err.message.lastIndexOf(':') + 1).trim()}
                <br />
                Please try again later.
              </p>,
            ),
          );
        });
    },
    [owl, currentAccount, dispatch],
  );

  return (
    <Popup.Container onClickOutside={handleClose} onEscPress={handleClose} onBackspacePress={goToBackStep}>
      {dialogVisible && (
        <Popup.Content theme={currentStep === 1 ? 'accent' : 'default'}>
          {currentStep === 1 && (
            <Step1 onSubmit={goToNextStep}>
              <p>
                You are bidding above the previous <br /> closing price for {auction.sellToken}/
                {auction.buyToken}
              </p>
              <Text>
                <DecimalValue value={auction.closingPrice} decimals={4} postfix={auction.sellToken} />
              </Text>
              <Button type='submit' autoFocus data-testid={'proceed-bid-button'}>
                Proceed
              </Button>
            </Step1>
          )}

          {currentStep === 2 && (
            <Step2 onSubmit={goToNextStep}>
              <Field>
                <label>Bid volume</label>
                <Tooltip
                  theme='error'
                  position='bottom right'
                  content={
                    bidAmount.gt(availableBidVolume) && (
                      <p data-testid={'close-auction-message'}>
                        You will close this auction with <br />
                        <DecimalValue value={availableBidVolume} decimals={4} postfix={bidToken.symbol} />
                        <br />
                        <a href='' onClick={setMaxAvailableVolume}>
                          [set max]
                        </a>
                      </p>
                    )
                  }
                >
                  <DecimalInput
                    ref={inputRef}
                    right={auction.buyToken}
                    value={bidAmount.toString(10)}
                    onValueChange={setBidAmount}
                    onFocus={handleInputFocus}
                    autoFocus={true}
                    data-testid={'bid-amount-intput'}
                  />
                </Tooltip>
              </Field>

              <Field data-testid={'bid-buy-amount'}>
                <label>To buy at least:</label>
                <TextBox align='right'>
                  <DecimalValue value={sellTokenAmount} decimals={4} postfix={auction.sellToken} />
                </TextBox>
              </Field>

              <Button
                type='submit'
                disabled={!auction.currentPrice || auction.currentPrice.lte(ZERO) || bidAmount.lte(ZERO)}
                data-testid={'bid-step2-next-button'}
              >
                Next
              </Button>
            </Step2>
          )}

          {currentStep === 3 && (
            <>
              <Step4Header>
                <BackButton onClick={goToBackStep} />
                <h4>Liquidity contribution</h4>
              </Step4Header>
              <Step4 onSubmit={handleApprove}>
                <p>You have the option to settle half of your liquidity contribution in OWL.</p>
                <p>
                  Later you can choose to unsettle it back by disabling OWL token for trading within the
                  Wallet overview page.
                </p>
                <ButtonGroup>
                  {!approving && (
                    <Button mode='secondary' onClick={goToNextStep}>
                      Don't use OWL
                    </Button>
                  )}
                  <Button type='submit' disabled={approving}>
                    {approving ? 'Appove in progress...' : 'Use OWL'}
                  </Button>
                </ButtonGroup>
              </Step4>
            </>
          )}

          {currentStep === 4 && (
            <>
              <Popup.Header>
                <BackButton onClick={goToBackStep} />
                <h4>Your bid</h4>
              </Popup.Header>
              <Step3 onSubmit={handleSubmit} data-testid={'bid-confirm-step'}>
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
                  bidTokenTotalBalance.gte(bidAmount) ? (
                    <ErrorMessage data-testid={'bid-confirm-not-balance-dx'}>
                      Please <Link to='/wallet'>deposit</Link> at least{' '}
                      <DecimalValue
                        decimals={4}
                        postfix={bidToken.symbol}
                        roundingMode={BigNumber.ROUND_UP}
                        value={bidAmount.minus(bidTokenBalance)}
                      />{' '}
                      in DX.
                    </ErrorMessage>
                  ) : (
                    <ErrorMessage data-testid={'bid-confirm-not-total-balance'}>
                      You don't have enough {bidToken.symbol} to bid on this auction.
                      {bidTokenBalance.gt(0) && (
                        <>
                          {' '}
                          You can bid up to{' '}
                          <DecimalValue
                            decimals={4}
                            postfix={bidToken.symbol}
                            value={BigNumber.min(bidTokenBalance, availableBidVolume)}
                          />
                          .
                          <br />
                          <a href='' onClick={setMaxBidVolume}>
                            [set max]
                          </a>
                        </>
                      )}
                    </ErrorMessage>
                  )
                ) : (
                  <p>
                    liquidity contribution (<DecimalValue value={feeRate} decimals={2} postfix='%' />)
                    included
                  </p>
                )}
                <Button
                  type='submit'
                  disabled={bidding || bidAmount.lte(ZERO) || bidTokenBalance.lt(bidAmount)}
                  autoFocus
                  data-testid='confirm-bid-button'
                >
                  {bidding ? 'Bid in progress...' : 'Confirm'}
                </Button>
              </Step3>
            </>
          )}
        </Popup.Content>
      )}

      {dialogVisible ? (
        <Button mode='dark' onClick={handleClose} data-testid='cancel-bid-button'>
          Cancel
        </Button>
      ) : (
        <Button mode='secondary' onClick={showDialog} data-testid='bid-button'>
          Bid
        </Button>
      )}
    </Popup.Container>
  );
});

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
  margin: var(--spacing-normal) 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.25;
  letter-spacing: -0.6px;
  color: var(--color-text-primary);
`;

const Step2 = styled(Step)`
  display: grid;
  align-items: baseline;
  justify-items: left;

  p {
    text-align: center;
    color: var(--color-text-primary);
  }

  a {
    &:focus {
      outline: none;
    }
  }

  & > p {
    line-height: var(--spacing-narrow);
    text-align: center;

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

const Step4 = styled(Step2)``;
const Step4Header = styled(Popup.Header)`
  h4 {
    line-height: 1rem;
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
    color: var(--color-text-primary);
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
    bidToken: getToken(state, props.auction.buyTokenAddress) as Token,
    currentAccount: getCurrentAccount(state),
    feeRate: getLiqContribPercentage(state),
    owl: getOwl(state),
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
