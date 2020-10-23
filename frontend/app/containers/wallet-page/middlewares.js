
/*
* WalletPage middleware
*/

import Web3 from 'web3';
import {
  PRIVATE_INC_ACC_NAME,
} from '../accounts/constants';
import { getAccountByName } from '../../services/incognito/wallet';
import { loadTokensInfoSuccess, loadTokensInfoFailure } from './actions';
import { getBalanceByToken } from '../../services/incognito/wallet';
import { TOKEN_INFO } from '../../common/constants';
import { ethFormatBalance } from '../../utils/format';

import { countDownRequests, countUpRequests } from '../../containers/App/actions';
import {
  getETHFullnodeHost,
  getIncContractABI,
  getIncognitoContractAddr,
  getDefaultSupportedTokens,
} from '../../common/utils';

export function loadTokensInfoThunk() {
  return async (dispatch, getState) => {
    dispatch(countUpRequests());
    try {
      const generatedETHAcc = getState().app.generatedETHAccFromIncAcc;
      const configNetwork = getState().app.configNetwork;
      const supportedTokens = getDefaultSupportedTokens(configNetwork.isMainnet);
      const privateIncAcc = getAccountByName(PRIVATE_INC_ACC_NAME);
      const jobs = loadIncBalances(privateIncAcc, generatedETHAcc, supportedTokens);
      const tokens = [];
      for (let job of jobs) {
        const tokenInfo = await job;
        tokens.push(tokenInfo);
      }
      dispatch(loadTokensInfoSuccess(tokens));
    } catch (error) {
      console.log('An error occured while loading tokens info - with detailed error: ', error);
    }
    dispatch(countDownRequests());
  };
}

function loadIncBalances(incAcc, generatedETHAcc, tokens) {
  return tokens.map(async (token) => {
    const incTokenId = token.incTokenId;

    // pToken amounts
    const incTokenInstance = incTokenId === TOKEN_INFO.PRV.tokenId ?
      incAcc.nativeToken :
      await incAcc.getFollowingPrivacyToken(incTokenId);
    const incBal = await getBalanceByToken(incTokenInstance);

    // pApps deposited amounts
    const incContractAddr = getIncognitoContractAddr();
    const web3 = new Web3(getETHFullnodeHost());
    const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
    let convertedBal = 'N/A';
    if (token.extTokenId) {
      const balance = await incContract.methods.getDepositedBalance(token.extTokenId, generatedETHAcc.address).call();
      convertedBal = balance / (10 ** token.eDecimals);
    }

    return {
      incTokenInstance,
      tokenId: token.incTokenId,
      tokenSymbol: token.tokenSymbol,
      pDecimals: token.pDecimals,
      icon: token.icon,
      privateIncBal: incBal,
      pAppsDepositedBal: convertedBal,
    };
  });
}
