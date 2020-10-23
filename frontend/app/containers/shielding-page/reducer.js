/*
 * ShieldingPage reducer
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
  INSUFFICIENT_BALANCES, SKIP_FORM, TOOL_TIP_HANDLER,
} from './constants';
import { CardActions } from '@material-ui/core';

// The initial state of the ShieldingPage
export const initialState = {
  error: null,
  activeStep: 1,
  formInfo: {
    extTokenId: '',
    incTokenId: '',
    eDecimals: 0,
    amount: 0,
  },
  latestUnsuccessfulShielding: null,
  ethTxInfo: null,
  insufficientBalancesInfo: null,
  refresher: null,
  skipForm: null,
  isOpenToolTip: false,
};

function updateFormInfo(state, action, fieldName) {
  const formInfo = state.formInfo;
  return {
    ...state,
    formInfo: {
      ...formInfo,
      [fieldName]: action[fieldName],
    },
  };
}

function updateSelectedToken(state, action) {
  const formInfo = state.formInfo;
  return {
    ...state,
    formInfo: {
      ...formInfo,
      extTokenId: action.selectedToken.extTokenId,
      incTokenId: action.selectedToken.incTokenId,
      eDecimals: action.selectedToken.eDecimals,
    },
  };
}

function shieldingReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SELECTED_TOKEN:
      return updateSelectedToken(state, action);

    case CHANGE_AMOUNT:
      return updateFormInfo(state, action, 'amount');

    case GET_LATEST_UNSUCCESSFUL_SHIELDING:
      return state;

    case GET_LATEST_UNSUCCESSFUL_SHIELDING_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulShielding: action.shielding,
        error: null,
      };

    case GET_LATEST_UNSUCCESSFUL_SHIELDING_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case REFRESH_SHIELDING_PROOF_STEP:
      return state;

    case REFRESH_SHIELDING_PROOF_STEP_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case REFRESH_SHIELDING_PROOF_STEP_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulShielding: action.shielding,
        ethTxInfo: action.ethTxInfo,
        error: null,
      };

    case UPDATE_SHIELDING:
      return state;

    case UPDATE_SHIELDING_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulShielding: action.shielding,
        error: null,
        insufficientBalancesInfo: null,
      };

    case UPDATE_SHIELDING_FAILURE:
      return {
        ...state,
        error: action.error,
        insufficientBalancesInfo: null,
      };

    case INSUFFICIENT_BALANCES:
      return {
        ...state,
        insufficientBalancesInfo: action.insufficientBalancesInfo,
      };
    case SKIP_FORM:
      return {
        ...state,
        skipForm: action.skipForm,
      }
    case TOOL_TIP_HANDLER:
      return {
        ...state,
        isOpenToolTip: action.isOpenToolTip,
      }
    default:
      return state;
  }
}

export default shieldingReducer;
