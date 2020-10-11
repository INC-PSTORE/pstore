/*
* App
*/

import {Typography} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';
import PetsIcon from '@material-ui/icons/Pets';
import AppBar from '@material-ui/core/AppBar';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import withWidth from '@material-ui/core/withWidth';
// import Accounts from 'containers/accounts/loadable';
import Accounts from 'containers/accounts/index';
import WalletPage from 'containers/wallet-page/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import ShieldingPage from 'containers/shielding-page/loadable';
import UnshieldPage from 'containers/unshielding-page/loadable';
import UndeployPage from 'containers/undeploy-page/loadable';
import DeployPage from "containers/deploy-page/loadable";
import React from 'react';
import {connect} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {compose} from 'redux';
import {createStructuredSelector} from 'reselect';
import GlobalStyle from '../../global-styles';
import styles from './styles';
import {NavLink} from 'react-router-dom';
import Button from '@material-ui/core/Button';

import {loadAccountsThunk} from './middlewares';
import history from '../../utils/history';

import {Loader} from '../../components/loader';

import {
  makeSelectTempIncAccount,
  makeSelectPrivateIncAccount,
  makeSelectIsLoadWalletDone,
  makeSelectIsOpenedInfoDialog,
  makeSelectIsPappsMenuListOpened,
  makeSelectRequestings,
  makeSelecMetaMask,
} from './selectors';

import { toggleInfoDialog, togglePappsMenuList, closePappsMenuList } from './actions';

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
  }

  componentDidMount() {
    const {onLoadAccounts} = this.props;
    onLoadAccounts();
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

  buildAppBar() {
    const {
      tempIncAccount,
      privateIncAccount,
      isPappsMenuListOpened,
      metaMask,
      classes,
      onLoadAccounts,
    } = this.props;
    // if (!ethAccount.privateKey || !privateIncAccount.privateKey) {
    // kovan testnet
    if (!metaMask.isMetaMaskEnabled || metaMask.chainId !== "0x2a" || !privateIncAccount.privateKey) {
      history.push('/wallet');
      return (
        <>
          {metaMask && metaMask.metaMaskRequiredMess &&
          <div className={classes.metaMaskMess}>
            <Typography style={{color: 'white', marginLeft: '10px'}}>{metaMask.metaMaskRequiredMess}</Typography>
            { !metaMask.isMetaMaskEnabled &&
              <Button variant="contained" color="secondary" onClick={onLoadAccounts}
                      style={{color: 'white', marginLeft: '4px'}}>Connect Now</Button>
            }
          </div>
          }
          <AppBar position="static" className={classes.appBar}>
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
          <Button color="inherit" className={classes.navItemButton}>
            <NavLink className={classes.link} activeClassName={classes.activeLink} exact
              to="/papps">pApps</NavLink>
          </Button>

        </Toolbar>
      </AppBar>
    );
  }

  render() {
    // return (<Loader isActive={true} />);
    const {
      isLoadWalletDone,
      requestings,
    } = this.props;

    if (!isLoadWalletDone) {
      return (<Loader isActive={true}/>);
    }

    return (
      <BrowserRouter>
        <div style={styles.root}>
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
    onLoadAccounts: () => dispatch(loadAccountsThunk()),
    onToggleInfoDialog: () => dispatch(toggleInfoDialog()),
    onTogglePappsMenuList: () => dispatch(togglePappsMenuList()),
    onClosePappsMenuList: () => dispatch(closePappsMenuList()),
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
