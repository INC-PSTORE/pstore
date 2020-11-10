/*
* ShieldingPage
*/

import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import {withStyles} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {createStructuredSelector} from 'reselect';
import injectReducer from 'utils/injectReducer';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import {
  ETH_DEPOSITED_TO_INC_CONTRACT,
  ETH_DEPOSITING_TO_INC_CONTRACT,
  ETH_DEPOSIT_FAILED,
  SHIELDING_PROOF_SUBMITTED,
  SHIELDING_PROOF_SUBMITTING,
  SHIELDING_PROOF_SUBMIT_REJECTED, INC_TRANSACTION_REJECTED,
} from '../../common/constants';

import {getDefaultSupportedTokens, getLocalStorageKey} from '../../common/utils';
import ShieldingProof from '../../components/proof-shielding-step';
import SmartContractDeposit from '../../components/sc-deposit-shielding-step';

import {
  makeSelectConfigNetwork,
  makeSelectPrivateIncAccount,
  makeSelectTempIncAccount,
} from '../App/selectors';

import {updateValidateForm, changeAmount, changeSelectedToken, updateShieldingSuccess, updateSkipForm, updateToolTip} from './actions';

import {
  depositThunk,
  getLatestUnsuccessfulShieldingThunk,
  refreshShieldingProofStepThunk,
  completeShieldingThunk, updateShieldingSkipStepThunk,
} from './middlewares';

import reducer from './reducer';

import {
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulShielding,
  makeSelectETHTxInfo,
  makeSelectDepProofSubmitStatus,
  makeSelectInsufficientBalancesInfo,
  makeSelectRefresher, makeSelectSkipForm, makeSelectToolTip,
  makeSelectValidateForm,
} from './selectors';

import styles from './styles';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import {Button} from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

