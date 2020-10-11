import React from 'react';
import {TextField, withStyles, Button, Typography, CircularProgress} from '@material-ui/core';
import styles from './styles';
import {getBalanceByToken, incTransfer} from '../../services/incognito/wallet';
import {onError} from '../../services/errorHandler';
import {incToNanoAmount, incToUIAmount} from '../../utils/convert';
import {isFiniteNumber, isIncAddress} from "../../common/validation";

class TokenTransfer extends React.Component {
  constructor() {
    super();

    this.state = {
      toAddress: '',
      amount: 0,
      isTransfering: false,
      txInfo: null,
      errors: {
        amount: '',
        address: '',
      },
      errorAmount: '',
      errorAddress: '',
    };

    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onTransfer = this.onTransfer.bind(this);
  }

  onChangeAddress(e) {
    let paymentAddress = e.target.value;
    let err = {
      amount: '',
      address: '',
    };
    if (!isIncAddress(paymentAddress)) {
      err = {
        ...this.state.errors,
        address: 'Incognito address is invalid',
      }
    }

    this.setState({toAddress: paymentAddress, errors: err});
  }

  onChangeAmount(e) {
    const amountTransfer = e.target.value;
    const {balance, token} = this.props;
    const pDecimals = token.isNativeToken ? 9 : token.bridgeInfo && token.bridgeInfo.pDecimals;
    const balanceInUI = incToUIAmount(balance, pDecimals);
    let err = {
      amount: '',
      address: '',
    };

    if (!isFiniteNumber(amountTransfer)) {
      err = {
        ...this.state.errors,
        amount: `Amount must be a number`,
      }
    } else if (amountTransfer === 0) {
      err = {
        ...this.state.errors,
        amount: `Amount must be greater than zero`,
      }
    } else if (amountTransfer > balanceInUI) {
      err = {
        ...this.state.errors,
        amount: `Amount must be less than your balance ${balanceInUI}`,
      }
    }

    this.setState({
      amount: amountTransfer,
      errors: err
    });
  }

  async onTransfer() {
    try {
      const {errors, toAddress, amount} = this.state;
      if (amount === 0) {
        this.setState({
          amount: amount,
          errors: {
            ...this.state.errors,
            amount: `Amount must be greater than zero`,
          }
        });
        return;
      }
      if (errors.amount !== '' || errors.address !== '') {
        return;
      }

      this.setState({isTransfering: true});

      const {token} = this.props;
      // const decimals = token.pDecimals;
      const pDecimals = token.isNativeToken ? 9 : token.bridgeInfo && token.bridgeInfo.pDecimals;
      const nanoAmount = incToNanoAmount(amount, pDecimals);

      const txInfo = await incTransfer(token, toAddress, nanoAmount);

      this.setState({txInfo});
    } catch (e) {
      onError(e);
    } finally {
      this.setState({isTransfering: false});
    }
  }

  render() {
    const {fromAddress, onClose, classes, defaultFee} = this.props;
    const {toAddress, amount, txInfo, isTransfering, errors} = this.state;

    const defaultFeeUI = incToUIAmount(defaultFee, 9).toFixed(9);

    return (
      <div className={classes.container}>
        <TextField
          id="outlined-full-width"
          value={fromAddress}
          label="From address"
          fullWidth
          margin="normal"
          variant="outlined"
          disabled
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          id="outlined-full-width"
          value={toAddress}
          label="To address"
          onChange={this.onChangeAddress}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        {errors.address !== '' ? <Typography className={classes.errorMsg}>{errors.address}</Typography> : null}

        <TextField
          id="outlined-full-width"
          value={amount}
          label="Amount"
          onChange={this.onChangeAmount}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        {errors.amount !== '' ? <Typography className={classes.errorMsg}>{errors.amount}</Typography> : null}

        <TextField
          id="outlined-full-width"
          value={defaultFeeUI}
          label="Transaction fee"
          fullWidth
          margin="normal"
          variant="outlined"
          disabled
          InputLabelProps={{
            shrink: true,
          }}
        />

        {
          txInfo && (
            <Typography className={classes.txInfo}>
              Transaction ID: {txInfo.txId}
            </Typography>
          )
        }

        <div className={classes.btnGroup}>
          {
            isTransfering
              ? <CircularProgress/>
              : (
                <>
                  <Button
                    // variant="contained"
                    color="default"
                    onClick={onClose}
                    className={[classes.button, classes.closeBtn]}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.onTransfer}
                    className={classes.button}
                  >
                    Send
                  </Button>
                </>
              )
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TokenTransfer);