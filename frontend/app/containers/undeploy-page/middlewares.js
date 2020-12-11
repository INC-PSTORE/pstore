/*
* UndeployPage middlewares
*/

import Web3 from 'web3';
import {
  DEFAULT_PRV_FEE,
  ETH_DEPOSIT_FAILED, ETH_DEPOSITED_TO_INC_CONTRACT,
  ETH_DEPOSITING_TO_INC_CONTRACT, ETHER_ID, SHIELDING_PROOF_SUBMIT_REJECTED, SHIELDING_PROOF_SUBMITTING,
} from '../../common/constants';
import {
  filterByExtToken, getDefaultSupportedTokens,
  getETHFullnodeHost,
  getIncContractABI,
  getIncognitoContractAddr,
  getLocalStorageKeyUndeploy,
  signMessage,
} from '../../common/utils';

import {countDownRequests, countUpRequests} from '../App/actions';
import {buildOptions, makeCall} from '../../utils/api-call';
import {
  getPrepareProof,
  getPrepareUndeploySignDataApiRoute,
} from '../../utils/api-routes';

import {
  getLatestUnsuccessfulUndeployFailure,
  getLatestUnsuccessfulUndeploySuccess,
  refreshUndeployProofStepSuccess,
  updateUndeployFailure,
  updateUndeploySuccess,
  insufficientBalances,
  updateValidateForm,
  updateSkipForm,
} from './actions';
import {getAccountByPrivateKey, getBalanceByToken} from "../../services/incognito/wallet";

let isRunning = false;

