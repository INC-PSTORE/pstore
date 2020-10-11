/**
 * DeployPage selectors
 */

import { createSelector } from 'reselect';

const selectdeploy = state => state.deploy; // 'deploy' here should match to registered reducer name in index.js

const makeSelectDeployActiveStep = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.activeStep,
  );

const makeSelectFormInfo = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.deployFormInfo,
  );

const makeSelectFormInfoTokenId = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.deployFormInfo.tokenId,
  );

const makeSelectETHTxDetail = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.ethTxInfo,
  );

const makeSelectINCTxDetail = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.incBurnTxInfo,
  );

const makeSelectValidateForm = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.validateForm,
  );

// const makeSelectTxBurnTodeploy = () =>
//   createSelector(
//     selectdeploy,
//     deployState => deployState.burnTodeployTx,
//   );
//
// const makeSelectProofTodeploy = () =>
//   createSelector(
//     selectdeploy,
//     deployState => deployState.burndeployProof,
//   );

const makeSelectLatestUnsuccessfulDeploy = () =>
  createSelector(
    selectdeploy,
    deployState => deployState.latestUnsuccessfulDeploy,
  );



export {
  makeSelectDeployActiveStep,
  makeSelectFormInfo,
  makeSelectFormInfoTokenId,
  // makeSelectTxBurnTodeploy,
  // makeSelectProofTodeploy,
  makeSelectETHTxDetail,
  makeSelectLatestUnsuccessfulDeploy,
  makeSelectValidateForm,
};
