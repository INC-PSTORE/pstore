/*
* Shielding middlewares
*/

import Web3 from 'web3';
import {
  ETHER_ID,
  ETH_DEPOSITED_TO_INC_CONTRACT,
  ETH_DEPOSITING_TO_INC_CONTRACT,
  SHIELDING_PROOF_SUBMIT_REJECTED,
  SHIELDING_PROOF_SUBMITTING,
  ETH_DEPOSIT_FAILED,
  DEFAULT_PRV_FEE_VALIDATE_SHIELD,
} from '../../common/constants';
import {
  filterByExtToken,
  getDefaultSupportedTokens,
  getERC20ContractABI,
  getETHFullnodeHost,
  getIncContractABI,
  getIncognitoContractAddr, getLocalStorageKey, getWalletList,
} from '../../common/utils';

import {countDownRequests, countUpRequests} from '../App/actions';
import {buildOptions, makeCall} from '../../utils/api-call';
import {
  getPrepareProof,
} from '../../utils/api-routes';

import {
  getLatestUnsuccessfulShieldingFailure,
  getLatestUnsuccessfulShieldingSuccess,
  refreshShieldingProofStepSuccess,
  updateShieldingFailure,
  updateShieldingSuccess,
  insufficientBalances,
  updateSkipForm,
  updateValidateForm,
} from './actions';
import {getAccountByPrivateKey, getBalanceByToken} from "../../services/incognito/wallet";
import {incToNanoAmount} from "../../utils/convert";

let isRunning = false;

