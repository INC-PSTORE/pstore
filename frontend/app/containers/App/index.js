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
// import Accounts from 'containers/accounts/loadable';
import Accounts from 'containers/accounts/index';
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

import {loadAccountsThunk} from './middlewares';
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
  makeSelecMetaMask,
  makeSelectConfigNetwork,
} from './selectors';

import { toggleInfoDialog, togglePappsMenuList, closePappsMenuList, updateNetwork } from './actions';
import {loadTokensInfoThunk} from "../wallet-page/middlewares";

// import injectReducer from 'utils/injectReducer';
// import { reducer } from './reducer';

/* eslint-disable react/prefer-stateless-function */
export class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.buildAppBar = this.buildAppBar.bind(this);
    this.closeInfoDialog = this.closeInfoDialog.bind(this);
    this.closePappsMenuList = this.closePappsMenuList.bind(this);
    this.togglePappsMenuList = this.togglePappsMenuList.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const {onLoadAccounts, configNetwork, onSwitchNetwork} = this.props;
    let network = window.localStorage.getItem(SWITCH_NETWORK);
    if (network == null) {
      network = configNetwork.isMainnet;
    }
    onLoadAccounts(network === '1');
    onSwitchNetwork(network === '1');
    // history.push('/accounts');
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
    onSwitchNetwork(!configNetwork.isMainnet);
    let currentPath = window.location.pathname;
    let reloadBalances = false;
    if ((currentPath === '/' || currentPath === '/wallet') && privateIncAccount && privateIncAccount.privateKey) {
      reloadBalances = true;
    }
    onLoadAccounts(!configNetwork.isMainnet, reloadBalances);
    window.localStorage.setItem(SWITCH_NETWORK, !configNetwork.isMainnet === true ? '1' : '0' );
  };

  buildAppBar() {
    const {
      privateIncAccount,
      metaMask,
      classes,
      onLoadAccounts,
      configNetwork,
    } = this.props;
    if (!metaMask.isMetaMaskEnabled || metaMask.chainId !== "0x2a" || !privateIncAccount.privateKey) {
      history.push('/wallet');
      return (
        <>
          <AppBar position="static" className={classes.appBar}>
            {metaMask && metaMask.metaMaskRequiredMess &&
            <div className={classes.metaMaskMess}>
              <Typography style={{color: 'white', marginLeft: '10px'}}>{metaMask.metaMaskRequiredMess}</Typography>
              { !metaMask.isMetaMaskEnabled &&
              <Button variant="contained" color="secondary" onClick={onLoadAccounts}
                      style={{color: 'white', marginLeft: '4px'}}>Connect Now</Button>
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
  };
}

const mapStateToProps = createStructuredSelector({
  isPappsMenuListOpened: makeSelectIsPappsMenuListOpened(),
  isLoadWalletDone: makeSelectIsLoadWalletDone(),
  tempIncAccount: makeSelectTempIncAccount(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  isOpenedInfoDialog: makeSelectIsOpenedInfoDialog(),
  requestings: makeSelectRequestings(),
  metaMask: makeSelecMetaMask(),
  configNetwork: makeSelectConfigNetwork(),
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
