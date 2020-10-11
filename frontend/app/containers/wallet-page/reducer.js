/*
 * WalletPage reducer
 */

import {
  LOAD_TOKENS_INFO_SUCCESS,
  SELECT_WALLET_TOKEN,
  CLOSE_TRANSFER_MODAL,
} from './constants';

// The initial state of the ShieldingPage
export const initialState = {
  error: null,
  tokens: [],
  isShowTransfer: false,
  selectedWalletToken: null,
};

function walletReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_TOKENS_INFO_SUCCESS:
      return {
        ...state,
        tokens: action.tokens,
      };

    case SELECT_WALLET_TOKEN:
      return {
        ...state,
        selectedWalletToken: action.token,
        isShowTransfer: true,
      };

    case CLOSE_TRANSFER_MODAL:
      return {
        ...state,
        selectedWalletToken: null,
        isShowTransfer: false,
      };

    default:
      return state;
  }
}

export default walletReducer;
