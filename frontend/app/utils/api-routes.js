/*
* api routes
*/

import { buildApiServer } from './api-call';

// pstore api routes
export function getCreateShieldingApiRoute() {
  return `${buildApiServer()}/shieldings`;
}

export function getPrepareProof() {
  return `${buildApiServer()}/execution/eth-proof/prepare`;
}

export function getPrepareBurnProof() {
  return `${buildApiServer()}/execution/inc-proof/prepare`;
}

export function getUpdateShieldingApiRoute(shieldingId) {
  return `${buildApiServer()}/shieldings/${shieldingId}`;
}

export function getFilterShieldingsApiRoute() {
  return `${buildApiServer()}/shieldings`;
}

export function getLatestUnsuccessfulShieldingApiRoute(ethAddress) {
  return `${buildApiServer()}/addresses/${ethAddress}/shieldings/unsuccess/latest`;
}

export function getETHTransactionInfoApiRoute(ethTxHash) {
  return `${buildApiServer()}/eth-txs/${ethTxHash}`;
}

export function getDepositProofSubmitStatusApiRoute(proofSubmitTxID) {
  return `${buildApiServer()}/shieldings/proofs/${proofSubmitTxID}`;
}

//unshield
export function getCreateUnshieldApiRoute() {
  return `${buildApiServer()}/unshields`;
}

export function getUnshieldByIdRoute(unshieldId) {
  return `${buildApiServer()}/unshields/${unshieldId}`;
}

export function getLatestUnsuccessfulUnshieldApiRoute(incAddress) {
  return `${buildApiServer()}/inc-addresses/${incAddress}/unshield/unsuccess/latest`;
}

export function updateEthRawTxUnshieldByID(unshieldID) {
  return `${buildApiServer()}/unshields/${unshieldID}/submitRawEthTransaction`;
}

// deploy
export function getCreateDeployApiRoute() {
  return `${buildApiServer()}/deploys`;
}

export function getDeployByIdRoute(deployId) {
  return `${buildApiServer()}/deploys/${deployId}`;
}

export function getLatestUnsuccessfulDeployApiRoute(incAddress) {
  return `${buildApiServer()}/inc-addresses/${incAddress}/deploy/unsuccess/latest`;
}

export function updateEthRawTxDeployByID(deployID) {
  return `${buildApiServer()}/deploys/${deployID}/submitRawEthTransaction`;
}

// undeploy
export function getCreateUndeployApiRoute() {
  return `${buildApiServer()}/undeploys`;
}

export function getUpdateUndeployApiRoute(undeployId) {
  return `${buildApiServer()}/undeploys/${undeployId}`;
}

export function getFilterUndeploysApiRoute() {
  return `${buildApiServer()}/undeploys`;
}

export function getLatestUnsuccessfulUndeployApiRoute(ethAddress) {
  return `${buildApiServer()}/addresses/${ethAddress}/undeploys/unsuccess/latest`;
}

export function getPrepareUndeploySignDataApiRoute() {
  return `${buildApiServer()}/undeploys/sign-data/prepare`;
}
