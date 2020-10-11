import React from 'react';
import {TextField, Button, withStyles, Typography} from '@material-ui/core';
import {onError} from '../../../services/errorHandler';
import styles from './styles';
import {isETHPrivateKey, isIncPrivateKey} from "../../../common/validation";
import {ACCOUNT_TYPE} from "../../../containers/accounts/constants";

class AddAccount extends React.Component {
  constructor() {
    super();
    this.state = {
      privateKeyStr: '',
      error: ''
    }
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleImport = this.handleImport.bind(this);
    this.isValidPrivateKey = this.isValidPrivateKey.bind(this);
  }

  isValidPrivateKey(privateKey){
    const {accountType} = this.props;
    if (accountType === ACCOUNT_TYPE.INC) {
      if (!isIncPrivateKey(privateKey)) {
        this.setState({privateKeyStr: privateKey, error: 'Incognito private key is invalid'});
        return false;
      }
    } else if (accountType === ACCOUNT_TYPE.ETH) {
      if (!isETHPrivateKey(privateKey)) {
        this.setState({privateKeyStr: privateKey, error: 'Ethereum private key is invalid'});
        return false;
      }
    }

    return true;
  }

  handleChangeInput(e) {
    const value = e.target.value;
    if (this.isValidPrivateKey(value)) {
      this.setState({privateKeyStr: value, error: ''});
    };
  }

  async handleImport() {
    try {
      const {onImport} = this.props;
      const {privateKeyStr} = this.state;

      if (this.isValidPrivateKey(privateKeyStr)) {
        await onImport(privateKeyStr);
      }
    } catch (e) {
      onError(e);
    }
  }

  render() {
    const {onCreate, classes} = this.props;
    const {error} = this.state;
    return (
      <div className={classes.container}>
        <div className={classes.importView}>
          <TextField
            className={classes.input}
            multiline
            rows={2}
            label="Import your private key"
            variant="outlined"
            value={this.state.privateKeyStr}
            onChange={this.handleChangeInput}
          />
          {error !== '' ? <Typography className={classes.errorMsg}>{error}</Typography> : null}

          <Button className={classes.importBtn} onClick={this.handleImport} variant="contained" color='primary'>
            Import
          </Button>
        </div>
        <div className={classes.createView}>
          <Typography className={classes.createLink} onClick={onCreate}>{'>>> or create new account'}</Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AddAccount);