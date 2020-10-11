/*
* Shielding middlewares
*/

import Web3 from 'web3';

import {
  makeCall,
  buildOptions,
  handleSuccess,
  handleFailure,
} from '../../utils/api-call';

import {
  getLatestUnsuccessfulUnshieldSuccess,
  getLatestUnsuccessfulUnshieldFailed,
  refreshUnsieldFailure,
  updateEthTxInfo,
  changeStep,
  updateValidateForm,
} from './actions';
import {
  getLatestUnsuccessfulUnshieldApiRoute,
  updateEthRawTxUnshieldByID,
  getETHTransactionInfoApiRoute,
  getCreateUnshieldApiRoute,
  getUnshieldByIdRoute,
} from '../../utils/api-routes';

import {
  getETHFullnodeHost,
  getIncognitoContractAddr,
} from '../../common/utils';

import {
  HANDLE_FAILURE_GLOBALLY,
} from '../App/constants'
import {
  createRawTxForBurningToken,
  getAccountByName,
  getAccountByPrivateKey,
  getBalanceByToken,
  incCreateRawTx
} from "../../services/incognito/wallet";
import {incToNanoAmount} from "../../utils/convert";
import {countDownRequests, countUpRequests} from "../App/actions";
import {DEFAULT_PRV_FEE, ETH_WITHDRAW_SUCCESS, INC_TRANSACTION_REJECTED} from "../../common/constants";
// TODO
export function refreshUnshieldStepThunk(incognitoAccount) {
  return async (dispatch, getState) => {
    let unshield;
    if (!unshield) {
      try {
        const options = await buildOptions('GET');
        unshield = await makeCall(
          dispatch,
          getLatestUnsuccessfulUnshieldApiRoute(incognitoAccount.address),
          options,
        );

        dispatch(getLatestUnsuccessfulUnshieldSuccess(unshield));
      } catch (e) {
        console.log('error occured while calling refresh unsheild thunk api: ', e);
        dispatch(refreshUnsieldFailure(e));
      }
    }
  };
}

export function getUnshieldById(unshieldId) {
  return async (dispatch, getState) => {
    try {
      const options = await buildOptions('GET');
      const unshield = await makeCall(
        dispatch,
        getUnshieldByIdRoute(unshieldId),
        options,
      );
      if (unshield) {
        let ethTxInfo = null
        if (unshield.ethWithdrawTxID !== '') {
          // update eth withdraw tx status
          try {
            const options = await buildOptions('GET');
            ethTxInfo = await makeCall(
              dispatch,
              getETHTransactionInfoApiRoute(unshield.ethWithdrawTxID),
              options,
            );
            dispatch(updateEthTxInfo(ethTxInfo))
          } catch (e) {
            console.log('error occured while calling getETHTransactionInfo api: ', e);
            dispatch(refreshUnsieldFailure(e));
          }
        }
      }
      if (unshield.status === ETH_WITHDRAW_SUCCESS) {
        dispatch(changeStep(2));
      }
      dispatch(getLatestUnsuccessfulUnshieldSuccess(unshield));
    } catch (e) {
      console.log('error occured while calling getUnshieldById api: ', e);
    }
  };
}

export function getLatestUnsuccessfulUnshieldThunk(incAddress) {
  return async (dispatch, getState) => {
    let ethTxInfo = null;
    let unshield = null;
    let step = 0;
    try {
      const options = await buildOptions('GET');
      unshield = await makeCall(
        dispatch,
        getLatestUnsuccessfulUnshieldApiRoute(incAddress),
        options,
      );
      if (unshield) {
        step = 1;
        if (unshield.status > INC_TRANSACTION_REJECTED) {
          if (unshield.ethWithdrawTxID !== '') {
            // update eth withdraw tx status
            try {
              const options = await buildOptions('GET');
              ethTxInfo = await makeCall(
                dispatch,
                getETHTransactionInfoApiRoute(unshield.ethWithdrawTxID),
                options,
              );
            } catch (e) {
              console.log('error occured while calling getETHTransactionInfo api: ', e);
              dispatch(refreshUnsieldFailure(e));
            }
          }
        }
      }
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(getLatestUnsuccessfulUnshieldFailed(e));
    }
    dispatch(getLatestUnsuccessfulUnshieldSuccess(unshield));
    dispatch(updateEthTxInfo(ethTxInfo));
    dispatch(changeStep(step));
  };
}

export function withdrawThunk(ethAccount, unshieldObject) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const incContractAddr = getIncognitoContractAddr();
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      ethAccount = {address: accounts[0]};
      const web3 = new Web3(getETHFullnodeHost());
      const txCount = await web3.eth.getTransactionCount(ethAccount.address);
      let options = await buildOptions('PUT', {});
      const unshieldRes = await makeCall(
        dispatch,
        updateEthRawTxUnshieldByID(unshieldObject.UnshieldId),
        options,
      );
      dispatch(getLatestUnsuccessfulUnshieldSuccess(unshieldRes));
      if (unshieldRes.ethWithdrawTxID !== '') {
        // update eth withdraw tx status
        let ethTxInfo = null;
        const options = await buildOptions('GET');
        ethTxInfo = await makeCall(
          dispatch,
          getETHTransactionInfoApiRoute(unshieldRes.ethWithdrawTxID),
          options,
        );
        dispatch(updateEthTxInfo(ethTxInfo))
      }
    } catch (e) {
      console.log('error occured while run withdraw thunk api: ', e);
      dispatch(getLatestUnsuccessfulUnshieldFailed(e));
    }
    dispatch(countDownRequests());
  };
}

export function burnToUnshield(formInfo, privateIncAccountKey) {
  return async (dispatch, getState) => {
    const web3 = new Web3();
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
    if (!web3.utils.isAddress(formInfo.receiveEthAddress.toLowerCase())) {
      dispatch(countDownRequests());
      return {
        type: HANDLE_FAILURE_GLOBALLY,
        error: "Invalid Ethereum address",
      };
    }
    const externalAddress = formInfo.receiveEthAddress.toLowerCase().replace("0x", "");

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

    const base58CheckEncodeData = await createRawTxForBurningToken(tokenInstance, externalAddress, burnAmountInNano);
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
        ethAddressStr: formInfo.receiveEthAddress.toLowerCase(),
        incAddressStr: privateIncAccountKey.address,
        ethWithdrawTxID: "",
        burnToWithdrawTxID: "",
        burnToWithdrawProof: "",
        extNetworkTokenId: "",
        incNetworkTokenId: "",
        incBurnRawTx: base58CheckEncodeData,
        ethWithdrawRawTx: "",
      });
      const unshieldRes = await makeCall(
        dispatch,
        getCreateUnshieldApiRoute(),
        options,
      );

      dispatch(getLatestUnsuccessfulUnshieldSuccess(unshieldRes));
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
