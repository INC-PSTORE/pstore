/*
* deploy middlewares
*/

import Web3 from 'web3';

import {
  makeCall,
  buildOptions,
  handleSuccess,
  handleFailure,
} from '../../utils/api-call';

import {
  getLatestUnsuccessfulDeploySuccess,
  getLatestUnsuccessfulDeployFailed,
  refreshDeployFailure,
  updateEthTxInfo,
  changeStep,
  updateValidateForm,
} from './actions';
import {
  getLatestUnsuccessfulDeployApiRoute,
  updateEthRawTxDeployByID,
  getETHTransactionInfoApiRoute,
  getCreateDeployApiRoute,
  getDeployByIdRoute,
} from '../../utils/api-routes';

import {
  getETHFullnodeHost,
  getIncognitoContractAddr,
} from '../../common/utils';

import {
  HANDLE_FAILURE_GLOBALLY,
} from '../App/constants'
import {
  createRawTxForBurningDepositToSC,
  getAccountByName,
  getAccountByPrivateKey,
  getBalanceByToken,
  incCreateRawTx
} from "../../services/incognito/wallet";
import {incToNanoAmount} from "../../utils/convert";
import {countDownRequests, countUpRequests} from "../App/actions";
import {DEFAULT_PRV_FEE, ETH_DEPLOY_SUCCESS, INC_TRANSACTION_REJECTED} from "../../common/constants";
// TODO
export function refreshDeployStepThunk(incognitoAccount) {
  return async (dispatch, getState) => {
    let deploy;
    if (!deploy) {
      try {
        const options = await buildOptions('GET');
        deploy = await makeCall(
          dispatch,
          getLatestUnsuccessfulDeployApiRoute(incognitoAccount.address),
          options,
        );

        dispatch(getLatestUnsuccessfulDeploySuccess(deploy));
      } catch (e) {
        console.log('error occured while calling refresh deploy thunk api: ', e);
        dispatch(refreshDeployFailure(e));
      }
    }
  };
}

export function getDeployById(deployId) {
  return async (dispatch, getState) => {
    try {
      const options = await buildOptions('GET');
      const deploy = await makeCall(
        dispatch,
        getDeployByIdRoute(deployId),
        options,
      );
      if (deploy) {
        let ethTxInfo = null
        if (deploy.ethDeployTxID !== '') {
          // update eth Deploy tx status
          try {
            const options = await buildOptions('GET');
            ethTxInfo = await makeCall(
              dispatch,
              getETHTransactionInfoApiRoute(deploy.ethDeployTxID),
              options,
            );
            dispatch(updateEthTxInfo(ethTxInfo))
          } catch (e) {
            console.log('error occured while calling getETHTransactionInfo api: ', e);
            dispatch(refreshDeployFailure(e));
          }
        }
      }
      if (deploy.status === ETH_DEPLOY_SUCCESS) {
        dispatch(changeStep(2));
      }
      dispatch(getLatestUnsuccessfulDeploySuccess(deploy));
    } catch (e) {
      console.log('error occured while calling getDeployById api: ', e);
    }
  };
}

export function getLatestUnsuccessfulDeployThunk(incAddress) {
  return async (dispatch, getState) => {
    let ethTxInfo = null;
    let deploy = null;
    let step = 0;
    try {
      const options = await buildOptions('GET');
      deploy = await makeCall(
        dispatch,
        getLatestUnsuccessfulDeployApiRoute(incAddress),
        options,
      );
      if (deploy) {
        step = 1;
        if (deploy.status > INC_TRANSACTION_REJECTED) {
          if (deploy.ethDeployTxID !== '') {
            // update eth Deploy tx status
            try {
              const options = await buildOptions('GET');
              ethTxInfo = await makeCall(
                dispatch,
                getETHTransactionInfoApiRoute(deploy.ethDeployTxID),
                options,
              );
            } catch (e) {
              console.log('error occured while calling getETHTransactionInfo api: ', e);
              dispatch(refreshDeployFailure(e));
            }
          }
        }
      }
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulDeploy api: ', e);
      dispatch(getLatestUnsuccessfulDeployFailed(e));
    }
    dispatch(getLatestUnsuccessfulDeploySuccess(deploy));
    dispatch(updateEthTxInfo(ethTxInfo));
    dispatch(changeStep(step));
  };
}

