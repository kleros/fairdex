import React, {
  AllHTMLAttributes,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { TransactionReceipt } from 'web3/types';

import { fromDecimal, toDecimal, ZERO } from '../../../contracts/utils';
import { getCurrentAccount, loadTokens } from '../../../store/blockchain';
import { showNotification } from '../../../store/ui/actions';

import { DecimalValue } from '../../../components/formatters';

import Button from '../../../components/Button';
import DecimalInput from '../../../components/DecimalInput';
import Popup from '../../../components/Popup';
import { getWalletBalance } from '../../../contracts/utils/tokens';

type Props = OwnProps & AppStateProps & DispatchProps;

interface OwnProps {
  token: Token;
}

interface AppStateProps {
  currentAccount: Address;
}

interface DispatchProps {
  dispatch: any;
}

interface State {
  amount: BigNumber;
  loading: boolean;
  showDialog: boolean;
}

const DEFAULT_DECIMALS = 3;

const DepositWithdrawForm = React.memo(({ token, currentAccount, dispatch }: Props) => {
  const [amount, setAmmount] = useState(ZERO);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showWrap, setShowWrap] = useState(false);
  const [showUnwrap, setShowUnwrap] = useState(false);
  const [ethBalance, setEthBalance] = useState(ZERO);
  const [isWrapping, setIsWrapping] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [maxAlloed, setMaxallowed] = useState(ZERO);

  useEffect(
    () => {
      if (currentAccount) {
        window.web3.eth.getBalance(currentAccount).then(balance => {
          const ethB = toDecimal(balance.toString(), 18) || ZERO;
          setEthBalance(ethB);

          if (ethB.gt(ZERO)) {
            setShowWrap(true);
          }
        });
      }

      if (getWalletBalance(token).gt(ZERO)) {
        setShowUnwrap(true);
      }
    },
    [token],
  );

  const inputRef = useRef(null);

  const handleInputFocus = useCallback(event => {
    event.target.select();
  }, []);

  const handleClose = useCallback(
    () => {
      if (!loading) {
        setShowDialog(false);
        setAmmount(ZERO);
        setMaxallowed(ZERO);
        setIsUnwrapping(false);
        setIsWrapping(false);
      }
    },
    [loading],
  );

  const handleWrap = useCallback(
    () => {
      setIsWrapping(true);
      setMaxallowed(ethBalance);
      handleOpen();
    },
    [ethBalance],
  );

  const handleUnwrap = useCallback(
    () => {
      setIsUnwrapping(true);
      setMaxallowed(getWalletBalance(token));
      handleOpen();
    },
    [token],
  );

  const handleOpen = useCallback(() => {
    setShowDialog(true);
  }, []);

  const sendRequest = () => {
    return isWrapping
      ? dx.wrapEther(token).send({
          from: currentAccount,
          value: fromDecimal(amount, 18),
          // TODO: estimated gas
          // TODO: gas price from oracle
        })
      : isUnwrapping
      ? dx.unwrapEther(token, amount).send({
          from: currentAccount,
          // TODO: estimated gas
          // TODO: gas price from oracle
        })
      : null;
  };

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      if (event) {
        event.preventDefault();
      }
      setLoading(true);

      const request = sendRequest();
      if (request) {
        const action = isWrapping ? 'Wrapp' : 'Unwrap';

        request
          .once('transactionHash', (transactionHash: TransactionHash) => {
            dispatch(
              showNotification(
                'info',
                `${action} request sent`,
                <p>
                  {action} transaction has been sent.{' '}
                  <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target='_blank'>
                    More info
                  </a>
                </p>,
              ),
            );
          })
          .once('confirmation', (confNumber: number, receipt: TransactionReceipt) => {
            dispatch(
              showNotification(
                'success',
                `${action} confirmed`,
                <p>
                  {action} has been confirmed.{' '}
                  <a href={`https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`} target='_blank'>
                    More info
                  </a>
                </p>,
              ),
            );

            // Reload tokensbalances and allowance
            dispatch(loadTokens());
            setLoading(false);
            handleClose();
          })
          .once('error', (err: Error) => {
            dispatch(
              showNotification(
                'error',
                `${action} failed`,
                <p>
                  {err.message.substring(err.message.lastIndexOf(':') + 1).trim()}
                  <br />
                  Please try again later.
                </p>,
              ),
            );

            setLoading(false);
          });
      }
    },
    [token, currentAccount, amount, dispatch],
  );

  return (
    <Container onClickOutside={handleClose} onEscPress={handleClose}>
      {showDialog && (
        <Content>
          <Form onSubmit={handleSubmit} data-testid={`wrap-unwrap-dialog`}>
            <div>
              <h4>Volume</h4>
              <p data-testid={'max-allowed'}>
                {isWrapping ? 'ETH' : token.symbol} (max{' '}
                <DecimalValue value={maxAlloed} decimals={DEFAULT_DECIMALS} />)
              </p>
            </div>
            <DecimalInput
              value={amount.toString(10)}
              ref={inputRef}
              onValueChange={setAmmount}
              onFocus={handleInputFocus}
              autoFocus={true}
            />
            <Button
              type='submit'
              disabled={loading || amount.lte(ZERO) || amount.gt(maxAlloed)}
              data-testid={'confirm-button'}
            >
              {loading ? `${isWrapping ? 'Wrapp' : 'Unwrap'} in progress...` : 'Confirm'}
            </Button>
          </Form>
        </Content>
      )}
      {showDialog ? (
        <Action disabled={loading} onClick={handleClose} data-testid={'cancel-button'}>
          Cancel
        </Action>
      ) : (
        <>
          {showWrap && (
            <Action onClick={handleWrap} data-testid={'wrap-button'}>
              Wrap
            </Action>
          )}
          {showWrap && showUnwrap && '|'}
          {showUnwrap && (
            <Action onClick={handleUnwrap} data-testid={'unwrap-button'}>
              Unwrap
            </Action>
          )}
        </>
      )}
    </Container>
  );
});

const Container = styled(Popup.Container)`
  color: var(--color-text-primary);
  font-size: 0.875rem;
  letter-spacing: -0.4px;
`;

interface ActionProps {
  disabled?: boolean;
}

const Action = styled.span`
  ${({ disabled }: Pick<AllHTMLAttributes<HTMLSpanElement>, 'disabled'>) => {
    if (disabled) {
      return css`
        color: var(--color-grey);
      `;
    }
  }}
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
`;

const Content = styled(Popup.Content)`
  padding: var(--spacing-narrow);
  width: var(--card-width);
  right: 0;
  transform: translateX(var(--spacing-normal));

  &:after {
    left: calc(80% - var(--box-arrow-height));
  }
`;

const Form = styled.form`
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
    font-size: 0.75rem;
    letter-spacing: -0.3px;
    color: var(--color-text-secondary);
    padding: 0;
  }

  div {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
  }
`;

function mapStateToProps(state: AppState, props: OwnProps): AppStateProps {
  return {
    currentAccount: getCurrentAccount(state),
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
)(DepositWithdrawForm);
