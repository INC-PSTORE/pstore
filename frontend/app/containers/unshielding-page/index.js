/*
* Unshield Page
*/

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {createStructuredSelector} from 'reselect';
import reducer from './reducer';
import injectReducer from 'utils/injectReducer';
import styles from './styles';
import {
  changeAmount,
  changeSelectedToken,
  changeStep,
  changeEthAddress,
  updateValidateForm,
  updateSkipForm,
  updateToolTip, getLatestUnsuccessfulUnshieldSuccess, updateEthTxInfo,
} from './actions';
import {
  makeSelectLatestUnsuccessfulUnshield,
  makeSelectUnshieldActiveStep,
  makeSelectETHTxDetail,
  makeSelectValidateForm,
  makeSelectFormInfo,
  makeSelectSkipForm,
  makeSelectToolTip,
} from './selectors';
import {
  getLatestUnsuccessfulUnshieldThunk,
  burnToUnshield,
  withdrawThunk,
  refreshUnshieldStepThunk,
} from './middlewares';
import BurnToWithdraw from '../../components/sc-unshielding-step';
import BurnProofToWithdraw from '../../components/sc-unshielding-submit-proof-step';

import {
  makeSelectConfigNetwork,
  makeSelectPrivateIncAccount,
} from '../App/selectors';
import Snackbar from "@material-ui/core/Snackbar";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormHelperText from "@material-ui/core/FormHelperText";
import {Button} from "@material-ui/core";
import {
  ETH_SUBMITING_TX,
  ETH_WITHDRAW_FAILED,
  ETH_WITHDRAW_SUCCESS,
  INC_BURNED_FAILED,
} from "../../common/constants";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import {getLocalStorageKeyUnshield} from "../../common/utils";


