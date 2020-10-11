/**
 * ShieldingPage selectors
 */

import { createSelector } from 'reselect';

const selectShielding = state => state.shielding; // 'shielding' here should match to registered reducer name in index.js

// const makeSelectActiveStep = () =>
//   createSelector(
//     selectShielding,
//     shieldingState => shieldingState.activeStep,
//   );

const makeSelectFormInfo = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.formInfo,
  );

const makeSelectLatestUnsuccessfulShielding = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.latestUnsuccessfulShielding,
  );

const makeSelectETHTxInfo = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.ethTxInfo,
  );

const makeSelectDepProofSubmitStatus = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.depProofSubmitStatus,
  );

const makeSelectInsufficientBalancesInfo = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.insufficientBalancesInfo,
  );

const makeSelectRefresher = () =>
  createSelector(
    selectShielding,
    shieldingState => shieldingState.refresher,
  );

export {
  selectShielding,
  // makeSelectActiveStep,
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulShielding,
  makeSelectETHTxInfo,
  makeSelectDepProofSubmitStatus,
  makeSelectInsufficientBalancesInfo,
  makeSelectRefresher,
};
