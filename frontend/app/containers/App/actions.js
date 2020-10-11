
import {
  HANDLE_FAILURE_GLOBALLY,
  UPDATE_ACCOUNT,
  CREATE_PRIVATE_INC_ACCOUNT,
  IMPORT_PRIVATE_INC_ACCOUNT,
  CREATE_TEMP_INC_ACCOUNT,
  IMPORT_TEMP_INC_ACCOUNT,
  CREATE_ETH_ACCOUNT,
  IMPORT_ETH_ACCOUNT,
  LOAD_ACCOUNTS,
  LOAD_ACCOUNTS_SUCCESS,
  LOAD_ACCOUNTS_FAILURE,
  TOGGLE_INFO_DIALOG,
  CLOSE_PAPPS_MENU_LIST,
  TOGGLE_PAPPS_MENU_LIST,
  COUNT_UP_REQUESTS,
  COUNT_DOWN_REQUESTS,
  ENABLE_META_MASK_ACCOUNTS,
 } from './constants';

import { getIncKeyAccountByName } from '../../services/incognito/wallet';
import { PRIVATE_INC_ACC_NAME, TEMP_INC_ACC_NAME } from '../accounts/constants';
import { createNewAccount, getIncKeyFromAccount, importAccount } from '../../services/incognito/wallet';
import { createNewETHAccount, getKeysFromAccount, importETHAccount } from '../../services/eth/wallet';

import { loadTokensInfoThunk } from '../wallet-page/middlewares';

export function handleFailureGlobally(error) {
  return {
    type: HANDLE_FAILURE_GLOBALLY,
    error,
  };
}

export function updateAccountsAction(incWallet, ethAccount) {
  const privateIncAccount = getIncKeyAccountByName(PRIVATE_INC_ACC_NAME, incWallet);
  const tempIncAccount = getIncKeyAccountByName(TEMP_INC_ACC_NAME, incWallet);

  const state = {
    type: UPDATE_ACCOUNT,
  };

  if (ethAccount && ethAccount.privateKey) {
    const keys = getKeysFromAccount(ethAccount);
    state.ethAccount = {
      address: keys.address,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    };
  }

  if (privateIncAccount) {
    state.privateIncAccount = {
      address: privateIncAccount.address,
      publicKey: privateIncAccount.publicKey,
      privateKey: privateIncAccount.privateKey,
    };
  }

  if (tempIncAccount) {
    state.tempIncAccount = {
      address: tempIncAccount.address,
      publicKey: tempIncAccount.publicKey,
      privateKey: tempIncAccount.privateKey,
    };
  }

  return state;
}

export function createPrivateIncAccountAction() {
  return async function(dispatch) {
    const account = await createNewAccount(PRIVATE_INC_ACC_NAME);
    dispatch({
      type: CREATE_PRIVATE_INC_ACCOUNT,
      accountKey: getIncKeyFromAccount(account)
    });
    dispatch(loadTokensInfoThunk());
  };
}

export function importPrivateIncAccountAction(privateKeyStr) {
  return async function(dispatch) {
    const account = await importAccount(PRIVATE_INC_ACC_NAME, privateKeyStr);
    dispatch({
      type: IMPORT_PRIVATE_INC_ACCOUNT,
      accountKey: getIncKeyFromAccount(account)
    });
    dispatch(loadTokensInfoThunk());
  };
}


export function createTempIncAccountAction() {
  return async function(dispatch) {
    const account = await createNewAccount(TEMP_INC_ACC_NAME);
    dispatch({
      type: CREATE_TEMP_INC_ACCOUNT,
      accountKey: getIncKeyFromAccount(account)
    })
  };
}

export function importTempIncAccountAction(privateKeyStr) {
  return async function(dispatch) {
    const account = await importAccount(TEMP_INC_ACC_NAME, privateKeyStr);

    dispatch({
      type: IMPORT_TEMP_INC_ACCOUNT,
      accountKey: getIncKeyFromAccount(account)
    })
  };
}

export function createETHAccountAction() {
  let ethAccount = createNewETHAccount();
  let ethAccountKey = getKeysFromAccount(ethAccount);
  return {
    type: CREATE_ETH_ACCOUNT,
    ethAccountKey,
  }
}

export function importETHAccountAction(privateKey) {
  let ethAccount = importETHAccount(privateKey);
  let ethAccountKey = getKeysFromAccount(ethAccount);

  return {
    type: IMPORT_ETH_ACCOUNT,
    ethAccountKey,
  }
}

export function loadAccounts() {
  return {
    type: LOAD_ACCOUNTS,
  }
}
export function loadAccountsSuccess(incWallet) {
  return {
    type: LOAD_ACCOUNTS_SUCCESS,
    incWallet,
  }
}
export function loadAccountsFailure(error) {
  return {
    type: LOAD_ACCOUNTS_FAILURE,
    error,
  }
}

export function toggleInfoDialog() {
  return {
    type: TOGGLE_INFO_DIALOG,
  }
}
export function togglePappsMenuList() {
  return {
    type: TOGGLE_PAPPS_MENU_LIST,
  }
}
export function closePappsMenuList() {
  return {
    type: CLOSE_PAPPS_MENU_LIST,
  }
}

export function countUpRequests() {
  return {
    type: COUNT_UP_REQUESTS,
  }
}

export function countDownRequests() {
  return {
    type: COUNT_DOWN_REQUESTS,
  }
}

export function updateMetaMask(metaMask) {
  return {
    type: ENABLE_META_MASK_ACCOUNTS,
    metaMask,
  }
}