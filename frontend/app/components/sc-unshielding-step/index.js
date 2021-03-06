/*
* BurnToWithdraw
*/
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { Typography } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {withStyles} from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import React from 'react';
import {compose} from 'redux';
import styles from './styles';
import {
  getIncognitoToBurnCoin,
  getDefaultSupportedTokens,
} from '../../common/utils';
import Web3 from 'web3';
import Snackbar from "@material-ui/core/Snackbar";

/* eslint-disable react/prefer-stateless-function */
export class BurnToWithdraw extends React.PureComponent {
  constructor(props) {
    super(props);
    this.changeSelectedPToken = this.changeSelectedPToken.bind(this);
    this.changeAmount = this.changeAmount.bind(this);
    this.buildSupportedTokenMenuItems = this.buildSupportedTokenMenuItems.bind(this);
    this.submitBurnToUnshield = this.submitBurnToUnshield.bind(this);
    this.changeEthAddress = this.changeEthAddress.bind(this);
  }

  changeSelectedPToken(event) {
    const {onChangeSelectedToken} = this.props;
    const selectedTokenId = event.target.value;
    onChangeSelectedToken(selectedTokenId);
  }

  changeAmount(event) {
    const {onChangeAmount} = this.props;
    onChangeAmount(event.target.value);
  }

  changeEthAddress(event) {
    const {onChangeEthAddress, onUpdateValidateForm} = this.props;
    const web3 = new Web3();
    let formValidate = {};
    if (!web3.utils.isAddress(event.target.value.toLowerCase())) {
      formValidate.ethAddr = {
        isError: true,
        message: "Invalid Eth Address!",
      }
      onUpdateValidateForm(formValidate);
    } else {
      onChangeEthAddress(event.target.value);
      onUpdateValidateForm(null);
    }
  }

  submitBurnToUnshield() {
    const {formInfo, onSubmitBurnTx, privateIncAccount} = this.props;
    onSubmitBurnTx(formInfo, privateIncAccount);
  }

  buildSupportedTokenMenuItems() {
    const { classes, configNetwork} = this.props;
    let supportedCoins = getDefaultSupportedTokens(configNetwork.isMainnet);
    supportedCoins.shift()
    return supportedCoins.map(item =>
      <MenuItem key={item.incTokenId} value={item.incTokenId}>
        <div className={classes.coinInfo}>
          <div>
            <img src={item.icon} className={classes.icon} />
          </div>
          <div className={classes.tokenName}>
            <Typography noWrap>p{item.tokenSymbol}</Typography>
          </div>
        </div>
      </MenuItem>
    );
  }

  render() {
    const {classes, formInfo, formValidate, isDeploy} = this.props;
    return (
      <div className={classes.root}>
        <TextField
          id="outlined-full-width"
          value={getIncognitoToBurnCoin()}
          label="Incognito burning address"
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl className={classes.form}
                     error={formValidate && formValidate.tokenId && formValidate.tokenId.isError}
        >
          <InputLabel htmlFor="token-select">pCoin</InputLabel>
          <Select
            input={<Input id="token-select"/>}
            value={formInfo.tokenId}
            onChange={this.changeSelectedPToken}
          >
            {this.buildSupportedTokenMenuItems()}
          </Select>
          {formValidate && formValidate.tokenId && formValidate.tokenId.isError &&
          <FormHelperText id="component-error-text"> {formValidate.tokenId.message} </FormHelperText>
          }
        </FormControl>
        {!isDeploy &&
        <FormControl className={classes.form}
                     error={formValidate && formValidate.ethAddr && formValidate.ethAddr.isError}>
          <InputLabel htmlFor="amount-input">Ethereum address </InputLabel>
          <Input
            id="eth-address-input"
            aria-describedby="eth-address-helper-text"
            onChange={this.changeEthAddress}
          />
          {formValidate && formValidate.ethAddr && formValidate.ethAddr.isError &&
          <FormHelperText id="component-error-text"> {formValidate.ethAddr.message} </FormHelperText>
          }
        </FormControl>
        }

        <FormControl className={classes.form}
                     error={formValidate && formValidate.amount && formValidate.amount.isError}>
          <InputLabel htmlFor="amount-input">Amount</InputLabel>
          <Input
            type="number"
            id="amount-input"
            aria-describedby="amount-helper-text"
            onChange={this.changeAmount}
          />
          {formValidate && formValidate.amount && formValidate.amount.isError &&
          <FormHelperText id="component-error-text"> {formValidate.amount.message} </FormHelperText>
          }
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={this.submitBurnToUnshield}
          className={classes.button}
        >
          Burn to {isDeploy ? "deploy" : "unshield"}
        </Button>
      </div>
    );
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(BurnToWithdraw);