export function submitDeployToSC(ethAccount, deployObject) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      ethAccount = {address: accounts[0]};
      const incContractAddr = getIncognitoContractAddr();
      const web3 = new Web3(getETHFullnodeHost());
      const txCount = await web3.eth.getTransactionCount(ethAccount.address);

      let options = await buildOptions('PUT', {
      });
      const deployRes = await makeCall(
        dispatch,
        updateEthRawTxDeployByID(deployObject.deployId),
        options,
      );
      dispatch(getLatestUnsuccessfulDeploySuccess(deployRes));
      if (deployRes.ethDeployTxID !== '') {
        // update eth Deploy tx status
        let ethTxInfo = null;
        const options = await buildOptions('GET');
        ethTxInfo = await makeCall(
          dispatch,
          getETHTransactionInfoApiRoute(deployRes.ethDeployTxID),
          options,
        );
        dispatch(updateEthTxInfo(ethTxInfo))
      }
    } catch (e) {
      console.log('error occured while run Deploy thunk api: ', e);
      dispatch(getLatestUnsuccessfulDeployFailed(e));
    }
    dispatch(countDownRequests());
  };
}

export function burnToDeploy(formInfo, privateIncAccountKey) {
  return async (dispatch, getState) => {
    const state = getState();
    dispatch(countUpRequests());
    const {tokenId, amountToBurn} = formInfo;
    // validate fill here
    if (tokenId === '') {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({tokenId: {isError: true, message: "Token type must be selected"}}));
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "Coin must be selected",
      };
    }
    // TODO: get eth from global state
    // const externalAddress = '0xfd94c46ab8dcf0928d5113a6feaa925793504e16';
    const externalAddress = state.app.generatedETHAccFromIncAcc.address;

    // build incognito burn raw tx
    const privateIncAccount = getAccountByPrivateKey(privateIncAccountKey.privateKey);
    const tokenInstance = await privateIncAccount.getFollowingPrivacyToken(tokenId);
    if (!tokenInstance) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({tokenId: {isError: true, message: "Token type is invalid!"}}));
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "Token is invalid",
      };
    }
    const tokenBalance = await getBalanceByToken(tokenInstance);
    const prvBalance = await getBalanceByToken(privateIncAccount.nativeToken);
    // check balance
    const burnAmountInNano = incToNanoAmount(amountToBurn, tokenInstance.bridgeInfo && tokenInstance.bridgeInfo.pDecimals || 0);
    if (burnAmountInNano > tokenBalance || burnAmountInNano <= 0) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({amount: {isError: true, message: "Insufficient balance"}}));
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "Balance not sufficient",
      };
    }

    // check prv balance
    if (prvBalance < DEFAULT_PRV_FEE) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({snackBar: {isError: true, message: "PRV not enough to pay fee"}}));
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "PRV Balance not sufficient",
      };
    }

    const base58CheckEncodeData = await createRawTxForBurningDepositToSC(tokenInstance, externalAddress, burnAmountInNano);
    if (!base58CheckEncodeData) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({snackBar: {isError: true, message: "Create raw burning tx failed"}}));
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "Create raw burning tx failed",
      };
    }

    // store tx hash to db
    try {
      const options = await buildOptions('POST', {
        incAddressStr: privateIncAccountKey.address,
        ethDeployTxID: "",
        burnToDeployTxID: "",
        burnToDeployProof: "",
        extNetworkTokenId: "",
        incNetworkTokenId: "",
        incBurnRawTx: base58CheckEncodeData,
        ethDeployRawTx: "",
      });
      const deployRes = await makeCall(
        dispatch,
        getCreateDeployApiRoute(),
        options,
      );

      dispatch(getLatestUnsuccessfulDeploySuccess(deployRes));
      dispatch(changeStep(1));
      // handleSuccess(dispatch, getProfilesListSuccess, profilesList);
    } catch (e) {
      console.log('error occured while calling shielding creation: ', e);
      // await handleFailure(
      //   dispatch,
      //   getProfilesListFailure,
      //   handleFailureGlobally,
      //   e,
      // );
    }
    dispatch(countDownRequests());
  }
}
