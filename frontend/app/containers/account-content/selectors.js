/**
 * Account selectors
 *
 * Author: incsmile
 */

import {createSelector} from 'reselect';
import { getETHAccountFromPrivateKeyStr } from '../../services/eth/wallet';

export const getEthAccountKeySelector = state => state.app.ethAccount;

export const getGeneratedETHAccountKeySelector = state => state.app.generatedETHAccFromIncAcc;

export const getPrivIncAccountKeySelector = state => state.app.privateIncAccount;

export const getTempIncAccountKeySelector = state => state.app.tempIncAccount;

export const listAccountSelector = createSelector(
  getEthAccountKeySelector,
  getPrivIncAccountKeySelector,
  getTempIncAccountKeySelector,
  (ethKey, privIncKey, tempIncKey) => ({
    ethKey,
    privIncKey,
    tempIncKey
  })
);

export const getEthAccount = createSelector(getEthAccountKeySelector, (key) => {
  return key && key.privateKey && getETHAccountFromPrivateKeyStr(key.privateKey);
});

export const getGeneratedETHAccount = createSelector(getGeneratedETHAccountKeySelector, (key) => {
  return key && key.privateKey && getETHAccountFromPrivateKeyStr(key.privateKey);
});
