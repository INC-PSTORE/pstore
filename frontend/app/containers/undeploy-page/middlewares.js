/*
* UndeployPage middlewares
*/
// TODO
import Web3 from 'web3';
import {
  ETH_UNDEPLOYED_FROM_INC_CONTRACT,
  ETH_UNDEPLOYING_FROM_INC_CONTRACT,
  UNDEPLOY_FINISHED
} from '../../common/constants';
import {
  getETHFullnodeHost,
  getIncContractABI,
  getIncognitoContractAddr,
  signMessage,
} from '../../common/utils';

import { countDownRequests, countUpRequests } from '../../containers/App/actions';
import { buildOptions, makeCall } from '../../utils/api-call';
import {
  getETHTransactionInfoApiRoute,
  getLatestUnsuccessfulUndeployApiRoute,
  getCreateUndeployApiRoute,
  getPrepareUndeploySignDataApiRoute,
  getUpdateUndeployApiRoute,
} from '../../utils/api-routes';

import {
  getLatestUnsuccessfulUndeployFailure,
  getLatestUnsuccessfulUndeploySuccess,
  refreshUndeployProofStepFailure,
  refreshUndeployProofStepSuccess,
  updateUndeployFailure,
  updateUndeploySuccess,
  insufficientBalances,
} from './actions';

export function refreshUndeployProofStepThunk(ethAccount) {
  return async (dispatch, getState) => {
    let undeploy;
    try {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      ethAccount = {address: accounts[0]};
      const options = buildOptions('GET');
      undeploy = await makeCall(
        dispatch,
        getLatestUnsuccessfulUndeployApiRoute(ethAccount.address),
        options,
      );

    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulUndeploy api: ', e);
      dispatch(refreshUndeployProofStepFailure(e));
      dispatch(countDownRequests());
      return;
    }

    const ethUndeployTxId = undeploy.ethUndeployTxId;
    let ethTxInfo = null;
    if (ethUndeployTxId) {
      try {
        const options = await buildOptions('GET');
        ethTxInfo = await makeCall(
          dispatch,
          getETHTransactionInfoApiRoute(ethUndeployTxId),
          options,
        );
      } catch (e) {
        console.log('error occured while calling getETHTransactionInfo api: ', e);
        dispatch(refreshUndeployProofStepFailure(e));
      }
    }
    dispatch(refreshUndeployProofStepSuccess(undeploy, ethTxInfo));
  };
}

export function getLatestUnsuccessfulUndeployThunk(ethAccount) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    ethAccount = {address: accounts[0]};
    try {
      const options = buildOptions('GET');
      const undeploy = await makeCall(
        dispatch,
        getLatestUnsuccessfulUndeployApiRoute(ethAccount.address),
        options,
      );
      dispatch(getLatestUnsuccessfulUndeploySuccess(undeploy));
      // handleSuccess(dispatch, getProfilesListSuccess, profilesList);
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulUndeploy api: ', e);
      dispatch(getLatestUnsuccessfulUndeployFailure(e));
      // await handleFailure(
      //   dispatch,
      //   getProfilesListFailure,
      //   handleFailureGlobally,
      //   e,
      // );
    }
    dispatch(countDownRequests());
  };
}

async function undeploy(
  dispatch,
  web3,
  incContract,
  incContractAddr,
  ethAccount,
  formInfo,
  privIncAccount,
  generatedETHAccFromIncAcc,
  txCount
) {
  // const balance = await web3.eth.getBalance(ethAccount.address);
  let afterCommas = 6;
  if (formInfo.eDecimals < afterCommas) {
    afterCommas = formInfo.eDecimals;
  }
  const convertedAmount = formInfo.amount * (10 ** afterCommas);

  // if (convertedAmount < 1) { // depositing amount is too small
  //   dispatch(insufficientBalances({
  //     tokenId: ETHER_ID,
  //     requiredAmt: "",
  //     avaiAmt: balance,
  //   }));
  //   return;
  // }
  const remainingDecimals = web3.utils.toBN(formInfo.eDecimals - afterCommas);
  const undeployAmtInBN = web3.utils.toBN(convertedAmount).mul(web3.utils.toBN(10).pow(remainingDecimals));
  const undeployAmtInHex = web3.utils.toHex(undeployAmtInBN);
  const deployedBalance = await incContract.methods.getDepositedBalance(formInfo.extTokenId, generatedETHAccFromIncAcc.address).call();
  if (web3.utils.toBN(deployedBalance).cmp(undeployAmtInBN) === -1) {
    dispatch(insufficientBalances({
      tokenId: formInfo.extTokenId,
      requiredAmt: undeployAmtInBN,
      avaiAmt: deployedBalance,
    }));
    return;
  }

  let prepSignData;
  // prepare undeploy sign data
  const prepUndeploySignDataOptions = buildOptions('POST', {
    incPaymentAddrStr: privIncAccount.address,
    tokenIDStr: formInfo.extTokenId,
    amountHex: undeployAmtInHex,
  });
  prepSignData = await makeCall(
    dispatch,
    getPrepareUndeploySignDataApiRoute(),
    prepUndeploySignDataOptions,
  );
  const signature = signMessage(prepSignData.undeploySignData, generatedETHAccFromIncAcc.privateKey);
  const wdrReqData = incContract.methods.requestWithdraw(
    privIncAccount.address,
    formInfo.extTokenId,
    undeployAmtInHex,
    signature,
    '0x' + prepSignData.uniqTs,
  ).encodeABI();

  // store tx hash to db
  const createUndeployOptions = buildOptions('POST', {
    ethAddressStr: ethAccount.address,
    incAddressStr: privIncAccount.address,
    ethUndeployTxId: "",
    undeployedProofSubmitTxId: "",
    status: ETH_UNDEPLOYING_FROM_INC_CONTRACT,
    extNetworkTokenId: formInfo.extTokenId,
    incTetworkTokenId: formInfo.incTokenId,
  });
  await makeCall(
    dispatch,
    getCreateUndeployApiRoute(),
    createUndeployOptions,
  );
}

export function undeployThunk(ethAccount, tempIncAccount, privIncAccount, generatedETHAccFromIncAcc, formInfo) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const incContractAddr = getIncognitoContractAddr();
      const web3 = new Web3(getETHFullnodeHost());
      const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      ethAccount = {address: accounts[0]};
      const txCount = await web3.eth.getTransactionCount(ethAccount.address);

      await undeploy(
        dispatch,
        web3,
        incContract,
        incContractAddr,
        ethAccount,
        formInfo,
        privIncAccount,
        generatedETHAccFromIncAcc,
        txCount,
      );
    } catch (error) {
      console.log(`An error occured while undeloying - with details: ${error}`);
    }
    dispatch(getLatestUnsuccessfulUndeployThunk(ethAccount));
    dispatch(countDownRequests());
  }
}

export function updateUndeployThunk(latestUnsuccessfulUndeploy, history) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const options = buildOptions('PUT', {
        ...latestUnsuccessfulUndeploy,
        status: UNDEPLOY_FINISHED,
      });
      const undeploy = await makeCall(
        dispatch,
        getUpdateUndeployApiRoute(latestUnsuccessfulUndeploy.undeployId),
        options,
      );
      dispatch(updateUndeploySuccess(undeploy));
      // handleSuccess(dispatch, getProfilesListSuccess, profilesList);
      history.push('/wallet');
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulUndeploy api: ', e);
      dispatch(updateUndeployFailure(e));
      // await handleFailure(
      //   dispatch,
      //   getProfilesListFailure,
      //   handleFailureGlobally,
      //   e,
      // );
    }
    dispatch(countDownRequests());
  };
}