export function refreshShieldingProofStepThunk(ethAccount) {
  return async (dispatch, getState) => {
    if (isRunning) {
      console.log("Previous thread still running, please wait");
      return;
    }
    isRunning = true;
    const web3 = new Web3(getETHFullnodeHost());
    let shielding = getState().shielding.latestUnsuccessfulShielding;
    let ethTxInfo = getState().shielding.ethTxInfo;
    const configNetwork = getState().app.configNetwork;
    const rpcEndpoint = configNetwork.isMainnet ? configNetwork.mainnetFullNodeUrl : configNetwork.testnetFullNodeUrl;
    const localStorageKey = getLocalStorageKey();
    if (!shielding) {
      shielding = JSON.parse(localStorage.getItem(localStorageKey));
    }
    if (!shielding) {
      isRunning = false;
      return;
    }

    let ethTxid = shielding.ethtx;
    if (!ethTxInfo) {
      ethTxInfo = await web3.eth.getTransaction(ethTxid);
    }
    if (!ethTxInfo) {
      isRunning = false;
      return;
    }
    let ethReceipt
    if (!ethTxInfo.status|| ethTxInfo.status === 2) {
      ethReceipt = await web3.eth.getTransactionReceipt(ethTxid);
      if (!ethReceipt) {
        isRunning = false;
        return;
      }
      ethTxInfo.status = ethReceipt.status ? 1 : 0;
      ethTxInfo.blockNumber = ethReceipt.blockNumber;
    }

    if (ethTxInfo.status === 0) {
      shielding.status = ETH_DEPOSIT_FAILED;
    }

    switch (shielding.status) {
      case SHIELDING_PROOF_SUBMITTING:
      case ETH_DEPOSITED_TO_INC_CONTRACT:
        if (!shielding.inctx) {
          shielding.status = ETH_DEPOSITING_TO_INC_CONTRACT;
          isRunning = false;
          break;
        }
        try {
          const options3 = await buildOptions('POST', {
            "jsonrpc": "1.0",
            "method": "getbridgereqwithstatus",
            "params": [{
              "TxReqID": shielding.inctx
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
            shielding.status = Number(getStatus.Result) + 2;
          }
        } catch (e) {
          dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
        }
        break;
      case ETH_DEPOSITING_TO_INC_CONTRACT:
        if (ethTxInfo && ethTxInfo.blockNumber && ethTxInfo.status === 1) {
          const currentHeight = await web3.eth.getBlockNumber();
          if (currentHeight - ethTxInfo.blockNumber > 15) {
            shielding.status = ETH_DEPOSITED_TO_INC_CONTRACT;
            localStorage.setItem(localStorageKey, JSON.stringify(shielding));
            try {
              // get eth proof
              let prepareProofResp;
              try {
                const options1 = await buildOptions('POST', {
                  mainnet: configNetwork.isMainnet,
                  txHash: shielding.ethtx,
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
              // I'm reading incognitoJs to update this function to make it created from local, please bear with me this time
              // TODO create tx local and store before broadcast
              let isDelivered = false;
              const wallets = getWalletList();
              let numOfWalllet = wallets.length;
              let submitProofResponse;
              while (!isDelivered && (numOfWalllet - 1) !== 0) {
                numOfWalllet--;
                let deliverGuy = wallets[numOfWalllet];
                let options2 = await buildOptions('POST', {
                  "jsonrpc": "1.0",
                  "method": "createandsendtxwithissuingethreq",
                  "params": [
                    deliverGuy,
                    null,
                    -1,
                    0,
                    {
                      "IncTokenID": shielding.inctokenid,
                      "BlockHash": prepareProofResp.blockHash,
                      "ProofStrs": prepareProofResp.encNodeList,
                      "TxIndex": prepareProofResp.txIndex,
                    }
                  ],
                  "id": 1
                });
                submitProofResponse = await makeCall(
                  dispatch,
                  rpcEndpoint,
                  options2,
                );
                if (submitProofResponse.Error != null) {
                  if (submitProofResponse.Error.StackTrace.includes("not enough coin for native fee") || submitProofResponse.Error.StackTrace.includes("Reject Double Spend With Current")) {
                    continue;
                  }
                  throw new Error("submitted proof to incognito chain failed");
                }
                isDelivered = true;
              }
              if (isDelivered) {
                shielding.status = SHIELDING_PROOF_SUBMITTING;
                shielding.inctx = submitProofResponse.Result.TxID;
              }
            } catch (e) {
              if (e.toString() === "Error: submitted proof to incognito chain failed") {
                shielding.status = SHIELDING_PROOF_SUBMIT_REJECTED;
              }
              dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
            }
          }
        }
    }
    let newShielding = {
      status: shielding.status,
      ethtx: shielding.ethtx,
      inctx: shielding.inctx,
      inctokenid: shielding.inctokenid,
      network: shielding.network,
    };
    dispatch(refreshShieldingProofStepSuccess(newShielding, ethTxInfo));
    localStorage.setItem(localStorageKey, JSON.stringify(shielding));
    isRunning = false;
  };
}

export function getLatestUnsuccessfulShieldingThunk(ethAccount) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      let shielding = getState().shielding.latestUnsuccessfulShielding;
      let configNetwork = getState().app.configNetwork;
      if (shielding === null) {
        shielding = JSON.parse(localStorage.getItem(getLocalStorageKey()));
      }
      if (shielding && configNetwork.isMainnet === (shielding.network === 1)) {
        dispatch(getLatestUnsuccessfulShieldingSuccess(shielding));
      } else {
        dispatch(getLatestUnsuccessfulShieldingSuccess(null));
      }
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(getLatestUnsuccessfulShieldingFailure(e));
    }
    dispatch(countDownRequests());
  };
}

async function getERC20TokenBalanceByAddress(web3, address, tokenId) {
  const getBalance = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint256"}],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
      "name": "allowance",
      "outputs": [{"name": "remaining", "type": "uint256"}],
      "payable": false,
      "type": "function"
    }
  ];
  const tokenInstance = new web3.eth.Contract(getBalance, tokenId);
  let balance = await tokenInstance.methods.balanceOf(address).call();
  let decimal = await tokenInstance.methods.decimals().call();
  return balance / (10 ** decimal);
}

async function depositERC20(
  dispatch,
  web3,
  incContract,
  incContractAddr,
  ethAccount,
  formInfo,
  privIncAccount,
  txCount,
  incTokenId,
  isMainnet,
) {
  const erc20TokenContract = new web3.eth.Contract(getERC20ContractABI(), formInfo.extTokenId)
  let afterCommas = 6;
  if (formInfo.eDecimals < afterCommas) {
    afterCommas = formInfo.eDecimals;
  }
  const convertedAmount = formInfo.amount * (10 ** afterCommas);
  if (convertedAmount < 1) { // depositing amount is too small
    dispatch(insufficientBalances({
      tokenId: ETHER_ID,
      requiredAmt: txFee,
      avaiAmt: ethBalance,
    }));
    return;
  }

  const remainingDecimals = web3.utils.toBN(formInfo.eDecimals - afterCommas);
  const tokenAmountToApprove = web3.utils.toBN(convertedAmount);
  const calculatedApproveValue = web3.utils.toHex(tokenAmountToApprove.mul(web3.utils.toBN(10).pow(remainingDecimals)));
  const apprData = erc20TokenContract.methods.approve(incContractAddr, calculatedApproveValue).encodeABI();

  const tokenBalance = await getERC20TokenBalanceByAddress(web3, ethAccount.address, formInfo.extTokenId);
  if (tokenBalance < formInfo.amount) {
    dispatch(insufficientBalances({
      tokenId: formInfo.extTokenId,
      requiredAmt: formInfo.amount,
      avaiAmt: tokenBalance,
    }));
    return;
  }
  const ethereum = window.ethereum;

  let approvedBalance = await erc20TokenContract.methods.allowance(ethAccount.address, getIncognitoContractAddr()).call();
  approvedBalance = web3.utils.toHex(approvedBalance);
  if (approvedBalance < web3.utils.hexToNumberString(calculatedApproveValue)) {
    const apprTxObject = {
      // value: web3.utils.toHex(web3.utils.toWei(formInfo.amount, 'ether')),
      from: ethAccount.address,
      nonce: web3.utils.toHex(txCount),
      to: formInfo.extTokenId,
      data: apprData,
    };
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [apprTxObject],
    });
    approvedBalance = await erc20TokenContract.methods.allowance(ethAccount.address, getIncognitoContractAddr()).call();
    while (approvedBalance < web3.utils.hexToNumberString(calculatedApproveValue)) {
      await sleep(10000);
      approvedBalance = await erc20TokenContract.methods.allowance(ethAccount.address, getIncognitoContractAddr()).call();
    }
  }

  // call inc contract's depositERC20 func
  const depData = incContract.methods.depositERC20(formInfo.extTokenId, calculatedApproveValue, privIncAccount.address).encodeABI();
  const depTxObject = {
    from: ethAccount.address,
    nonce: web3.utils.toHex(txCount + 1),
    to: incContractAddr,
    data: depData,
  };

  const txId = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [depTxObject],
  });

  const shieldingObject = {ethtx: txId, status: ETH_DEPOSITING_TO_INC_CONTRACT, inctokenid: incTokenId, network: isMainnet ? 1 : 0};
  localStorage.setItem(getLocalStorageKey(), JSON.stringify(shieldingObject));
  dispatch(getLatestUnsuccessfulShieldingSuccess(shieldingObject));
}

