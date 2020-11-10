/*
* Wallet Page
*/

import {withStyles} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import React from 'react';
import {connect} from 'react-redux';
import {compose} from "redux";
import {createStructuredSelector} from "reselect";
import injectReducer from 'utils/injectReducer';

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Transfer from '../token-transfer';
import CustomModal from '../../components/modal';
import WalletTokenRow from '../../components/wallet-token-row';
import SectionView from '../../components/account-tab-content/section-view';
import AddAccount from '../../components/account-tab-content/add-account';
import KeyView from '../../components/account-tab-content/key-view';
import reducer from './reducer';
import {loadTokensInfoThunk} from './middlewares';
import {
  createPrivateIncAccountAction, importPrivateIncAccountAction,
} from '../App/actions';
import {
  makeSelectConfigNetwork,
  makeSelectPrivateIncAccount,
} from "../App/selectors";
import styles from './styles';
import {
  makeSelectTokens,
  makeSelectIsShowTransfer,
  makeSelectSelectedWalletToken,
} from './selectors';

import {selectWalletToken, closeTransferModal} from './actions';

import {DEFAULT_PRV_FEE} from "../../common/constants";


export class WalletPage extends React.PureComponent {
  constructor() {
    super();
    this.createPrivateIncAccount = this.createPrivateIncAccount.bind(this);
    this.importPrivateIncAccount = this.importPrivateIncAccount.bind(this);
    this.goToShield = this.goToShield.bind(this);
    this.goToUnshield = this.goToUnshield.bind(this);
    this.goToDeploy = this.goToDeploy.bind(this);
    this.goToUndeploy = this.goToUndeploy.bind(this);
    this.openTransferModal = this.openTransferModal.bind(this);
    this.closeTransfer = this.closeTransfer.bind(this);
  }

  componentDidMount() {
    const {privateIncAccount, onLoadTokensInfo} = this.props;
    if (privateIncAccount && privateIncAccount.privateKey) {
      onLoadTokensInfo();
    }
  }

  openTransferModal(token) {
    console.log('ahihi: ', token);
    this.props.onSelectWalletToken(token);
  }

  closeTransfer() {
    this.props.onCloseTransferModal();
  }

  goToShield() {
    this.props.history.push('/shield');
  }

  goToUnshield() {
    this.props.history.push('/unshield');
  }

  goToDeploy() {
    this.props.history.push('/deploy');
  }

  goToUndeploy() {
    this.props.history.push('/undeploy');
  }

  createPrivateIncAccount() {
    const {onCreatePrivateIncAccount} = this.props;
    onCreatePrivateIncAccount();
  }

  importPrivateIncAccount(privateKeyStr) {
    const {onImportPrivateIncAccount} = this.props;
    onImportPrivateIncAccount(privateKeyStr);
  }

  buildShownComp() {
    const {
      classes,
      tokens,
      privateIncAccount,
      selectedWalletToken,
      isShowTransfer,
      configNetwork,
    } = this.props;

    if (privateIncAccount.privateKey) {
      return (
        <div className={classes.root}>
          <div className={classes.account}>
            <SectionView label='Your account'>
              <div className={classes.keyView}>
                {/* <KeyView label='Private Key' value={privateIncAccount.privateKey} /> */}
                <KeyView label='Address' value={privateIncAccount.address}/>
              </div>
            </SectionView>
          </div>
          <div className={classes.sideActionButtons}>
            <Button
              className={classes.sideButton}
              variant="outlined"
              color="primary"
              onClick={this.goToDeploy}
            >
              Deposit to pApps
            </Button>
            <Button
              className={classes.sideButton}
              variant="outlined"
              color="primary"
              onClick={this.goToUndeploy}
            >
              Withdraw from pApps
            </Button>
          </div>
          <div className={classes.balances}>
            <SectionView label='Balances'>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticker</TableCell>
                    <TableCell align="right">
                      pToken
                    </TableCell>
                    <TableCell align="right">
                      pApps Deposited
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokens.map(token => (
                    <WalletTokenRow
                      key={token.tokenId}
                      token={token}
                      onOpenTransferModal={this.openTransferModal}
                    />
                  ))}
                </TableBody>
              </Table>
              <div className={classes.mainActionButtons}>
                <Button
                  className={classes.mainButton}
                  variant="outlined"
                  color="primary"
                  onClick={this.goToShield}
                >
                  Shield
                </Button>
                <Button
                  className={classes.mainButton}
                  variant="outlined"
                  color="primary"
                  onClick={this.goToUnshield}
                >
                  Unshield
                </Button>
              </div>
            </SectionView>

            <CustomModal
              open={isShowTransfer}
              onClose={this.closeTransfer}
              headerTitle='Send token'
            >
              <Transfer
                onClose={this.closeTransfer}
                fromAddress={privateIncAccount && privateIncAccount.address}
                token={selectedWalletToken && selectedWalletToken.incTokenInstance}
                balance={selectedWalletToken && selectedWalletToken.privateIncBal}
                defaultFee={DEFAULT_PRV_FEE}
              />
            </CustomModal>
          </div>
        </div>
      );
    }
    // not imported/created inc account yet
    return (
      <SectionView label={'Add your account'}>
        <AddAccount
          onCreate={this.createPrivateIncAccount}
          onImport={this.importPrivateIncAccount}
        />
      </SectionView>
    );
  }

  render() {
    const {} = this.props;
    const comp = this.buildShownComp();
    return comp;
  }
}

const mapStateToProps = createStructuredSelector({
  privateIncAccount: makeSelectPrivateIncAccount(),
  tokens: makeSelectTokens(),
  isShowTransfer: makeSelectIsShowTransfer(),
  selectedWalletToken: makeSelectSelectedWalletToken(),
  configNetwork: makeSelectConfigNetwork(),
});

const mapDispatchToProps = (dispatch) => {
  return {
    onCreatePrivateIncAccount: () => dispatch(createPrivateIncAccountAction()),
    onImportPrivateIncAccount: (privateKeyStr) => dispatch(importPrivateIncAccountAction(privateKeyStr)),
    onLoadTokensInfo: () => dispatch(loadTokensInfoThunk()),
    onSelectWalletToken: (token) => dispatch(selectWalletToken(token)),
    onCloseTransferModal: () => dispatch(closeTransferModal()),
  };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({key: 'wallet', reducer});

const withStylesWalletPage = withStyles(styles);
const withWidthWalletPage = withWidth();


export default compose(
  withReducer,
  withConnect,
  withStylesWalletPage,
  withWidthWalletPage,
)(WalletPage);
