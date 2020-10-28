/*
 * Unshield Page actions
 */

import {
  CHANGE_SELECTED_PTOKEN,
  CHANGE_AMOUNT_TO_UNSHIELD,
  UPDATE_STEP, DO_NOTHING,
  CHANGE_ETH_ADDRESS_TO_UNSHIELD,
  GET_LATEST_UNSUCCESSFUL_UNSHIELD_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_UNSHIELD_FAILURE,
  REFRESH_UNSHIELD_FAILURE,
  UPDATE_INC_TX_INFO,
  UPDATE_ETH_TX_INFO,
  UPDATE_VALIDATE_INPUT,
  SKIP_FORM,
  TOOL_TIP_HANDLER,
} from './constants';

// using name as key temporary
export function changeSelectedToken(tokenId) {
  return {
    type: CHANGE_SELECTED_PTOKEN,
    tokenId,
  };
}

export function changeStep(stepNumber) {
  return {
    type: UPDATE_STEP,
    stepNumber,
  }
}

export function changeAmount(amount) {
  if(!isNaN(parseFloat(amount))) {
    return {
      type: CHANGE_AMOUNT_TO_UNSHIELD,
      amount,
    }
  } else {
    return {
      type: DO_NOTHING,
    }
  }
}

export function changeEthAddress(ethAddress) {
  return {
    type: CHANGE_ETH_ADDRESS_TO_UNSHIELD,
    ethAddress,
  }
}

// export function getLatestUnsuccessfulUnshield() {
//   return {
//     type: GET_LATEST_UNSUCCESSFUL_UNSHIELD,
//   };
// }

export function getLatestUnsuccessfulUnshieldSuccess(unshield) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_UNSHIELD_SUCCESS,
    unshield,
  };
}

export function getLatestUnsuccessfulUnshieldFailed(error) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_UNSHIELD_FAILURE,
    error,
  }
}

export function refreshUnsieldFailure(error) {
  return {
    type: REFRESH_UNSHIELD_FAILURE,
    error,
  }
}

export function updateEthTxInfo(ethTxInfo) {
  return {
    type: UPDATE_ETH_TX_INFO,
    ethTxInfo,
  }
}

export function updateIncTxInfo(incTxInfo) {
  return {
    type: UPDATE_INC_TX_INFO,
    incTxInfo,
  }
}

export function updateValidateForm(validateForm) {
  return {
    type: UPDATE_VALIDATE_INPUT,
    validateForm,
  }
}

export function updateSkipForm(skipForm) {
  return {
    type: SKIP_FORM,
    skipForm,
  }
}

export function updateToolTip(isOpenToolTip) {
  return {
    type: TOOL_TIP_HANDLER,
    isOpenToolTip,
  }
}
