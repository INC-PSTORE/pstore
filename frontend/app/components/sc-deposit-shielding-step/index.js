/*
* SmartContractDeposit
*/
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { Typography } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { compose } from 'redux';
import styles from './styles';
import {
  getDefaultSupportedTokens,
  getIncognitoContractAddr,
} from '../../common/utils';


/* eslint-disable react/prefer-stateless-function */
export class SmartContractDeposit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.deposit = this.deposit.bind(this);
    this.changeSelectedToken = this.changeSelectedToken.bind(this);
    this.changeAmount = this.changeAmount.bind(this);
    this.buildSupportedTokenMenuItems = this.buildSupportedTokenMenuItems.bind(this);
  }

  deposit() {
    const { onDeposit, ethAccount, tempIncAccount, privateIncAccount, formInfo } = this.props;
    // TODO: validate values in formInfo
    onDeposit(ethAccount, tempIncAccount, privateIncAccount, formInfo);
  }

  changeSelectedToken(event) {
    const { onChangeSelectedToken } = this.props;
    const extTokenId = event.target.value;
    onChangeSelectedToken(extTokenId);
  }

  changeAmount(event) {
    const { onChangeAmount } = this.props;
    onChangeAmount(event.target.value);
  }

  buildSupportedTokenMenuItems() {
    const { classes } = this.props;
    // TODO: get supported tokens from incognito's api
    let supportedTokens = getDefaultSupportedTokens();
    supportedTokens.shift();
    return supportedTokens.map(item =>
      <MenuItem key={item.extTokenId} value={item.extTokenId} >
        <div className={classes.coinInfo}>
          <div>
            <img src={item.icon} className={classes.icon} />
          </div>
          <div className={classes.tokenName}>
            <Typography noWrap>{item.tokenSymbol}</Typography>
          </div>
        </div>
      </MenuItem>
    );
  }

  render() {
    const { classes, formInfo, insufficientBalancesInfo, actionButtonText } = this.props;
    return (
      <div className={classes.root}>
        <TextField
          id="outlined-full-width"
          value={getIncognitoContractAddr()}
          label="Incognito smart contract address"
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl className={classes.form}>
          <InputLabel htmlFor="token-select">Coin</InputLabel>
          <Select
            input={<Input id="token-select" />}
            value={formInfo.extTokenId}
            onChange={this.changeSelectedToken}
          >
            {this.buildSupportedTokenMenuItems()}
          </Select>
        </FormControl>

        <FormControl className={classes.form}>
          <InputLabel htmlFor="amount-input">Amount</InputLabel>
          <Input
            type="number"
            id="amount-input"
            aria-describedby="component-error-text"
            onChange={this.changeAmount}
          />
          {insufficientBalancesInfo && <FormHelperText className={classes.errorText} id="component-error-text">Insufficient balance</FormHelperText>}
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={this.deposit}
          className={classes.button}
        >
          {actionButtonText}
        </Button>
      </div>
    );
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(SmartContractDeposit);
