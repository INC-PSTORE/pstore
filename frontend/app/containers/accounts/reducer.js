/*
 * Accounts reducer
 */

import {
  SET_ETH_PRIVATE_KEY,
  SET_PRIV_INC_PRIVATE_KEY,
  SET_TEMP_INC_PRIVATE_KEY

} from './constants';

// The initial state of the SegmentBuilder
export const initialState = {
  ethPrivateKey: '',
  privIncPrivateKey: '',
  tempIncPrivateKey: '',
};

// function initWalletScreen(state, action) {
//   const {initWalletScreen} = action;
//   state.selectWalletInit = initWalletScreen % 3;
//   return {
//     ...state,
//   }
// }

export function setETHPrivateKey(state, action) {
  const { privateKey } = action;
  state.ethPrivateKey = privateKey;
  return {
    ...state,
  }
}

function setPrivIncPrivateKey(state, action) {
  const { privateKey } = action;
  state.privIncPrivateKey = privateKey;
  return {
    ...state,
  }
}

function setTempIncPrivateKey(state, action) {
  const { privateKey } = action;
  state.tempIncPrivateKey = privateKey;
  return {
    ...state,
  }
}


// function showPrivateKeyReducer(state, action) {
//   const {showPrivateKey} = action;
//   state.showPrivateKey = showPrivateKey;
//   return {
//     ...state,
//   }
// }
//
// function moutedDone(state) {
//   state.isDidmounted = true;
//   return {
//     ...state,
//   }
// }
//
// function generateIncWallet(state, action) {
//   return {
//     ...state,
//     incWallet: action.incWallet
//   }
// }

function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ETH_PRIVATE_KEY:
      return setETHPrivateKey(state, action);
    case SET_PRIV_INC_PRIVATE_KEY:
      return setPrivIncPrivateKey(state, action);
    case SET_TEMP_INC_PRIVATE_KEY:
      return setTempIncPrivateKey(state, action);
    default:
      return state;
  }
}

export default accountsReducer;
