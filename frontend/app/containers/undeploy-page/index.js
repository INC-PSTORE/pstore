/*
* UndeployPage
*/

import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';

import {
  SHIELDING_PROOF_SUBMITTED,
  SHIELDING_PROOF_SUBMIT_REJECTED,
  ETH_DEPOSIT_FAILED,
  ETH_DEPOSITING_TO_INC_CONTRACT,
  ETH_DEPOSITED_TO_INC_CONTRACT,
  SHIELDING_PROOF_SUBMITTING,
} from '../../common/constants';

import {getDefaultSupportedTokens, getLocalStorageKeyUndeploy} from '../../common/utils';
import ShieldingProof from '../../components/proof-shielding-step';
import SmartContractDeposit from '../../components/sc-deposit-shielding-step';

import {
  makeSelectPrivateIncAccount,
  makeSelectTempIncAccount,
  makeSelectGeneratedETHAccFromIncAcc, makeSelectConfigNetwork,
} from '../App/selectors';

import {changeAmount, changeSelectedToken, updateUndeploySuccess, updateToolTip, updateValidateForm} from './actions';

import {
  undeployThunk,
  getLatestUnsuccessfulUndeployThunk,
  refreshUndeployProofStepThunk,
  updateUndeployThunk, updateUndeploySkipStepThunk,
} from './middlewares';

import reducer from './reducer';

import {
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulUndeploy,
  makeSelectETHTxInfo,
  makeSelectInsufficientBalancesInfo,
  makeSelectSkipForm,
  makeSelectToolTip,
  makeSelectValidateForm,
} from './selectors';

import styles from './styles';
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormHelperText from "@material-ui/core/FormHelperText";
import {Button} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

