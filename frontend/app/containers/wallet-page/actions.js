

import {
  LOAD_TOKENS_INFO_SUCCESS,
  SELECT_WALLET_TOKEN,
  CLOSE_TRANSFER_MODAL,
} from './constants';

export function loadTokensInfoSuccess(tokens) {
  return {
    type: LOAD_TOKENS_INFO_SUCCESS,
    tokens,
  }
}

export function selectWalletToken(token) {
  return {
    type: SELECT_WALLET_TOKEN,
    token,
  }
}

export function closeTransferModal() {
  return {
    type: CLOSE_TRANSFER_MODAL,
  }
}