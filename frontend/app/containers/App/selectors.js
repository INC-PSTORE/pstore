import { createSelector } from 'reselect';

// router state
const selectRouter = state => state.router;

const makeSelectLocation = () => createSelector(selectRouter, routerState => routerState.location);

// app state
const selectApp = state => state.app;

const makeSelectTempIncAccount = () => createSelector(selectApp, appState => appState.tempIncAccount);
const makeSelectPrivateIncAccount = () => createSelector(selectApp, appState => appState.privateIncAccount);
const makeSelectGeneratedETHAccFromIncAcc = () => createSelector(selectApp, appState => appState.generatedETHAccFromIncAcc);

const makeSelectPrivIncAccPrivateKey = () => createSelector(selectApp, appState => appState.privateIncAccount.privateKey);
const makeSelectTempIncAccPrivateKey = () => createSelector(selectApp, appState => appState.tempIncAccount.privateKey);
const makeSelectIsLoadWalletDone = () => createSelector(selectApp, appState => appState.isLoadWalletDone);

const makeSelectIsOpenedInfoDialog = () => createSelector(selectApp, appState => appState.isOpenedInfoDialog);
const makeSelectIsPappsMenuListOpened = () => createSelector(selectApp, appState => appState.isPappsMenuListOpened);

const makeSelectRequestings = () => createSelector(selectApp, appState => appState.requestings);

const makeSelecMetaMask = () => createSelector(selectApp, appState => appState.metaMask);
const makeSelectConfigNetwork = () => createSelector(selectApp, appState => appState.configNetwork);

export {
  makeSelectLocation,
  makeSelectTempIncAccount,
  makeSelectPrivateIncAccount,
  makeSelectGeneratedETHAccFromIncAcc,

  makeSelectPrivIncAccPrivateKey,
  makeSelectTempIncAccPrivateKey,

  makeSelectIsLoadWalletDone,
  makeSelectIsOpenedInfoDialog,
  makeSelectIsPappsMenuListOpened,

  makeSelectRequestings,
  makeSelecMetaMask,
  makeSelectConfigNetwork,
};
