/*
* App
*/

import {Typography} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import PetsIcon from '@material-ui/icons/Pets';
import AppBar from '@material-ui/core/AppBar';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import withWidth from '@material-ui/core/withWidth';
import WalletPage from 'containers/wallet-page/index';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import ShieldingPage from 'containers/shielding-page/loadable';
import UnshieldPage from 'containers/unshielding-page/loadable';
import UndeployPage from 'containers/undeploy-page/loadable';
import DeployPage from "containers/deploy-page/loadable";
import React from 'react';
import {connect} from 'react-redux';
import Switch2 from '@material-ui/core/Switch';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {compose} from 'redux';
import {createStructuredSelector} from 'reselect';
import GlobalStyle from '../../global-styles';
import styles from './styles';
import {NavLink} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import {enableMetaMask, enableWalletConnect, loadAccountsThunk} from './middlewares';
import history from '../../utils/history';
import {SWITCH_NETWORK} from './constants';

import {Loader} from '../../components/loader';

import {
  makeSelectTempIncAccount,
  makeSelectPrivateIncAccount,
  makeSelectIsLoadWalletDone,
  makeSelectIsOpenedInfoDialog,
  makeSelectIsPappsMenuListOpened,
  makeSelectRequestings,
  makeSelectMetaMask,
  makeSelectConfigNetwork,
  makeSelectWalletConnect,
  makeSelectOpenWalletList,
} from './selectors';

import {toggleInfoDialog, togglePappsMenuList, closePappsMenuList, updateNetwork, openWalletList} from './actions';
import {loadTokensInfoThunk} from "../wallet-page/middlewares";
import {ETH_KOVAN_ID, ETH_MAINNET_ID} from "../../common/constants";

// import injectReducer from 'utils/injectReducer';
// import { reducer } from './reducer';

function ethConnectMess(walletConnect, metaMask, configNetwork) {
  if (metaMask.isMetaMaskEnabled || walletConnect.connector && walletConnect.connector.connected) {
    const tmp = metaMask.isMetaMaskEnabled ? metaMask : walletConnect;
    if (tmp.chainId !== ETH_MAINNET_ID && tmp.chainId !== ETH_KOVAN_ID || (!configNetwork.isMainnet && tmp.chainId !== ETH_KOVAN_ID) || (configNetwork.isMainnet && tmp.chainId !== ETH_MAINNET_ID)) {
      return tmp.requiredMess ? tmp.requiredMess : "switch eth network to " + (tmp.chainId !== ETH_KOVAN_ID ? "kovan" : "mainnet") + " please";
    }
    return null;
  } else {
    return "Need connect to eth wallet to use awesome features";
  }
}

