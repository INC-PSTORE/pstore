/**
 * Unshield Page selectors
 */

import { createSelector } from 'reselect';

const selectUnshield = state => state.unshield; // 'unshield' here should match to registered reducer name in index.js

const makeSelectUnshieldActiveStep = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.activeStep,
  );

const makeSelectFormInfo = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.unshieldFormInfo,
  );

const makeSelectFormInfoTokenId = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.unshieldFormInfo.tokenId,
  );

const makeSelectETHTxDetail = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.ethTxInfo,
  );

const makeSelectINCTxDetail = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.incBurnTxInfo,
  );

const makeSelectValidateForm = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.validateForm,
  );

// const makeSelectTxBurnToUnshield = () =>
//   createSelector(
//     selectUnshield,
//     unshieldState => unshieldState.burnToUnshieldTx,
//   );
//
// const makeSelectProofToUnshield = () =>
//   createSelector(
//     selectUnshield,
//     unshieldState => unshieldState.burnUnshieldProof,
//   );

const makeSelectLatestUnsuccessfulUnshield = () =>
  createSelector(
    selectUnshield,
    unshieldState => unshieldState.latestUnsuccessfulUnshield,
  );



export {
  makeSelectUnshieldActiveStep,
  makeSelectFormInfo,
  makeSelectFormInfoTokenId,
  // makeSelectTxBurnToUnshield,
  // makeSelectProofToUnshield,
  makeSelectETHTxDetail,
  makeSelectLatestUnsuccessfulUnshield,
  makeSelectValidateForm,
};
