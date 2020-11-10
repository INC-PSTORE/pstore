/*
 * UndeployPage Page actions
 */

import {
  CHANGE_SELECTED_TOKEN,
  CHANGE_AMOUNT,
  GET_LATEST_UNSUCCESSFUL_UNDEPLOY_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_UNDEPLOY_FAILURE,
  REFRESH_UNDEPLOY_PROOF_STEP_SUCCESS,
  REFRESH_UNDEPLOY_PROOF_STEP_FAILURE,
  UPDATE_UNDEPLOY_SUCCESS,
  UPDATE_UNDEPLOY_FAILURE,
  INSUFFICIENT_BALANCES,
  SKIP_FORM,
  TOOL_TIP_HANDLER,
  UPDATE_VALIDATE_INPUT
} from './constants';

export function changeSelectedToken(selectedToken) {
  return {
    type: CHANGE_SELECTED_TOKEN,
    selectedToken,
  };
}

export function changeAmount(amount) {
  return {
    type: CHANGE_AMOUNT,
    amount,
  };
}

export function getLatestUnsuccessfulUndeploySuccess(undeploy) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_UNDEPLOY_SUCCESS,
    undeploy,
  };
}

export function getLatestUnsuccessfulUndeployFailure(error) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_UNDEPLOY_FAILURE,
    error,
  };
}

export function refreshUndeployProofStep() {
  return {
    type: REFRESH_UNDEPLOY_PROOF_STEP,
  };
}

export function refreshUndeployProofStepSuccess(undeploy, ethTxInfo) {
  return {
    type: REFRESH_UNDEPLOY_PROOF_STEP_SUCCESS,
    undeploy,
    ethTxInfo,
  };
}

export function refreshUndeployProofStepFailure(error) {
  return {
    type: REFRESH_UNDEPLOY_PROOF_STEP_FAILURE,
    error,
  };
}

export function updateUndeploySuccess(undeploy) {
  return {
    type: UPDATE_UNDEPLOY_SUCCESS,
    undeploy,
  };
}

export function updateUndeployFailure(error) {
  return {
    type: UPDATE_UNDEPLOY_FAILURE,
    error,
  };
}

export function insufficientBalances(insufficientBalancesInfo) {
  return {
    type: INSUFFICIENT_BALANCES,
    insufficientBalancesInfo,
  };
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

export function updateValidateForm(validateForm) {
  return {
    type: UPDATE_VALIDATE_INPUT,
    validateForm,
  }
}