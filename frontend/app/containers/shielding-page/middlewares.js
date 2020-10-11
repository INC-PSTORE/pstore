/*
* Shielding middlewares
*/

import Web3 from 'web3';
import {ETHER_ID, SHIELDING_FINISHED, ETH_DEPOSITED_TO_INC_CONTRACT, ETH_INT_SHIELD} from '../../common/constants';
import {
  getERC20ContractABI,
  getETHFullnodeHost,
  getIncContractABI,
  getIncognitoContractAddr,
} from '../../common/utils';

import {countDownRequests, countUpRequests} from '../../containers/App/actions';
import {buildOptions, makeCall} from '../../utils/api-call';
import {
  getETHTransactionInfoApiRoute,
  getLatestUnsuccessfulShieldingApiRoute,
  getUpdateShieldingApiRoute,
  getCreateShieldingApiRoute,
} from '../../utils/api-routes';

import {
  getLatestUnsuccessfulShieldingFailure,
  getLatestUnsuccessfulShieldingSuccess,
  refreshShieldingProofStepFailure,
  refreshShieldingProofStepSuccess,
  updateShieldingFailure,
  updateShieldingSuccess,
  insufficientBalances,
} from './actions';
// TODO
export function refreshShieldingProofStepThunk(ethAccount) {
  return async (dispatch, getState) => {
    let shielding;
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    ethAccount = {address: accounts[0]};
    try {
      const options = buildOptions('GET');
      shielding = await makeCall(
        dispatch,
        getLatestUnsuccessfulShieldingApiRoute(ethAccount.address),
        options,
      );

    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(refreshShieldingProofStepFailure(e));
      dispatch(countDownRequests());
      return;
    }

    const ethDepositTxId = shielding.ethDepositTxId;
    let ethTxInfo = null;
    if(ethDepositTxId) {
      try {
        const options = await buildOptions('GET');
        ethTxInfo = await makeCall(
          dispatch,
          getETHTransactionInfoApiRoute(ethDepositTxId),
          options,
        );
      } catch (e) {
        console.log('error occured while calling getETHTransactionInfo api: ', e);
        dispatch(refreshShieldingProofStepFailure(e));
      }
    }
    dispatch(refreshShieldingProofStepSuccess(shielding, ethTxInfo));
  };
}

export function getLatestUnsuccessfulShieldingThunk(ethAccount) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    ethAccount = {address: accounts[0]};
    try {
      const options = buildOptions('GET');
      const shielding = await makeCall(
        dispatch,
        getLatestUnsuccessfulShieldingApiRoute(ethAccount.address),
        options,
      );
      dispatch(getLatestUnsuccessfulShieldingSuccess(shielding));
      // handleSuccess(dispatch, getProfilesListSuccess, profilesList);
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(getLatestUnsuccessfulShieldingFailure(e));
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
    {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"}
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
  txCount
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

  approvedBalance = await erc20TokenContract.methods.allowance(ethAccount.address, getIncognitoContractAddr()).call();
  while (approvedBalance < web3.utils.hexToNumberString(calculatedApproveValue)) {
    await sleep(5000);
    approvedBalance = await erc20TokenContract.methods.allowance(ethAccount.address, getIncognitoContractAddr()).call();
  }

  // call inc contract's depositERC20 func
  const depData = incContract.methods.depositERC20(formInfo.extTokenId, calculatedApproveValue, privIncAccount.address).encodeABI();
  const depTxObject = {
    from: ethAccount.address,
    nonce: web3.utils.toHex(txCount + 1),
    to: incContractAddr,
    data: depData,
  };

  // store tx hash to db
  const options = buildOptions('POST', {
    ethAddressStr: ethAccount.address,
    // tempIncAddressStr: tempIncAccount.address,
    // not in used yet. Prepare this field for next feature
    tempIncAddressStr: '12345',
    privateIncAddressStr: privIncAccount.address,
    ethDepositTxId: "",
    proofSubmitTxId: "",
    privateTransferTxId: "",
    extNetworkTokenId: formInfo.extTokenId,
    incTetworkTokenId: formInfo.incTokenId,
    status: ETH_INT_SHIELD,
  });
  await makeCall(
    dispatch,
    getCreateShieldingApiRoute(),
    options,
  );
}

async function depositEther(
  dispatch,
  web3,
  incContract,
  incContractAddr,
  ethAccount,
  formInfo,
  privIncAccount,
  txCount
) {
  const balance = await web3.eth.getBalance(ethAccount.address);
  const gasLimit = 100000;
  const gasPrice = web3.utils.toWei(`5`, 'gwei');
  const txFee = gasLimit * gasPrice;

  const ethAmt = parseInt(web3.utils.toWei(formInfo.amount, 'ether'));
  if (parseInt(balance) < ethAmt + txFee) {
    dispatch(insufficientBalances({
      tokenId: formInfo.extTokenId,
      requiredAmt: ethAmt + txFee,
      avaiAmt: balance,
    }));
    return;
  }

  const data = incContract.methods.deposit(privIncAccount.address).encodeABI();
  const depTxObject = {
    from: ethAccount.address,
    value: web3.utils.toHex(ethAmt),
    nonce: web3.utils.toHex(txCount),
    to: incContractAddr,
    data,
  };

  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [depTxObject],
  });

  // store tx hash to db
  const options = buildOptions('POST', {
    ethAddressStr: ethAccount.address,
    // tempIncAddressStr: tempIncAccount.address,
    // not in used yet. Prepare this field for next feature
    tempIncAddressStr: '12345',
    privateIncAddressStr: privIncAccount.address,
    ethDepositTxId: "",
    proofSubmitTxId: "",
    privateTransferTxId: "",
    extNetworkTokenId: formInfo.extTokenId,
    incTetworkTokenId: formInfo.incTokenId,
    status: ETH_INT_SHIELD,
  });
  await makeCall(
    dispatch,
    getCreateShieldingApiRoute(),
    options,
  );
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
        );
      } catch (e) {
        console.log(`An error occured while depositing ${formInfo.extTokenId} token to Inc contract`, e);
        // TODO: dispatch failure handling action
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
        );
      } catch (e) {
        console.log(`An error occured while depositing Ether to Inc contract`, e);
        // TODO: dispatch failure handling action
      }
    }

    dispatch(getLatestUnsuccessfulShieldingThunk(ethAccount));
    dispatch(countDownRequests());
  }
}

export function updateShieldingThunk(latestUnsuccessfulShielding, history) {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const options = buildOptions('PUT', {
        ...latestUnsuccessfulShielding,
        status: SHIELDING_FINISHED,
      });
      const shielding = await makeCall(
        dispatch,
        getUpdateShieldingApiRoute(latestUnsuccessfulShielding.shieldingId),
        options,
      );
      dispatch(updateShieldingSuccess(shielding));
      // handleSuccess(dispatch, getProfilesListSuccess, profilesList);
      history.push('/wallet');
    } catch (e) {
      console.log('error occured while calling getLatestUnsuccessfulShielding api: ', e);
      dispatch(updateShieldingFailure(e));
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}