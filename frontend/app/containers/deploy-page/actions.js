/*
 * Deploy Page actions
 */

import {
  CHANGE_SELECTED_PTOKEN,
  CHANGE_AMOUNT_TO_DEPLOY,
  UPDATE_STEP, DO_NOTHING,
  GET_LATEST_UNSUCCESSFUL_DEPLOY_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_DEPLOY_FAILURE,
  REFRESH_DEPLOY_FAILURE,
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
      type: CHANGE_AMOUNT_TO_DEPLOY,
      amount,
    }
  } else {
    return {
      type: DO_NOTHING,
    }
  }
}

export function getLatestUnsuccessfulDeploySuccess(deploy) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_DEPLOY_SUCCESS,
    deploy,
  };
}

export function getLatestUnsuccessfulDeployFailed(error) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_DEPLOY_FAILURE,
    error,
  }
}

export function refreshDeployFailure(error) {
  return {
    type: REFRESH_DEPLOY_FAILURE,
    error,
  }
}

export function updateEthTxInfo(ethTxInfo) {
  return {
    type: UPDATE_ETH_TX_INFO,
    ethTxInfo,
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