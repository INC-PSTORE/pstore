/*
 * UndeployPage reducer
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
} from './constants';

// The initial state of the UndeployPage
export const initialState = {
  error: null,
  activeStep: 1,
  formInfo: {
    extTokenId: '',
    incTokenId: '',
    eDecimals: 0,
    amount: 0,
  },
  latestUnsuccessfulUndeploy: null,
  ethTxInfo: null,
  insufficientBalancesInfo: null,
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

function undeployReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SELECTED_TOKEN:
      return updateSelectedToken(state, action);

    case CHANGE_AMOUNT:
      return updateFormInfo(state, action, 'amount');

    case GET_LATEST_UNSUCCESSFUL_UNDEPLOY_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulUndeploy: action.undeploy,
        error: null,
      };

    case GET_LATEST_UNSUCCESSFUL_UNDEPLOY_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case REFRESH_UNDEPLOY_PROOF_STEP_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    case REFRESH_UNDEPLOY_PROOF_STEP_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulUndeploy: action.undeploy,
        ethTxInfo: action.ethTxInfo,
        error: null,
      };

    case UPDATE_UNDEPLOY_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulUndeploy: action.undeploy,
        error: null,
        insufficientBalancesInfo: null,
      };

    case UPDATE_UNDEPLOY_FAILURE:
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

    default:
      return state;
  }
}

export default undeployReducer;
