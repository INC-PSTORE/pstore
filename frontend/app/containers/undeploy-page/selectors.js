/**
 * UndeployPage selectors
 */

import { createSelector } from 'reselect';

const selectUndeploy = state => state.undeploy; // 'undeploy' here should match to registered reducer name in index.js

const makeSelectFormInfo = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.formInfo,
  );

const makeSelectLatestUnsuccessfulUndeploy = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.latestUnsuccessfulUndeploy,
  );

const makeSelectETHTxInfo = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.ethTxInfo,
  );

const makeSelectUndeployProofSubmitStatus = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.undeployProofSubmitStatus,
  );

const makeSelectInsufficientBalancesInfo = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.insufficientBalancesInfo,
  );

const makeSelectSkipForm = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.skipForm,
  );

const makeSelectToolTip = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.isOpenToolTip,
  );

const makeSelectValidateForm = () =>
  createSelector(
    selectUndeploy,
    undeployState => undeployState.validateForm,
  );

export {
  selectUndeploy,
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulUndeploy,
  makeSelectETHTxInfo,
  makeSelectUndeployProofSubmitStatus,
  makeSelectInsufficientBalancesInfo,
  makeSelectSkipForm,
  makeSelectToolTip,
  makeSelectValidateForm,
};