async function depositEther(
  dispatch,
  web3,
  incContract,
  incContractAddr,
  ethAccount,
  formInfo,
  privIncAccount,
  txCount,
  incTokenId,
  isMainnet,
) {
  const ethAmt = parseInt(web3.utils.toWei(formInfo.amount, 'ether'));
  const data = incContract.methods.deposit(privIncAccount.address).encodeABI();
  const depTxObject = {
    from: ethAccount.address,
    value: web3.utils.toHex(ethAmt),
    nonce: web3.utils.toHex(txCount),
    to: incContractAddr,
    data,
  };

  const txId = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [depTxObject],
  });

  const shieldingObjbect = {ethtx: txId, status: ETH_DEPOSITING_TO_INC_CONTRACT, inctokenid: incTokenId, network: isMainnet ? 1 : 0};
  localStorage.setItem(getLocalStorageKey(), JSON.stringify(shieldingObjbect));
  dispatch(getLatestUnsuccessfulShieldingSuccess(shieldingObjbect));
}

export function depositThunk(ethAccount, tempIncAccount, privIncAccount, formInfo) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    const incContractAddr = getIncognitoContractAddr();
    const web3 = new Web3(getETHFullnodeHost());
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    ethAccount = {address: accounts[0]};
    const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
    const txCount = await web3.eth.getTransactionCount(ethAccount.address);
    const configNetwork = getState().app.configNetwork;
    const tokenInst = filterByExtToken(getDefaultSupportedTokens(configNetwork.isMainnet), formInfo.extTokenId);
    if (!tokenInst) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({snackBar: {isError: true, message: "token is not supported"}}));
      return;
    }
    const privateIncAccount = getAccountByPrivateKey(privIncAccount.privateKey);
    const prvBalance = await getBalanceByToken(privateIncAccount.nativeToken);
    // check prv balance
    if (prvBalance < DEFAULT_PRV_FEE_VALIDATE_SHIELD) {
      dispatch(countDownRequests());
      dispatch(updateValidateForm({snackBar: {isError: true, message: "PRV not enough to pay fee"}}));
      return;
    }

    if (formInfo.extTokenId !== ETHER_ID) {
      try {
        await depositERC20(
          dispatch,
          web3,
          incContract,
          incContractAddr,
          ethAccount,
          formInfo,
          privIncAccount,
          txCount,
          tokenInst.incTokenId,
          configNetwork.isMainnet,
        );
      } catch (e) {
        console.log(`An error occured while depositing ${formInfo.extTokenId} token to Inc contract`, e);
        dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
      }

    } else {
      try {
        await depositEther(
          dispatch,
          web3,
          incContract,
          incContractAddr,
          ethAccount,
          formInfo,
          privIncAccount,
          txCount,
          tokenInst.incTokenId,
          configNetwork.isMainnet,
        );
      } catch (e) {
        console.log(`An error occured while depositing Ether to Inc contract`, e);
        dispatch(updateValidateForm({snackBar: {isError: true, message: e.toString()}}));
      }
    }
    dispatch(countDownRequests());
  }
}

