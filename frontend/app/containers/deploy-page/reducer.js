/**
 * DeployPage reducers
 */

import {
  CHANGE_AMOUNT_TO_DEPLOY,
  CHANGE_SELECTED_PTOKEN,
  UPDATE_STEP,
  GET_LATEST_UNSUCCESSFUL_DEPLOY_SUCCESS,
  GET_LATEST_UNSUCCESSFUL_DEPLOY_FAILURE,
  UPDATE_INC_TX_INFO,
  UPDATE_ETH_TX_INFO,
  UPDATE_VALIDATE_INPUT,
} from './constants';

// The initial state of the ShieldingPage
export const initialState = {
  error: null,
  activeStep: 0,
  deployFormInfo: {
    tokenSymbol: '',
    tokenId: '',
    amountToBurn: 0,
  },
  incBurnTxInfo: null,
  latestUnsuccessfulDeploy: null,
  ethTxInfo: null,
  validateForm: null,
};

function updateFormInfo(state, action) {
  const deployFormInfo = state.deployFormInfo;
  const newDeployFormInfo = {
    ...deployFormInfo,
    tokenId: action.tokenId,
  };
  return {
    ...state,
    deployFormInfo: newDeployFormInfo,
  };
}

function updateStep(state, action) {
  const {stepNumber} = action;
  return {
    ...state,
    activeStep: stepNumber
  }
}

function updateAmountToBurn(state, action) {
  const deployFormInfo = state.deployFormInfo;
  const newDeployFormInfo = {
    ...deployFormInfo,
    amountToBurn: action.amount,
  };
  return {
    ...state,
    deployFormInfo: newDeployFormInfo,
  };
}

function deployReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SELECTED_PTOKEN:
      return updateFormInfo(state, action);
    case CHANGE_AMOUNT_TO_DEPLOY:
      return updateAmountToBurn(state, action);
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
    // case UPDATE_BURN_DEPLOY_PROOF:
    //   return updateDeployProof(state, action);
    case GET_LATEST_UNSUCCESSFUL_DEPLOY_SUCCESS:
      return {
        ...state,
        latestUnsuccessfulDeploy: action.deploy,
      };
    case GET_LATEST_UNSUCCESSFUL_DEPLOY_FAILURE:
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

export default deployReducer;