function getSteps() {
  // return ['Deposit to Incognito contract', 'Get & submit proof', 'Transfer to private account'];
  return ['Deposit to Incognito contract', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class ShieldingPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayStepContent = this.displayStepContent.bind(this);
    this.changeSelectedToken = this.changeSelectedToken.bind(this);
    this.deposit = this.deposit.bind(this);
    this.checkBalances = this.checkBalances.bind(this);
    this.skipStep = this.skipStep.bind(this);
    this.updateEthDepositTx = this.updateEthDepositTx.bind(this);
    this.handleDepositInput = this.handleDepositInput.bind(this);
    this.createNewShielding = this.createNewShielding.bind(this);
    this.handleTooltipOpen = this.handleTooltipOpen.bind(this);
    this.handleTooltipClose = this.handleTooltipClose.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  componentDidMount() {
    const {
      onGetLatestUnsuccessfulShielding,
      onUpdateSkipForm,
    } = this.props;
    onGetLatestUnsuccessfulShielding(null);
    onUpdateSkipForm(null);
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

  checkBalances() {
    const {history, latestUnsuccessfulShielding, onUpdateCompleteShielding} = this.props;
    onUpdateCompleteShielding(latestUnsuccessfulShielding, history);
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
    const {skipForm, onUpdateSkipForm, onUpdateShielding} = this.props;
    let tempSkipForm;
    if (skipForm && skipForm.ethTxId && /^0x([A-Fa-f0-9]{64})$/.test(skipForm.ethTxId)) {
      onUpdateShielding(skipForm);
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

  createNewShielding() {
    const {onCreateNewShielding} = this.props;
    window.localStorage.removeItem(getLocalStorageKey());
    onCreateNewShielding();
  }

  displayStepContent() {
    const {
      onChangeAmount,
      ethAccount,
      tempIncAccount,
      privateIncAccount,
      formInfo,
      latestUnsuccessfulShielding,
      ethTxInfo,
      insufficientBalancesInfo,
      onRefreshShieldingProofStep,
      configNetwork,
    } = this.props;
    const scDepComp = (
      <SmartContractDeposit
        actionButtonText="Deposit"
        ethAccount={ethAccount}
        tempIncAccount={tempIncAccount}
        privateIncAccount={privateIncAccount}
        formInfo={formInfo}
        insufficientBalancesInfo={insufficientBalancesInfo}
        onDeposit={this.deposit}
        onChangeSelectedToken={this.changeSelectedToken}
        onChangeAmount={onChangeAmount}
        configNetwork={configNetwork}
      />
    );
    const shieldingProofComp = (
      <ShieldingProof
        ethAccount={ethAccount}
        latestUnsuccessfulShielding={latestUnsuccessfulShielding}
        ethTxInfo={ethTxInfo}
        onRefreshShieldingProofStep={onRefreshShieldingProofStep}
        onCheckBalances={this.checkBalances}
      />
    );


    if (!latestUnsuccessfulShielding) {
      return {comp: scDepComp, step: 0};
    }
    switch (latestUnsuccessfulShielding.status) {
      case ETH_DEPOSIT_FAILED:
      case ETH_DEPOSITING_TO_INC_CONTRACT:
      case ETH_DEPOSITED_TO_INC_CONTRACT:
      case SHIELDING_PROOF_SUBMITTING:
      case SHIELDING_PROOF_SUBMITTED:
      case SHIELDING_PROOF_SUBMIT_REJECTED:
        return {comp: shieldingProofComp, step: 1};

      default:
        return {comp: scDepComp, step: 0};
    }
  }

  render() {
    const steps = getSteps();
    const {
      classes,
      latestUnsuccessfulShielding,
      skipForm,
      ethTxInfo,
      isOpenToolTip,
      formValidate,
    } = this.props;

    let message = ">> skip step 1";
    if (latestUnsuccessfulShielding) {
      message = ">> update deposit eth transaction hash";
    }
    let helperText = "Submit when you already deposited to incognito contract";
    if (latestUnsuccessfulShielding) {
      helperText = "Update Ethereum tx id if you've updated gas price on metamask";
    }


    const {comp, step} = this.displayStepContent();
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
        <Stepper alternativeLabel activeStep={latestUnsuccessfulShielding && latestUnsuccessfulShielding.status === SHIELDING_PROOF_SUBMITTED ? 2 : step} className={classes.stepper}>
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
            (!latestUnsuccessfulShielding || [SHIELDING_PROOF_SUBMIT_REJECTED, ETH_DEPOSIT_FAILED].includes(latestUnsuccessfulShielding.status) || !ethTxInfo || (latestUnsuccessfulShielding.status === ETH_DEPOSITING_TO_INC_CONTRACT && (!ethTxInfo.status || ethTxInfo.status === 2)))
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
          {latestUnsuccessfulShielding &&
          (latestUnsuccessfulShielding.status === SHIELDING_PROOF_SUBMIT_REJECTED ||
            latestUnsuccessfulShielding.status === ETH_DEPOSIT_FAILED) &&
          <Button onClick={this.createNewShielding}>
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
    onDeposit: (ethAccount, tempIncAccount, privateIncAccount, formInfo) => dispatch(depositThunk(ethAccount, tempIncAccount, privateIncAccount, formInfo)),
    onChangeSelectedToken: (selectedToken) => dispatch(changeSelectedToken(selectedToken)),
    onChangeAmount: (changingAmount) => dispatch(changeAmount(changingAmount)),
    onGetLatestUnsuccessfulShielding: (ethAccount) => dispatch(getLatestUnsuccessfulShieldingThunk(ethAccount)),
    onRefreshShieldingProofStep: (ethAccount) => dispatch(refreshShieldingProofStepThunk(ethAccount)),
    onUpdateCompleteShielding: (latestUnsuccessfulShielding, history) => dispatch(completeShieldingThunk(latestUnsuccessfulShielding, history)),
    onUpdateShielding: (skipForm) => dispatch(updateShieldingSkipStepThunk(skipForm)),
    onUpdateSkipForm: (skipForm) => dispatch(updateSkipForm(skipForm)),
    onCreateNewShielding: () => dispatch(updateShieldingSuccess(null)),
    onUpdateToolTip: (isOpenToolTip) => dispatch(updateToolTip(isOpenToolTip)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
  };
}

const mapStateToProps = createStructuredSelector({
  tempIncAccount: makeSelectTempIncAccount(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  formInfo: makeSelectFormInfo(),
  latestUnsuccessfulShielding: makeSelectLatestUnsuccessfulShielding(),
  ethTxInfo: makeSelectETHTxInfo(),
  depProofSubmitStatus: makeSelectDepProofSubmitStatus(),
  insufficientBalancesInfo: makeSelectInsufficientBalancesInfo(),
  refresher: makeSelectRefresher(),
  configNetwork: makeSelectConfigNetwork(),
  skipForm: makeSelectSkipForm(),
  isOpenToolTip: makeSelectToolTip(),
  formValidate: makeSelectValidateForm(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({key: 'shielding', reducer});

const withStylesShieldingPage = withStyles(styles);
const withWidthShieldingPage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesShieldingPage,
  withWidthShieldingPage,
)(ShieldingPage);
