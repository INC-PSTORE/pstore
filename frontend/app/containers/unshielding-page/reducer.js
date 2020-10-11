/*
 * Unshield Page reducer
 */

import {
  CHANGE_AMOUNT_TO_UNSHIELD,
  CHANGE_SELECTED_PTOKEN,
  UPDATE_STEP,
  GET_LATEST_UNSUCCESSFUL_UNSHIELD,
  GET_LATEST_UNSUCCESSFUL_UNSHIELD_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_UNSHIELD_FAILURE,
  CHANGE_ETH_ADDRESS_TO_UNSHIELD,
  UPDATE_INC_TX_INFO,
  UPDATE_ETH_TX_INFO,
  UPDATE_VALIDATE_INPUT,
} from './constants';

// The initial state of the ShieldingPage
export const initialState = {
  error: null,
  activeStep: 0,
  unshieldFormInfo: {
    tokenSymbol: '',
    tokenId: '',
    receiveEthAddress: '',
    amountToBurn: 0,
  },
  incBurnTxInfo: null,
  latestUnsuccessfulUnshield: null,
  ethTxInfo: null,
  validateForm: null,
};

function updateFormInfo(state, action) {
  const unshieldFormInfo = state.unshieldFormInfo;
  const newUnshieldFormInfo = {
    ...unshieldFormInfo,
    tokenId: action.tokenId,
  };
  return {
    ...state,
    unshieldFormInfo: newUnshieldFormInfo,
  };
}

function updateStep(state, action) {
  const {stepNumber} = action;
  return {
    ...state,
    activeStep: stepNumber
  }
}

function updateBurnToAddress(state, action) {
  const unshieldFormInfo = state.unshieldFormInfo;
  const newUnshieldFormInfo = {
    ...unshieldFormInfo,
    receiveEthAddress: action.ethAddress,
  };
  return {
    ...state,
    unshieldFormInfo: newUnshieldFormInfo,
  };
}

function updateAmountToBurn(state, action) {
  const unshieldFormInfo = state.unshieldFormInfo;
  const newUnshieldFormInfo = {
    ...unshieldFormInfo,
    amountToBurn: action.amount,
  };
  return {
    ...state,
    unshieldFormInfo: newUnshieldFormInfo,
  };
}

function unshieldReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SELECTED_PTOKEN:
      return updateFormInfo(state, action);
    case CHANGE_AMOUNT_TO_UNSHIELD:
      return updateAmountToBurn(state, action);
    case CHANGE_ETH_ADDRESS_TO_UNSHIELD:
      return updateBurnToAddress(state, action);
    case UPDATE_STEP:
      return updateStep(state, action);
    case UPDATE_ETH_TX_INFO:
      return {
        ...state,
        ethTxInfo: action.ethTxInfo,
      }
    case UPDATE_INC_TX_INFO:
      return {
        ...state,
        incBurnTxInfo: action.incTxInfo,
      }
    // case UPDATE_BURN_UNSHIELD_PROOF:
    //   return updateUnshieldProof(state, action);
    case GET_LATEST_UNSUCCESSFUL_UNSHIELD_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulUnshield: action.unshield,
      };
    case GET_LATEST_UNSUCCESSFUL_UNSHIELD_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    case UPDATE_VALIDATE_INPUT:
      return {
        ...state,
        validateForm: action.validateForm,
      }
    default:
      return state;
  }
}

export default unshieldReducer;