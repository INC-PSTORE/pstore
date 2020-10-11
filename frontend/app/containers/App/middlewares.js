/*
* App middlewares
*/

import {setupIncWallet} from '../../services/incognito/wallet';
// import {loadETHAccountFromStorage} from '../../services/eth/wallet';
import {
  loadAccountsSuccess,
  loadAccountsFailure,
} from './actions';
// import history from '../../utils/history';

import {countUpRequests, countDownRequests, updateMetaMask} from './actions';
// TODO