function getUnshieldSteps() {
  return ['Burn ptoken to unshield', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class UnshieldPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayStepContent = this.displayStepContent.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.createNewUnshield = this.createNewUnshield.bind(this);
    this.handleTooltipOpen = this.handleTooltipOpen.bind(this);
    this.handleTooltipClose = this.handleTooltipClose.bind(this);
    this.updateEthDepositTx = this.updateEthDepositTx.bind(this);
    this.skipStep = this.skipStep.bind(this);
    this.handleWithdrawInput = this.handleWithdrawInput.bind(this);
  }

  displayStepContent(activeStep) {
    const {
      onChangeSelectedToken,
      onChangeAmount,
      onChangeStep,
      onChangeEthAddress,
      onSubmitBurnTx,
      onSignAndSubmitBurnProof,
      onUpdateValidateForm,
      onRefreshAndGetProof,
      ethTxInfo,
      ethAccount,
      privateIncAccount,
      latestUnsuccessfulUnshield,
      formInfo,
      formValidate,
      history,
      configNetwork,
    } = this.props;

    switch (activeStep) {
      case 0:
        return (
          <BurnToWithdraw
            privateIncAccount={privateIncAccount}
            ethAccount={ethAccount}
            latestUnsuccessfulUnshield={latestUnsuccessfulUnshield}
            formInfo={formInfo}
            formValidate={formValidate}
            onChangeSelectedToken={onChangeSelectedToken}
            onChangeAmount={onChangeAmount}
            onChangeStep={onChangeStep}
            onChangeEthAddress={onChangeEthAddress}
            onSubmitBurnTx={onSubmitBurnTx}
            onUpdateValidateForm={onUpdateValidateForm}
            configNetwork={configNetwork}
          />
        );
      default:
        return (
          <BurnProofToWithdraw
            history={history}
            ethTxInfo={ethTxInfo}
            ethAccount={ethAccount}
            privateIncAccount={privateIncAccount}
            latestUnsuccessfulUnshield={latestUnsuccessfulUnshield}
            onRefreshAndGetProof={onRefreshAndGetProof}
            onSignAndSubmitBurnProof={onSignAndSubmitBurnProof}
            createNewUnshield={this.createNewUnshield}
          />
        );
    }
  }

  handleTooltipClose() {
    const {onUpdateToolTip} = this.props;
    onUpdateToolTip(false);
  }

  handleTooltipOpen() {
    const {onUpdateToolTip} = this.props;
    onUpdateToolTip(true);
  }

  createNewUnshield() {
    const {onCreateNewUnshield} = this.props;
    onCreateNewUnshield(null);
    localStorage.removeItem(getLocalStorageKeyUnshield());
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

  handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    const {formValidate, onUpdateValidateForm} = this.props;
    if (formValidate.snackBar) {
      onUpdateValidateForm(null);
    }
  }

  handleWithdrawInput = e => {
    const {skipForm, onUpdateSkipForm} = this.props;
    if (skipForm) {
      skipForm.ethTxId = e.target.value;
    }
    onUpdateSkipForm(skipForm ? skipForm : {ethTxId: e.target.value});
  }

  updateEthDepositTx() {
    const {skipForm, onUpdateSkipForm, onCreateNewUnshield, onUpdateEthTxInfo, latestUnsuccessfulUnshield} = this.props;
    let tempSkipForm;
    if (skipForm && skipForm.ethTxId && /^0x([A-Fa-f0-9]{64})$/.test(skipForm.ethTxId)) {
      let newUnshield = latestUnsuccessfulUnshield;
      newUnshield.ethtx = skipForm.ethTxId;
      onCreateNewUnshield(newUnshield);
      localStorage.setItem(getLocalStorageKeyUnshield(), JSON.stringify(newUnshield));
      onUpdateSkipForm(null);
      onUpdateEthTxInfo(null);
    } else {
      tempSkipForm = {isOpen: true, ethTxId: skipForm ? skipForm.ethTxId : '', message: "Invalid eth transaction"};
      onUpdateSkipForm(tempSkipForm);
    }
  }

  componentDidMount() {
    const {
      onGetLatestUnsuccessfulUnshielding,
      onChangeAmount,
      onChangeEthAddress,
      onUpdateValidateForm,
      onUpdateSkipForm,
    } = this.props;
    // TODO: replace these methods by rpc call to get pToken
    onChangeAmount();
    onChangeEthAddress("");
    onGetLatestUnsuccessfulUnshielding();
    onUpdateValidateForm(null);
    onUpdateSkipForm(null);
  }

  render() {
    const steps = getUnshieldSteps();
    const {
      classes,
      activeStep,
      formValidate,
      latestUnsuccessfulUnshield,
      ethTxInfo,
      skipForm,
      isOpenToolTip,
    } = this.props;

    let helperText = "Update Ethereum tx id if you've updated gas price on metamask";
    let skipTitle = ">> Update eth withdraw transaction"

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
        <Stepper alternativeLabel activeStep={latestUnsuccessfulUnshield && latestUnsuccessfulUnshield.status === ETH_WITHDRAW_SUCCESS ? 2 : activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {this.displayStepContent(activeStep)}
        <div className={classes.ethSkipStepWrapper}>
          {skipForm && skipForm.isOpen
            ?
            <FormControl fullWidth className={classes.ethSkipStep} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Inc burn transaction hash</InputLabel>
              <OutlinedInput
                error={!!(skipForm && skipForm.message)}
                id="outlined-adornment-amount"
                onChange={this.handleWithdrawInput}
                labelWidth={160}
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
            (latestUnsuccessfulUnshield && latestUnsuccessfulUnshield.status === ETH_SUBMITING_TX && (!ethTxInfo || (ethTxInfo.status === 2 || !ethTxInfo.status)))
              ?
              <div className={classes.skipStep}>
                <a className={classes.skipStepLink} onClick={this.skipStep}> {skipTitle} </a>
                <Grid item>
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
          {latestUnsuccessfulUnshield &&
          (latestUnsuccessfulUnshield.status === INC_BURNED_FAILED ||
            latestUnsuccessfulUnshield.status === ETH_WITHDRAW_FAILED) &&
          <Button onClick={this.createNewUnshield}>
            Create New Unshield
          </Button>
          }
        </div>
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onChangeSelectedToken: (selectedTokenId) => dispatch(changeSelectedToken(selectedTokenId)),
    onChangeAmount: (amountToBurn) => dispatch(changeAmount(amountToBurn)),
    onChangeEthAddress: (ethAddress) => dispatch(changeEthAddress(ethAddress)),
    onChangeStep: (stepNumber) => dispatch(changeStep(stepNumber)),
    onGetLatestUnsuccessfulUnshielding: () => dispatch(getLatestUnsuccessfulUnshieldThunk()),
    onSubmitBurnTx: (formInfo, privateIncAccount) => dispatch(burnToUnshield(formInfo, privateIncAccount)),
    onSignAndSubmitBurnProof: (ethAccount, unshieldObject) => dispatch(withdrawThunk(ethAccount, unshieldObject)),
    onRefreshAndGetProof: () => dispatch(refreshUnshieldStepThunk()),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
    onUpdateSkipForm: (skipForm) => dispatch(updateSkipForm(skipForm)),
    onCreateNewUnshield: (unshield) => dispatch(getLatestUnsuccessfulUnshieldSuccess(unshield)),
    onUpdateToolTip: (isOpenToolTip) => dispatch(updateToolTip(isOpenToolTip)),
    onUpdateEthTxInfo: (ethTxInfo) => dispatch(updateEthTxInfo(ethTxInfo)),
  }
}

const mapStateToProps = createStructuredSelector({
  activeStep: makeSelectUnshieldActiveStep(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  ethTxInfo: makeSelectETHTxDetail(),
  formInfo: makeSelectFormInfo(),
  latestUnsuccessfulUnshield: makeSelectLatestUnsuccessfulUnshield(),
  formValidate: makeSelectValidateForm(),
  configNetwork: makeSelectConfigNetwork(),
  skipForm: makeSelectSkipForm(),
  isOpenToolTip: makeSelectToolTip(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({key: 'unshield', reducer});

const withStylesUnshieldPage = withStyles(styles);
const withWidthUnshieldPage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesUnshieldPage,
  withWidthUnshieldPage,
)(UnshieldPage);
