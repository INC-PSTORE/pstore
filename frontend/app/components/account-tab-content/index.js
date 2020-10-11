import React from 'react';
import AddAccount from './add-account';
import TokenList from './token-list';
import {ACCOUNT_TYPE} from '../../containers/accounts/constants';
import {getKeysFromAccount} from "../../services/eth/wallet";
import {getIncKeyFromAccount} from "../../services/incognito/wallet";
import styles from './styles';
import {withStyles} from '@material-ui/core';
import SectionView from './section-view';
import KeyView from './key-view';


class AccountTabContent extends React.Component {
  constructor() {
    super();

    this.state = {
      accountKeys: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {account, accountType} = props;
    let keys;
    if (accountType === ACCOUNT_TYPE.ETH || accountType === ACCOUNT_TYPE.GEN_ETH) {
      keys = getKeysFromAccount(account);
    } else if (accountType === ACCOUNT_TYPE.INC) {
      keys = getIncKeyFromAccount(account);
    }

    return {
      accountKeys: keys
    };
  }

  render() {
    const {account, accountType, onCreate, onImport, tokenList, classes} = this.props;
    const {accountKeys} = this.state;
    const {address, privateKey} = accountKeys || {};

    return (
      <div className={classes.container}>
        {
          accountKeys && (
            <SectionView label='Your account'>
              <div className={classes.keyView}>
                <KeyView label='Private Key' value={privateKey}/>
                <KeyView label='Address' value={address}/>
              </div>
            </SectionView>
          )
        }

        <div className={classes.content}>
          <SectionView label={account ? 'Balances' : 'Add your account'}>
            {
              account
                ? <TokenList accountType={accountType} account={account} tokenList={tokenList}/>
                : <AddAccount onCreate={onCreate} onImport={onImport} accountType={accountType}/>
            }
          </SectionView>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AccountTabContent);