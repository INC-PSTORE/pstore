/**
 * WalletPage selectors
 */

import { createSelector } from 'reselect';

const selectWallet = state => state.wallet; // 'wallet' here should match to registered reducer name in index.js

const makeSelectTokens = () =>
  createSelector(
    selectWallet,
    walletState => walletState.tokens,
  );

const makeSelectIsShowTransfer = () =>
  createSelector(
    selectWallet,
    walletState => walletState.isShowTransfer,
  );

const makeSelectSelectedWalletToken = () =>
  createSelector(
    selectWallet,
    walletState => walletState.selectedWalletToken,
  );

export {
  selectWallet,
  makeSelectTokens,
  makeSelectIsShowTransfer,
  makeSelectSelectedWalletToken,
};