/* eslint-disable react/prefer-stateless-function */
export class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.buildAppBar = this.buildAppBar.bind(this);
    this.closeInfoDialog = this.closeInfoDialog.bind(this);
    this.closePappsMenuList = this.closePappsMenuList.bind(this);
    this.togglePappsMenuList = this.togglePappsMenuList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    const {onLoadAccounts, configNetwork, onSwitchNetwork} = this.props;
    let network = window.localStorage.getItem(SWITCH_NETWORK);
    if (network == null) {
      network = configNetwork.isMainnet;
    }
    onLoadAccounts(network === '1');
    onSwitchNetwork(network === '1');
  }

  closeInfoDialog() {
    this.props.onToggleInfoDialog();
  }

  closePappsMenuList() {
    this.props.onClosePappsMenuList();
  }

  togglePappsMenuList() {
    this.props.onTogglePappsMenuList();
  }

  handleChange = e => {
    const {configNetwork, onSwitchNetwork, onLoadAccounts, privateIncAccount} = this.props;
    let currentPath = window.location.pathname;
    if ((currentPath === '/' || currentPath === '/wallet') && privateIncAccount && privateIncAccount.privateKey) {
      onSwitchNetwork(!configNetwork.isMainnet);
      onLoadAccounts(!configNetwork.isMainnet, true);
      window.localStorage.setItem(SWITCH_NETWORK, !configNetwork.isMainnet ? '1' : '0');
    }
  };

  handleOpen() {
    const {onOpenWalletList} = this.props;
    onOpenWalletList(true);
  }

  handleClose() {
    const {onOpenWalletList} = this.props;
    onOpenWalletList(false);
  }

  buildAppBar() {
    const {
      privateIncAccount,
      metaMask,
      classes,
      configNetwork,
      walletConnect,
      isOpenWalletList,
      onConnectWalletConnect,
      onConnectMetaMask,
    } = this.props;
    const ethConnect = ethConnectMess(walletConnect, metaMask, configNetwork);
    if (ethConnect || !privateIncAccount.privateKey) {
      history.push('/wallet');
      return (
        <>
          <AppBar position="static" className={classes.appBar}>
            {ethConnect &&
            <div className={classes.metaMaskMess}>
              <Typography style={{color: 'white', marginLeft: '10px'}}>{ethConnect}</Typography>
              {!metaMask.isMetaMaskEnabled && (!walletConnect.connector || !walletConnect.connector.connected) &&
              <Button variant="contained" onClick={this.handleOpen}
                      style={{backgroundColor: "#037dd6", color: 'white', marginLeft: '4px'}}>Connect Now</Button>
              }
            </div>
            }
            <Toolbar>
              <IconButton className={classes.logo} aria-label="logo">
                <NavLink className={classes.link} activeClassName={classes.activeLink} exact to="/">
                  <PetsIcon/>
                </NavLink>
              </IconButton>
              <Button color="inherit" className={classes.navItemButton}>
                <NavLink className={classes.link} activeClassName={classes.activeLink} exact
                         to="/wallet">Wallet</NavLink>
              </Button>
            </Toolbar>
            <div>
              <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={isOpenWalletList}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Choose a wallet"}</DialogTitle>
                <DialogContent className={classes.DialogDisplay}>
                  <List>
                    <div className={classes.metaMaskSelect}>
                      <ListItem onClick={onConnectMetaMask} button>
                        <img alt={"metamask"} style={{width: '24px', height: '24px'}}
                             src={require("../../images/metamask.png")}/><ListItemText primary="MetaMask"/>
                        { !window.ethereum &&
                        <Button href={"https://metamask.io"} color={"secondary"} target={"_blank"}>Install</Button>
                        }
                      </ListItem>
                      <Divider/>
                    </div>
                    <ListItem onClick={onConnectWalletConnect} button>
                      <img alt={"walletConnect"} src={require("../../images/walletConnectIcon.svg")}/><ListItemText
                      primary="WalletConnect"/>
                    </ListItem>
                  </List>
                  <DialogActions>
                    <Button onClick={this.handleClose} style={{marginLeft: 'auto'}}> Close </Button>
                  </DialogActions>

                </DialogContent>
              </Dialog>
            </div>
          </AppBar>
        </>
      );
    }
    return (
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton className={classes.logo} aria-label="logo">
            <NavLink className={classes.homeLink} exact to="/">
              <PetsIcon className={classes.homeIcon}/>
            </NavLink>
          </IconButton>
          <Button color="inherit" className={classes.navItemButton}>
            <NavLink className={classes.link} activeClassName={classes.activeLink} exact
                     to="/wallet">Wallet</NavLink>
          </Button>
          {!configNetwork.isMainnet &&
          <Button color="inherit" className={classes.navItemButton}>
            <NavLink className={classes.link} activeClassName={classes.activeLink} exact
              to="/papps">pApps</NavLink>
          </Button>
          }
          <FormGroup row className={classes.switchNetwork}>
            <FormControlLabel
              control={
                <Switch2
                  classes={{
                    switchBase: classes.iOSSwitchBase,
                    bar: classes.iOSBar,
                    icon: classes.iOSIcon,
                    iconChecked: classes.iOSIconChecked,
                    checked: classes.iOSChecked,
                  }}
                  disableRipple={false}
                  checked={configNetwork.isMainnet}
                  onChange={this.handleChange}
                />
              }
              label={<Typography color={"textSecondary"}>Mainnet</Typography>}
            />
          </FormGroup>
        </Toolbar>
      </AppBar>
    );
  }

  render() {
    // return (<Loader isActive={true} />);
    const {
      isLoadWalletDone,
      requestings,
      classes,
    } = this.props;

    if (!isLoadWalletDone) {
      return (<Loader isActive={true}/>);
    }

    return (
      <BrowserRouter>
        <div className={classes.root}>
          {this.buildAppBar()}
          <Switch>
            <Route exact path="/" component={WalletPage}/>
            <Route exact path="/wallet" component={WalletPage}/>
            <Route exact path="/shield" component={ShieldingPage}/>
            <Route exact path="/unshield" component={UnshieldPage}/>
            <Route exact path="/undeploy" component={UndeployPage}/>
            <Route exact path="/deploy" component={DeployPage}/>
            <Route exact path="/papps" component={NotFoundPage}/>
            <Route component={NotFoundPage}/>
          </Switch>
          {requestings > 0 &&
          <Loader isActive={true}/>
          }
          <GlobalStyle/>

        </div>
      </BrowserRouter>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onLoadAccounts: (isMainnet, reloadBalances) => dispatch(loadAccountsThunk(isMainnet, reloadBalances)),
    onToggleInfoDialog: () => dispatch(toggleInfoDialog()),
    onTogglePappsMenuList: () => dispatch(togglePappsMenuList()),
    onClosePappsMenuList: () => dispatch(closePappsMenuList()),
    onSwitchNetwork: (isMainnet) => dispatch(updateNetwork(isMainnet)),
    onConnectWalletConnect: () => dispatch(enableWalletConnect()),
    onConnectMetaMask: () => dispatch(enableMetaMask()),
    onOpenWalletList: (isOpen) => dispatch(openWalletList(isOpen)),
  };
}

const mapStateToProps = createStructuredSelector({
  isPappsMenuListOpened: makeSelectIsPappsMenuListOpened(),
  isLoadWalletDone: makeSelectIsLoadWalletDone(),
  tempIncAccount: makeSelectTempIncAccount(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  isOpenedInfoDialog: makeSelectIsOpenedInfoDialog(),
  requestings: makeSelectRequestings(),
  metaMask: makeSelectMetaMask(),
  walletConnect: makeSelectWalletConnect(),
  configNetwork: makeSelectConfigNetwork(),
  isOpenWalletList: makeSelectOpenWalletList(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

// const withReducer = injectReducer({ key: 'app', reducer });

const withStylesApp = withStyles(styles);
const withWidthApp = withWidth();

export default compose(
  // withReducer,
  withConnect,
  withStylesApp,
  withWidthApp,
)(App);