export function refreshUndeployProofStepThunk(ethAccount) {
  return async (dispatch, getState) => {
    if (isRunning) {
      console.log("Previous thread still running, please wait");
      return;
    }
    isRunning = true;
    const web3 = new Web3(getETHFullnodeHost());
    let undeploy = getState().undeploy.latestUnsuccessfulUndeploy;
    let ethTxInfo = getState().undeploy.ethTxInfo;
    const incAccount = getState().app.privateIncAccount;
    const configNetwork = getState().app.configNetwork;
    const rpcEndpoint = configNetwork.isMainnet ? configNetwork.mainnetFullNodeUrl : configNetwork.testnetFullNodeUrl;
    const localStorageKey = getLocalStorageKeyUndeploy();
    let confirmations = 0;
    if (!undeploy) {
      undeploy = JSON.parse(localStorage.getItem(localStorageKey));
    }
    if (!undeploy || configNetwork.isMainnet !== (undeploy.network === 1)) {
      isRunning = false;
      return;
    }

    let ethTxid = undeploy.ethtx;
    if (!ethTxInfo && ethTxid) {
      ethTxInfo = await web3.eth.getTransaction(ethTxid);
    }
    if (!ethTxInfo) {
      isRunning = false;
      return;
    }
    let ethReceipt
    if (!ethTxInfo.status || ethTxInfo.status === 2) {
      ethReceipt = await web3.eth.getTransactionReceipt(ethTxid);
      if (!ethReceipt) {
        isRunning = false;
        return;
      }
      ethTxInfo.status = ethReceipt.status ? 1 : 0;
      ethTxInfo.blockNumber = ethReceipt.blockNumber;
    }

    if (ethTxInfo.status === 0) {
      undeploy.status = ETH_DEPOSIT_FAILED;
    }

    switch (undeploy.status) {
      case SHIELDING_PROOF_SUBMITTING:
      case ETH_DEPOSITED_TO_INC_CONTRACT:
        if (!undeploy.inctx) {
          undeploy.status = ETH_DEPOSITING_TO_INC_CONTRACT;
          isRunning = false;
          break;
        }
        try {
          const options3 = await buildOptions('POST', {
            "jsonrpc": "1.0",
            "method": "getbridgereqwithstatus",
            "params": [{
              "TxReqID": undeploy.inctx
            }],
            "id": 1
          });
          const getStatus = await makeCall(
            dispatch,
            rpcEndpoint,
            options3,
          );
          if (getStatus.Error === null && Number(getStatus.Result)) {
            // add padding status is 2
            undeploy.status = Number(getStatus.Result) + 2;
          }
        } catch (e) {
          dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
        }
        break;
      case ETH_DEPOSITING_TO_INC_CONTRACT:
        if (ethTxInfo && ethTxInfo.blockNumber && ethTxInfo.status === 1) {
          const currentHeight = await web3.eth.getBlockNumber();
          confirmations = (currentHeight - ethTxInfo.blockNumber) > 0 ? currentHeight - ethTxInfo.blockNumber : 0;
          if (confirmations > 15) {
            undeploy.status = ETH_DEPOSITED_TO_INC_CONTRACT;
            undeploy.confirmations = confirmations;
            localStorage.setItem(localStorageKey, JSON.stringify(undeploy));
            try {
              // get eth proof
              let prepareProofResp;
              try {
                const options1 = await buildOptions('POST', {
                  mainnet: configNetwork.isMainnet,
                  txHash: undeploy.ethtx,
                });
                prepareProofResp = await makeCall(
                  dispatch,
                  getPrepareProof(),
                  options1,
                );
              } catch (e) {
                console.log("Proof not available yet please wait");
                isRunning = false;
                return;
              }
              // submit proof to inc chain
              const privateIncAccount = getAccountByPrivateKey(incAccount.privateKey);
              const prvBalance = await getBalanceByToken(privateIncAccount.nativeToken);
              // check prv balance
              if (prvBalance < DEFAULT_PRV_FEE) {
                throw new Error("not enough PRV to pay fee");
              }
              const txHistory = await privateIncAccount.nativeToken.createRawTxForShieldingToken(undeploy.inctokenid, prepareProofResp.blockHash, prepareProofResp.txIndex, prepareProofResp.encNodeList, DEFAULT_PRV_FEE);
              undeploy.status = SHIELDING_PROOF_SUBMITTING;
              undeploy.inctx = txHistory.txId;
            } catch (e) {
              undeploy.status = SHIELDING_PROOF_SUBMIT_REJECTED;
              dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
            }
          }
        }
    }
    let newUndeploy = {
      status: undeploy.status,
      ethtx: undeploy.ethtx,
      inctx: undeploy.inctx,
      inctokenid: undeploy.inctokenid,
      network: undeploy.network,
      confirmations: confirmations,
    };
    dispatch(refreshUndeployProofStepSuccess(newUndeploy, ethTxInfo));
    localStorage.setItem(localStorageKey, JSON.stringify(newUndeploy));
    isRunning = false;
  };
}

export function getLatestUnsuccessfulUndeployThunk() {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      let undeploy = getState().undeploy.latestUnsuccessfulUndeploy;
      let configNetwork = getState().app.configNetwork;
      if (undeploy === null) {
        undeploy = JSON.parse(localStorage.getItem(getLocalStorageKeyUndeploy()));
      }
      if (undeploy && configNetwork.isMainnet === (undeploy.network === 1)) {
        dispatch(getLatestUnsuccessfulUndeploySuccess(undeploy));
      } else {
        dispatch(refreshUndeployProofStepSuccess(null, null));
      }
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulUndeploy: ', e);
      dispatch(getLatestUnsuccessfulUndeployFailure(e));
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
  txCount,
  isMainnet,
  connector,
) {
  let afterCommas = 6;
  if (formInfo.eDecimals < afterCommas) {
    afterCommas = formInfo.eDecimals;
  }
  const convertedAmount = formInfo.amount * (10 ** afterCommas);
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

  const incToken = filterByExtToken(getDefaultSupportedTokens(isMainnet), formInfo.extTokenId);
  if (!incToken) {
    throw new Error("Token is not supported");
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

  const txObject = {
    from: ethAccount.address,
    nonce: web3.utils.toHex(txCount),
    to: incContractAddr,
    data: wdrReqData,
  };
  let txId;
  if (connector) {
    txId = await connector.sendTransaction(txObject);
  } else {
    txId = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txObject],
    });
  }

  const undeployObjbect = {
    ethtx: txId,
    status: ETH_DEPOSITING_TO_INC_CONTRACT,
    inctokenid: incToken.incTokenId,
    network: isMainnet ? 1 : 0
  };
  localStorage.setItem(getLocalStorageKeyUndeploy(), JSON.stringify(undeployObjbect));
  dispatch(updateUndeploySuccess(undeployObjbect));
}