function getSteps() {
  return ['Withdraw from pApps', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class UndeployPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayStepContent = this.displayStepContent.bind(this);
    this.changeSelectedToken = this.changeSelectedToken.bind(this);
    this.undeploy = this.undeploy.bind(this);
    this.checkBalances = this.checkBalances.bind(this);
    this.skipStep = this.skipStep.bind(this);
    this.updateEthDepositTx = this.updateEthDepositTx.bind(this);
    this.handleDepositInput = this.handleDepositInput.bind(this);
    this.createNewUndeploy = this.createNewUndeploy.bind(this);
    this.handleTooltipOpen = this.handleTooltipOpen.bind(this);
    this.handleTooltipClose = this.handleTooltipClose.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  componentDidMount() {
    const {
      ethAccount,
      onGetLatestUnsuccessfulUndeploy,
      onUpdateSkipForm,
    } = this.props;
    onGetLatestUnsuccessfulUndeploy(ethAccount);
    onUpdateSkipForm(null);
  }

  checkBalances() {
    const { history, latestUnsuccessfulUndeploy, onUpdateUndeploy } = this.props;
    onUpdateUndeploy(latestUnsuccessfulUndeploy, history);
  }

  undeploy(ethAccount, tempIncAccount, privateIncAccount, formInfo) {
    const { onUndeploy, generatedETHAccFromIncAcc } = this.props;
    onUndeploy(
      ethAccount,
      tempIncAccount,
      privateIncAccount,
      generatedETHAccFromIncAcc,
      formInfo,
    );
  }

  changeSelectedToken(extTokenId) {
    const { onChangeSelectedToken, configNetwork } = this.props;
    let supportedTokens = getDefaultSupportedTokens(configNetwork.isMainnet);
    supportedTokens.shift();
    let selectedToken = {};
    for (const supportedToken of supportedTokens) {
      if (supportedToken.extTokenId === extTokenId) {
        selectedToken = supportedToken;
        break;
      }
    }
    onChangeSelectedToken(selectedToken);
  }

  displayStepContent() {
    const {
      onChangeAmount,
      ethAccount,
      tempIncAccount,
      privateIncAccount,
      formInfo,
      latestUnsuccessfulUndeploy,
      ethTxInfo,
      insufficientBalancesInfo,
      onRefreshUndeployProofStep,
      configNetwork,
    } = this.props;
    const scUndeployComp = (
      <SmartContractDeposit
        actionButtonText="Withdraw"
        ethAccount={ethAccount}
        tempIncAccount={tempIncAccount}
        privateIncAccount={privateIncAccount}
        formInfo={formInfo}
        insufficientBalancesInfo={insufficientBalancesInfo}
        onDeposit={this.undeploy}
        onChangeSelectedToken={this.changeSelectedToken}
        onChangeAmount={onChangeAmount}
        configNetwork={configNetwork}
      />
    );
    const undeployProofComp = (
      <ShieldingProof
        ethAccount={ethAccount}
        latestUnsuccessfulUndeploy={latestUnsuccessfulUndeploy}
        ethTxInfo={ethTxInfo}
        onRefreshShieldingProofStep={onRefreshUndeployProofStep}
        onCheckBalances={this.checkBalances}
      />
    );

    if (!latestUnsuccessfulUndeploy) {
      return { comp: scUndeployComp, step: 0 };
    }
    switch (latestUnsuccessfulUndeploy.status) {
      case ETH_DEPOSIT_FAILED:
      case ETH_DEPOSITING_TO_INC_CONTRACT:
      case ETH_DEPOSITED_TO_INC_CONTRACT:
      case SHIELDING_PROOF_SUBMITTING:
      case SHIELDING_PROOF_SUBMITTED:
      case SHIELDING_PROOF_SUBMIT_REJECTED:
        return { comp: undeployProofComp, step: 1 };

      default:
        return { comp: scUndeployComp, step: 0 };
    }
  }

  handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    const {formValidate, onUpdateValidateForm} = this.props;
    if (formValidate && formValidate.snackBar) {
      onUpdateValidateForm(null);
    }
  }

  skipStep() {
    const {onUpdateSkipForm, skipForm} = this.props;
    let tempSkipForm;
    if (!skipForm) {
      tempSkipForm = {isOpen: true};
    } else {
      tempSkipForm = {isOpen: !skipForm.isOpen, message: skipForm.message, ethTxId: skipForm.ethTxId};
    }
    onUpdateSkipForm(tempSkipForm);
  }

  updateEthDepositTx() {
    const {skipForm, onUpdateSkipForm, onUpdateUndeployEthTx} = this.props;
    let tempSkipForm;
    if (skipForm && skipForm.ethTxId && /^0x([A-Fa-f0-9]{64})$/.test(skipForm.ethTxId)) {
      onUpdateUndeployEthTx(skipForm);
    } else {
      tempSkipForm = {isOpen: true, ethTxId: skipForm.ethTxId, message: "Invalid eth transaction"};
      onUpdateSkipForm(tempSkipForm);
    }
  }

  handleDepositInput = e => {
    const {skipForm, onUpdateSkipForm} = this.props;
    if (skipForm) {
      skipForm.ethTxId = e.target.value;
    }
    onUpdateSkipForm(skipForm ? skipForm : {ethTxId: e.target.value});
  }

  handleTooltipClose() {
    const {onUpdateToolTip} = this.props;
    onUpdateToolTip(false);
  }

  handleTooltipOpen() {
    const {onUpdateToolTip} = this.props;
    onUpdateToolTip(true);
  }

  deposit(ethAccount, tempIncAccount, privateIncAccount, formInfo) {
    const {onDeposit} = this.props;
    onDeposit(ethAccount, tempIncAccount, privateIncAccount, formInfo);
  }

  changeSelectedToken(extTokenId) {
    const {onChangeSelectedToken, configNetwork} = this.props;
    let supportedTokens = getDefaultSupportedTokens(configNetwork.isMainnet);
    supportedTokens.shift();
    let selectedToken = {};
    for (const supportedToken of supportedTokens) {
      if (supportedToken.extTokenId === extTokenId) {
        selectedToken = supportedToken;
        break;
      }
    }
    onChangeSelectedToken(selectedToken);
  }

  createNewUndeploy() {
    const {onCreateNewShielding} = this.props;
    window.localStorage.removeItem(getLocalStorageKeyUndeploy());
    onCreateNewShielding();
  }

  render() {
    const steps = getSteps();
    const {
      classes,
      latestUnsuccessfulUndeploy,
      skipForm,
      ethTxInfo,
      isOpenToolTip,
      formValidate,
    } = this.props;

    let message = ">> skip step 1";
    if (latestUnsuccessfulUndeploy) {
      message = ">> update deposit eth transaction hash";
    }
    let helperText = "Submit when you already deposited to incognito contract";
    if (latestUnsuccessfulUndeploy) {
      helperText = "Update Ethereum tx id if you've updated gas price on metamask";
    }

    const { comp, step } = this.displayStepContent();
    return (
      <div className={classes.root}>
        {formValidate && formValidate.snackBar && formValidate.snackBar.isError &&
        <Snackbar
          className={classes.snackBar}
          ContentProps={{
            className: classes.snackBarContent,
          }}
          open={formValidate.snackBar.isError}
          autoHideDuration={3000}
          message={formValidate && formValidate.snackBar.message ? formValidate.snackBar.message : ""}
          onClose={this.handleSnackbarClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackbarClose}>
                <CloseIcon fontSize="small"/>
              </IconButton>
            </React.Fragment>
          }
        />
        }
        <Stepper alternativeLabel activeStep={latestUnsuccessfulUndeploy && latestUnsuccessfulUndeploy.status === SHIELDING_PROOF_SUBMITTED ? 2 : step} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {comp}
        <div className={classes.ethSkipStepWrapper}>
          {skipForm && skipForm.isOpen
            ?
            <FormControl fullWidth className={classes.ethSkipStep} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Eth transaction hash</InputLabel>
              <OutlinedInput
                error={!!(skipForm && skipForm.message)}
                id="outlined-adornment-amount"
                onChange={this.handleDepositInput}
                labelWidth={150}
              />
              {skipForm.message &&
              <FormHelperText id="component-error-text">{skipForm.message}</FormHelperText>
              }
              <div className={classes.ethSkipStepButton}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.updateEthDepositTx}
                  style={{margin: 5}}
                >Submit</Button>
                <Button
                  onClick={this.skipStep}
                  variant="contained"
                  style={{margin: 5}}
                >Cancel</Button>
              </div>
            </FormControl>
            :
            (!latestUnsuccessfulUndeploy || [SHIELDING_PROOF_SUBMIT_REJECTED, ETH_DEPOSIT_FAILED].includes(latestUnsuccessfulUndeploy.status) || !ethTxInfo || (latestUnsuccessfulUndeploy.status === ETH_DEPOSITING_TO_INC_CONTRACT && ethTxInfo.status === 2))
              ?
              <div className={classes.skipStep}>
                <a className={classes.skipStepLink} onClick={this.skipStep}> {message} </a> <Grid item>
                <ClickAwayListener onClickAway={this.handleTooltipClose}>
                  <div>
                    <Tooltip
                      PopperProps={{
                        disablePortal: true,
                      }}
                      onClose={this.handleTooltipClose}
                      open={isOpenToolTip}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={helperText}
                      leaveDelay={200}
                    >
                      <Button onClick={this.handleTooltipOpen}><HelpOutlineIcon fontSize={'16'}/></Button>
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </Grid>

              </div>
              :
              <></>
          }
        </div>
        {/*in case transaction from eth or inc failed*/}
        <div>
          {latestUnsuccessfulUndeploy &&
          (latestUnsuccessfulUndeploy.status === SHIELDING_PROOF_SUBMIT_REJECTED ||
            latestUnsuccessfulUndeploy.status === ETH_DEPOSIT_FAILED) &&
          <Button onClick={this.createNewUndeploy}>
            Create New Shield
          </Button>
          }
        </div>
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onUndeploy: (ethAccount, tempIncAccount, privateIncAccount, generatedETHAccFromIncAcc, formInfo) => dispatch(undeployThunk(ethAccount, tempIncAccount, privateIncAccount, generatedETHAccFromIncAcc, formInfo)),
    onChangeSelectedToken: (selectedToken) => dispatch(changeSelectedToken(selectedToken)),
    onChangeAmount: (changingAmount) => dispatch(changeAmount(changingAmount)),
    onGetLatestUnsuccessfulUndeploy: (ethAccount) => dispatch(getLatestUnsuccessfulUndeployThunk(ethAccount)),
    onRefreshUndeployProofStep: (ethAccount) => dispatch(refreshUndeployProofStepThunk(ethAccount)),
    onUpdateUndeploy: (latestUnsuccessfulUndeploy, history) => dispatch(updateUndeployThunk(latestUnsuccessfulUndeploy, history)),
    onUpdateUndeployEthTx: (skipForm) => dispatch(updateUndeploySkipStepThunk(skipForm)),
    onCreateNewUndeploy: () => dispatch(updateUndeploySuccess(null)),
    onUpdateToolTip: (isOpenToolTip) => dispatch(updateToolTip(isOpenToolTip)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
  };
}

const mapStateToProps = createStructuredSelector({
  tempIncAccount: makeSelectTempIncAccount(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  generatedETHAccFromIncAcc: makeSelectGeneratedETHAccFromIncAcc(),
  formInfo: makeSelectFormInfo(),
  latestUnsuccessfulUndeploy: makeSelectLatestUnsuccessfulUndeploy(),
  ethTxInfo: makeSelectETHTxInfo(),
  insufficientBalancesInfo :makeSelectInsufficientBalancesInfo(),
  configNetwork: makeSelectConfigNetwork(),
  skipForm: makeSelectSkipForm(),
  isOpenToolTip: makeSelectToolTip(),
  formValidate: makeSelectValidateForm(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'undeploy', reducer });

const withStylesUndeployPage = withStyles(styles);
const withWidthUndeployPage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesUndeployPage,
  withWidthUndeployPage,
)(UndeployPage);
