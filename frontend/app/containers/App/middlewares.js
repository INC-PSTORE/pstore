/*
* App middlewares
*/

import {setupIncWallet} from '../../services/incognito/wallet';
// import {loadETHAccountFromStorage} from '../../services/eth/wallet';
import {
  loadAccountsSuccess,
  loadAccountsFailure,
} from './actions';
// import history from '../../utils/history';

import {countUpRequests, countDownRequests, updateMetaMask} from './actions';
import {loadTokensInfoThunk} from "../wallet-page/middlewares";

export function loadAccountsThunk(isMainnet, reloadBalances) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      // load ETH private key
      // const ethAccount = loadETHAccountFromStorage();
      const metaMask = await enableMetaMask(dispatch);
      dispatch(updateMetaMask(metaMask));
      if(metaMask.isMetaMaskEnabled) {
        window.ethereum.on('chainChanged', (chainId) => {
          metaMask.chainId = chainId;
          if (chainId !== "0x2a") {
            metaMask.metaMaskRequiredMess = "Only Kovan supported on PSTORE!";
          }
          if(metaMask.isMetaMaskEnabled) {
            dispatch(updateMetaMask(metaMask));
          }
        });
        window.ethereum.on('accountsChanged', (accounts) => {
          if(accounts.length === 0) {
            let metaMask = getState().app.metaMask;
            metaMask.metaMaskRequiredMess = "Connect to metamask account to continue. If has any issue please drop me a feed back!";
            metaMask.isMetaMaskEnabled = false;
            dispatch(updateMetaMask(metaMask));
          }
        });
      }
      let networkConfig = getState().app.configNetwork;
      let chainUrl = isMainnet ? networkConfig.mainnetFullNodeUrl : networkConfig.testnetFullNodeUrl;
      let apiUrl = isMainnet ? networkConfig.mainnetApiUrl : networkConfig.testnetApiUrl;

      // load Inc Wallet from local storage
      const incWallet = await setupIncWallet(isMainnet, chainUrl, apiUrl);
      dispatch(loadAccountsSuccess(incWallet));
      if (reloadBalances) {
        dispatch(loadTokensInfoThunk());
      }
    } catch (e) {
      console.log('error occured while loading accounts: ', e);
      dispatch(loadAccountsFailure(e));
    }
    dispatch(countDownRequests());
  };
}

export async function enableMetaMask() {
  let isMetaMaskEnabled = false;
  let metaMaskRequiredMess = null;
  let metaMaskAccounts = null;
  let chainId = 0;
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      const accounts = await window.ethereum.enable();
      if (!accounts || accounts.length === 0) {
        return false;
      }
      isMetaMaskEnabled = true;
      metaMaskAccounts = accounts;
      chainId = window.ethereum.chainId;
      if (chainId !== "0x2a") {
        metaMaskRequiredMess = "Only Kovan testnet supported on pstore!";
      }
    } catch (error) {
      metaMaskRequiredMess = "App error can not connect to metamask. Please try again";
      if (error.code === -32002) {
        metaMaskRequiredMess = "Please check meta mask extension to give us permission";
      }
      isMetaMaskEnabled = false;
      metaMaskAccounts = null;
    }
  } else {
    metaMaskRequiredMess = "Need meta mask installed and enabled to use awesome features";
    isMetaMaskEnabled = false;
    metaMaskAccounts = null;
  }
  return {
    isMetaMaskEnabled: isMetaMaskEnabled,
    metaMaskRequiredMess: metaMaskRequiredMess,
    metaMaskAccounts: metaMaskAccounts,
    chainId: chainId,
  };
}