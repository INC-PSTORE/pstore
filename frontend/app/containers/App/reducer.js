/*
 * App reducer
 */

import {
  CREATE_PRIVATE_INC_ACCOUNT,
  IMPORT_PRIVATE_INC_ACCOUNT,
  CREATE_TEMP_INC_ACCOUNT,
  IMPORT_TEMP_INC_ACCOUNT,
  UPDATE_ACCOUNT,
  LOAD_ACCOUNTS,
  LOAD_ACCOUNTS_SUCCESS,
  LOAD_ACCOUNTS_FAILURE,
  TOGGLE_INFO_DIALOG,
  TOGGLE_PAPPS_MENU_LIST,
  CLOSE_PAPPS_MENU_LIST,
  COUNT_UP_REQUESTS,
  COUNT_DOWN_REQUESTS,
  ENABLE_META_MASK_ACCOUNTS,
  SWITCH_NETWORK,
} from './constants';

import {
  PRIVATE_INC_ACC_NAME,
  TEMP_INC_ACC_NAME
} from "../accounts/constants";

import { getIncKeyAccountByName } from '../../services/incognito/wallet';
import { getKeysFromAccount } from '../../services/eth/wallet';
import { genETHAccFromIncPrivKey } from '../../common/utils';

// The initial state of the ShieldingPage
export const initialState = {
  error: null,
  isLoadWalletDone: false,
  tempIncAccount: {
    address: '',
    pubicKey: '',
    privateKey: '',
  },
  privateIncAccount: {
    address: '',
    pubicKey: '',
    privateKey: '',
  },
  generatedETHAccFromIncAcc: {
    address: '',
    pubicKey: '',
    privateKey: '',
  },
  isOpenedInfoDialog: false,
  isPappsMenuListOpened: false,
  requestings: 0,
  metaMask: {
    isMetaMaskEnabled: false,
    metaMaskRequiredMess: null,
    metaMaskAccounts: null,
    chainId: 1,
  },
  configNetwork: {
    isMainnet: false,
    // mainnet
    mainnetFullNodeUrl: "https://fullnode.incognito.best",
    mainnetApiUrl: "https://api.incognito.org",
    // mainnetVault: "0x97875355ef55ae35613029df8b1c8cf8f89c9066",
    // mainnetEthFullNode: "https://mainnet.infura.io/v3/34918000975d4374a056ed78fe21c517",

    // testnet
    testnetFullNodeUrl: "https://testnet1.incognito.org/fullnode",
    testnetApiUrl: "https://test-api2.incognito.org",
    // testnetVault: "0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86",
    // testnetEthFullNode: "https://kovan.infura.io/v3/34918000975d4374a056ed78fe21c517",
  },
};

function addPrivateIncAccount(state, action) {
  const { accountKey } = action;
  const ethWallet = genETHAccFromIncPrivKey(accountKey.privateKey);
  const generatedETHAccFromIncAcc = {
    address: ethWallet.getAddressString(),
    publicKey: ethWallet.getPublicKeyString().replace('0x', ''),
    privateKey: ethWallet.getPrivateKeyString().replace('0x', ''),
  };

  return {
    ...state,
    privateIncAccount : {
      address: accountKey.address,
      pubicKey: accountKey.publicKey,
      privateKey: accountKey.privateKey,
    },
    generatedETHAccFromIncAcc,
  }
}

function addTempIncAccount(state, action) {
  const { accountKey } = action;
  return {
    ...state,
    tempIncAccount : {
      address: accountKey.address,
      pubicKey: accountKey.publicKey,
      privateKey: accountKey.privateKey,
    }
  }
}

export function updateAccounts(state, { incWallet }) {
  const privateIncAccount = getIncKeyAccountByName(PRIVATE_INC_ACC_NAME, incWallet);
  const tempIncAccount = getIncKeyAccountByName(TEMP_INC_ACC_NAME, incWallet);

  let privIncAccount = {};
  let generatedETHAccFromIncAcc = {};
  let tIncAccount = {};

  if (privateIncAccount) {
    privIncAccount = {
      address: privateIncAccount.address,
      publicKey: privateIncAccount.publicKey,
      privateKey: privateIncAccount.privateKey,
    };

    const ethWallet = genETHAccFromIncPrivKey(privIncAccount.privateKey);
    generatedETHAccFromIncAcc = {
      address: ethWallet.getAddressString(),
      publicKey: ethWallet.getPublicKeyString().replace('0x', ''),
      privateKey: ethWallet.getPrivateKeyString().replace('0x', ''),
    };
  }

  if (tempIncAccount) {
    tIncAccount = {
      address: tempIncAccount.address,
      publicKey: tempIncAccount.publicKey,
      privateKey: tempIncAccount.privateKey,
    };
  }

  return {
    ...state,
    tempIncAccount: tIncAccount,
    privateIncAccount: privIncAccount,
    generatedETHAccFromIncAcc,
    isLoadWalletDone: true,
    isOpenedInfoDialog: !privIncAccount.privateKey,
  };
}

function appReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_PRIVATE_INC_ACCOUNT:
      return addPrivateIncAccount(state, action);
    case IMPORT_PRIVATE_INC_ACCOUNT:
      return addPrivateIncAccount(state, action);

    case CREATE_TEMP_INC_ACCOUNT:
      return addTempIncAccount(state, action);
    case IMPORT_TEMP_INC_ACCOUNT:
      return addTempIncAccount(state, action);

    case UPDATE_ACCOUNT:
      return updateAccounts(state, action);

    case LOAD_ACCOUNTS:
      return state;
    case LOAD_ACCOUNTS_SUCCESS:
      return updateAccounts(state, action);
    case LOAD_ACCOUNTS_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case TOGGLE_INFO_DIALOG:
      return {
        ...state,
        isOpenedInfoDialog: !state.isOpenedInfoDialog,
      };
    case TOGGLE_PAPPS_MENU_LIST:
      return {
        ...state,
        isPappsMenuListOpened: !state.isPappsMenuListOpened,
      };
    case CLOSE_PAPPS_MENU_LIST:
      return {
        ...state,
        isPappsMenuListOpened: false,
      };

    case COUNT_UP_REQUESTS:
      return {
        ...state,
        requestings: state.requestings + 1,
      };
    case COUNT_DOWN_REQUESTS:
      return {
        ...state,
        requestings: state.requestings - 1,
      };
    case ENABLE_META_MASK_ACCOUNTS:
      return {
        ...state,
        metaMask: {
          ...state.metaMask,
          isMetaMaskEnabled: action.metaMask.isMetaMaskEnabled,
          metaMaskRequiredMess: action.metaMask.metaMaskRequiredMess,
          metaMaskAccounts: action.metaMask.metaMaskAccounts,
          chainId: action.metaMask.chainId,
        }
      }
    case SWITCH_NETWORK:
      return {
        ...state,
        configNetwork: {
          ...state.configNetwork,
          isMainnet: action.isMainnet,
        }
      }
    default:
      return state;
  }
}

export default appReducer;