export function completeShieldingThunk(latestUnsuccessfulShielding, history) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      localStorage.removeItem(getLocalStorageKey());
      dispatch(updateShieldingSuccess(null));
      history.push('/wallet');
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(updateShieldingFailure(e));
    }
    dispatch(countDownRequests());
  };
}

export function updateShieldingSkipStepThunk(skipForm) {
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
      if (callSCFunc !== '0xa26e1186' && callSCFunc !== '0x5a67cb87' && transaction.to.toLowerCase() !== getIncognitoContractAddr().toLowerCase()) {
        throw new Error("Invalid transaction hash");
      }
      let extTokenId;
      if (callSCFunc === '0xa26e1186') {
        extTokenId = ETHER_ID;
      } else {
        extTokenId = '0x' + transaction.input.slice(34, 74);
      }
      const incToken = filterByExtToken(getDefaultSupportedTokens(configNetwork.isMainnet), extTokenId);
      if (!incToken) {
        throw new Error("Token is not supported");
      }
      let shielding = {
        ethtx: skipForm.ethTxId,
        status: ETH_DEPOSITING_TO_INC_CONTRACT,
        inctokenid: incToken.incTokenId,
        network: configNetwork.isMainnet ? 1 : 0,
      };
      dispatch(refreshShieldingProofStepSuccess(shielding, null));
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(shielding));
      dispatch(updateSkipForm(null));
    } catch (e) {
      let newSkipForm = {ethTxId: skipForm.ethTxId, isOpen: true, message: e.toString()};
      dispatch(updateSkipForm(newSkipForm));
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}