export function undeployThunk(ethAccount, tempIncAccount, privIncAccount, generatedETHAccFromIncAcc, formInfo) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const incContractAddr = getIncognitoContractAddr();
      const web3 = new Web3(getETHFullnodeHost());
      const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
      let accounts;
      const appState = getState().app;
      let connector;
      if (appState.metaMask.isMetaMaskEnabled) {
        accounts = appState.metaMask.metaMaskAccounts;
      } else if (appState.walletConnect.connector && appState.walletConnect.connector.connected) {
        accounts = appState.walletConnect.connectorAccounts;
        connector = appState.walletConnect.connector;
      }
      if (!accounts || accounts.length < 1) {
        throw new Error("No account connected");
      }
      const prvBalance = await getBalanceByToken(privIncAccount.nativeToken);
      // check prv balance
      if (prvBalance < DEFAULT_PRV_FEE) {
        throw new Error("PRV not enough to pay fee");
      }

      ethAccount = {address: accounts[0]};
      const txCount = await web3.eth.getTransactionCount(ethAccount.address);
      const configNetwork = getState().app.configNetwork;

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
        configNetwork.isMainnet,
        connector,
      );
    } catch (error) {
      console.log(`An error occured while undeloying - with details: ${error}`);
      dispatch(updateValidateForm({snackBar: {isError: true, message: error.toString()}}))
    }
    dispatch(countDownRequests());
  }
}

export function updateUndeployThunk(latestUnsuccessfulUndeploy, history) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      localStorage.removeItem(getLocalStorageKeyUndeploy());
      dispatch(updateUndeploySuccess(null));
      history.push('/wallet');
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulUndeploy api: ', e);
      dispatch(updateUndeployFailure(e));
    }
    dispatch(countDownRequests());
  };
}

export function updateUndeploySkipStepThunk(skipForm) {
  return async (dispatch, getState) => {
    try {
      const web3 = new Web3(getETHFullnodeHost());
      const transaction = await web3.eth.getTransaction(skipForm.ethTxId);
      if (!transaction) {
        throw new Error("Transaction not exist");
      }
      if (!transaction.input) {
        throw new Error("Transaction must be contract call transaction");
      }
      const configNetwork = getState().app.configNetwork;
      const callSCFunc = transaction.input.slice(0, 10);
      if (callSCFunc !== '0x87add440' || transaction.to.toLowerCase() !== getIncognitoContractAddr().toLowerCase()) {
        throw new Error("Invalid transaction hash");
      }
      const extTokenId = '0x' + transaction.input.slice(98, 138);
      const incToken = filterByExtToken(getDefaultSupportedTokens(configNetwork.isMainnet), extTokenId);
      if (!incToken) {
        throw new Error("Token is not supported");
      }
      let undeploy = {
        ethtx: skipForm.ethTxId,
        status: ETH_DEPOSITING_TO_INC_CONTRACT,
        inctokenid: incToken.incTokenId,
        network: configNetwork.isMainnet ? 1 : 0,
      };
      dispatch(refreshUndeployProofStepSuccess(undeploy, null));
      localStorage.setItem(getLocalStorageKeyUndeploy(), JSON.stringify(undeploy));
      dispatch(updateSkipForm(null));
    } catch (e) {
      let newSkipForm = {ethTxId: skipForm.ethTxId, isOpen: true, message: e.toString()};
      dispatch(updateSkipForm(newSkipForm));
    }
  }
}