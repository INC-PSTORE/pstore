/**
 * Account selectors
 *
 * Author: incsmile
 */

import {createSelector} from 'reselect';

const selectScreenInitWallet = state => state.accounts; // 'accounts' here should match to registered reducer name in index.js

const makeSelectScreenToInitWallet = () =>
  createSelector(
    selectScreenInitWallet,
    walletInitScreen => walletInitScreen.selectWalletInit,
  );

const makeShowPrivateKey = () =>
  createSelector(
    selectScreenInitWallet,
    walletInitScreen => walletInitScreen.showPrivateKey,
  )

const makeSelectDidmounted = () =>
  createSelector(
    selectScreenInitWallet,
    walletInitScreen => walletInitScreen.isDidmounted,
  )

export {
  makeShowPrivateKey,
  makeSelectScreenToInitWallet,
  makeSelectDidmounted,
};
