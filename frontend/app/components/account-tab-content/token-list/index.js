import React from 'react';
import {List, ListItem, withStyles} from '@material-ui/core';
import styles from './styles';
import TokenItem from '../token-item';
import CustomModal from '../../modal';
import {ACCOUNT_TYPE} from '../../../containers/accounts/constants';
import Transfer from '../../../containers/token-transfer';
import {getKeysFromAccount} from '../../../services/eth/wallet';
import {getBalanceByToken, getIncKeyFromAccount} from '../../../services/incognito/wallet';
import {DEFAULT_PRV_FEE} from "../../../common/constants";

class TokenList extends React.Component {
  constructor() {
    super();
    this.state = {
      isShowTransfer: false,
      currentTokenTransfer: null,
      currentTokenBalance: 0,
      accountKeys: null
    };

    this.handleTransfer = this.handleTransfer.bind(this);
    this.closeTransfer = this.closeTransfer.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {account, accountType} = this.props;

    if (account !== prevProps.account) {
      this.getAccountKey(accountType, account);
    }
  }

  componentDidMount() {
    const {account, accountType} = this.props;
    this.getAccountKey(accountType, account);
  }

  async handleTransfer(token) {
    // disable if token is not INC
    const {accountType} = this.props;
    if (accountType !== ACCOUNT_TYPE.INC) {
      return null;
    }

    const balance = await getBalanceByToken(token);

    this.setState({currentTokenTransfer: token, currentTokenBalance: balance, isShowTransfer: true});
  }

  closeTransfer() {
    this.setState({isShowTransfer: false});
  }

  getAccountKey(accountType, account) {
    let keys;
    if (accountType === ACCOUNT_TYPE.ETH || accountType === ACCOUNT_TYPE.GEN_ETH) {
      keys = getKeysFromAccount(account);
    } else if (accountType === ACCOUNT_TYPE.INC) {
      keys = getIncKeyFromAccount(account);
    }

    this.setState({accountKeys: keys});
  }


  render() {
    const {tokenList, account, accountType, classes} = this.props;
    const {isShowTransfer, currentTokenTransfer, accountKeys, currentTokenBalance} = this.state;
    const defaultFee = DEFAULT_PRV_FEE;

    return (
      <div className={classes.container}>
        <List component="nav" aria-label="contacts">
          {
            tokenList && tokenList.map(token => {
              return token && token.tokenId ? (
                <ListItem className={classes.item} key={token.tokenId}>
                  <TokenItem onClick={this.handleTransfer} token={token} account={account} accountType={accountType}/>
                </ListItem>
              ) : null
            })
          }
        </List>

        <CustomModal
          open={isShowTransfer}
          onClose={this.closeTransfer}
          headerTitle='Send token'
        >
          <Transfer onClose={this.closeTransfer}
                    fromAddress={accountKeys && accountKeys.address}
                    token={currentTokenTransfer}
                    balance={currentTokenBalance}
                    defaultFee={defaultFee}
          />
        </CustomModal>
      </div>
    );
  }
}

export default withStyles(styles)(TokenList);