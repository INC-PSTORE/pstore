/*
 * Shielding Page actions
 */

import {
  CHANGE_SELECTED_TOKEN,
  CHANGE_AMOUNT,
  GET_LATEST_UNSUCCESSFUL_SHIELDING,
  GET_LATEST_UNSUCCESSFUL_SHIELDING_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_SHIELDING_FAILURE,
  REFRESH_SHIELDING_PROOF_STEP,
  REFRESH_SHIELDING_PROOF_STEP_SUCCESS,
  REFRESH_SHIELDING_PROOF_STEP_FAILURE,
  UPDATE_SHIELDING,
  UPDATE_SHIELDING_SUCCESS,
  UPDATE_SHIELDING_FAILURE,
  INSUFFICIENT_BALANCES,
  SKIP_FORM, TOOL_TIP_HANDLER,
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

export function getLatestUnsuccessfulShielding() {
  return {
    type: GET_LATEST_UNSUCCESSFUL_SHIELDING,
  };
}

export function getLatestUnsuccessfulShieldingSuccess(shielding) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_SHIELDING_SUCCESS,
    shielding,
  };
}

export function getLatestUnsuccessfulShieldingFailure(error) {
  return {
    type: GET_LATEST_UNSUCCESSFUL_SHIELDING_FAILURE,
    error,
  };
}

export function refreshShieldingProofStep() {
  return {
    type: REFRESH_SHIELDING_PROOF_STEP,
  };
}

export function refreshShieldingProofStepSuccess(shielding, ethTxInfo) {
  return {
    type: REFRESH_SHIELDING_PROOF_STEP_SUCCESS,
    shielding,
    ethTxInfo,
  };
}

export function refreshShieldingProofStepFailure(error) {
  return {
    type: REFRESH_SHIELDING_PROOF_STEP_FAILURE,
    error,
  };
}

export function updateShielding() {
  return {
    type: UPDATE_SHIELDING,
  };
}

export function updateShieldingSuccess(shielding) {
  return {
    type: UPDATE_SHIELDING_SUCCESS,
    shielding,
  };
}

export function updateShieldingFailure(error) {
  return {
    type: UPDATE_SHIELDING_FAILURE,
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