/*
* Deploy Page
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
import {changeAmount, changeSelectedToken, changeStep, updateValidateForm, updateEthTxInfo, updateToolTip, getLatestUnsuccessfulDeploySuccess} from './actions';
import {
  makeSelectLatestUnsuccessfulDeploy,
  makeSelectDeployActiveStep,
  makeSelectETHTxDetail,
  makeSelectValidateForm,
  makeSelectFormInfo,
  makeSelectToolTip,
  makeSelectSkipForm,
} from './selectors';
import {
  getLatestUnsuccessfulDeployThunk,
  burnToDeploy,
  submitDeployToSC,
  refreshDeployStepThunk,
  getDeployById
} from './middlewares';
import BurnToDeploy from '../../components/sc-deploy-step';
import BurnProofToDeploy from '../../components/sc-deploy-submit-proof-step';

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
import {ETH_SUBMITING_TX, ETH_WITHDRAW_FAILED, INC_BURNED_FAILED} from "../../common/constants";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import {getLocalStorageKeyDeploy} from "../../common/utils";

function getDeploySteps() {
  return ['Burn pToken to deposit to pApps', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class DeployPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayStepContent = this.displayStepContent.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleWithdrawInput = this.handleWithdrawInput.bind(this);
    this.updateEthDepositTx = this.updateEthDepositTx.bind(this);
    this.handleTooltipClose = this.handleTooltipClose.bind(this);
    this.handleTooltipOpen = this.handleTooltipOpen.bind(this);
    this.createNewDeploy = this.createNewDeploy.bind(this);
    this.skipStep = this.skipStep.bind(this);
  }

  displayStepContent(activeStep) {
    const {
      onChangeSelectedToken,
      onChangeAmount,
      onChangeStep,
      onSubmitBurnTx,
      onSignAndSubmitBurnProof,
      onGetDeployById,
      onUpdateValidateForm,
      onRefreshAndGetProof,
      ethTxInfo,
      ethAccount,
      privateIncAccount,
      latestUnsuccessfulDeploy,
      formInfo,
      formValidate,
      history,
      configNetwork,
    } = this.props;

    switch (activeStep) {
      case 0:
        return (
          <BurnToDeploy
            privateIncAccount={privateIncAccount}
            latestUnsuccessfulDeploy={latestUnsuccessfulDeploy}
            formInfo={formInfo}
            formValidate={formValidate}
            onChangeSelectedToken={onChangeSelectedToken}
            onChangeAmount={onChangeAmount}
            onChangeStep={onChangeStep}
            onSubmitBurnTx={onSubmitBurnTx}
            onUpdateValidateForm={onUpdateValidateForm}
            configNetwork={configNetwork}
          />
        );
      default:
        return (
          <BurnProofToDeploy
            history={history}
            ethTxInfo={ethTxInfo}
            ethAccount={ethAccount}
            privateIncAccount={privateIncAccount}
            latestUnsuccessfulDeploy={latestUnsuccessfulDeploy}
            onRefreshAndGetProof={onRefreshAndGetProof}
            onSignAndSubmitBurnProof={onSignAndSubmitBurnProof}
            onGetDeployById={onGetDeployById}
            createNewDeploy={this.createNewDeploy}
          />
        );
    }
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

  componentDidMount() {
    const {
      onGetLatestUnsuccessfulDeploy,
      onChangeAmount,
      onUpdateValidateForm,
      onUpdateEthTxInfo,
    } = this.props;
    // TODO: replace these methods by rpc call to get pToken
    onChangeAmount();
    onGetLatestUnsuccessfulDeploy();
    onUpdateValidateForm(null);
    onUpdateEthTxInfo(null);
  }

  handleWithdrawInput = e => {
    const {skipForm, onUpdateSkipForm} = this.props;
    if (skipForm) {
      skipForm.ethTxId = e.target.value;
    }
    onUpdateSkipForm(skipForm ? skipForm : {ethTxId: e.target.value});
  }

  updateEthDepositTx() {
    const {skipForm, onUpdateSkipForm, onCreateNewDeploy, onUpdateEthTxInfo, latestUnsuccessfulDeploy} = this.props;
    let tempSkipForm;
    if (skipForm && skipForm.ethTxId && /^0x([A-Fa-f0-9]{64})$/.test(skipForm.ethTxId)) {
      let newDeploy = latestUnsuccessfulDeploy;
      newDeploy.ethtx = skipForm.ethTxId;
      onCreateNewDeploy(newDeploy);
      localStorage.setItem(getLocalStorageKeyDeploy(), JSON.stringify(newDeploy));
      onUpdateSkipForm(null);
      onUpdateEthTxInfo(null);
    } else {
      tempSkipForm = {isOpen: true, ethTxId: skipForm ? skipForm.ethTxId : '', message: "Invalid eth transaction"};
      onUpdateSkipForm(tempSkipForm);
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

  createNewDeploy() {
    const {onCreateNewDeploy} = this.props;
    onCreateNewDeploy(null);
    localStorage.removeItem(getLocalStorageKeyDeploy());
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

  render() {
    const steps = getDeploySteps();
    const {
      classes,
      activeStep,
      formValidate,
      latestUnsuccessfulDeploy,
      skipForm,
      isOpenToolTip,
      ethTxInfo,
    } = this.props;

    let helperText = "Update Ethereum tx id if you've updated gas price on metamask";
    let skipTitle = ">> Update eth deposit to dapps transaction"

    return (
      <div className={classes.root}>
        {formValidate && formValidate.snackBar && formValidate.snackBar.isError &&
        <Snackbar
          className={classes.snackBar}
          // bodyStyle={{ backgroundColor: '#f44336', color: 'white' }}
          ContentProps={{
            className: classes.snackBarContent,
          }}
          open={formValidate.snackBar.isError}
          autoHideDuration={3000}
          message={formValidate.snackBar.message}
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
        <Stepper alternativeLabel activeStep={activeStep} className={classes.stepper}>
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
            (latestUnsuccessfulDeploy && ethTxInfo && latestUnsuccessfulDeploy.status === ETH_SUBMITING_TX && (ethTxInfo.status === 2 || !ethTxInfo.status))
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
          {latestUnsuccessfulDeploy &&
          (latestUnsuccessfulDeploy.status === INC_BURNED_FAILED ||
            latestUnsuccessfulDeploy.status === ETH_WITHDRAW_FAILED) &&
          <Button onClick={this.createNewDeploy}>
            Create New Deploy
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
    onChangeStep: (stepNumber) => dispatch(changeStep(stepNumber)),
    onGetLatestUnsuccessfulDeploy: () => dispatch(getLatestUnsuccessfulDeployThunk()),
    onSubmitBurnTx: (formInfo, privateIncAccount) => dispatch(burnToDeploy(formInfo, privateIncAccount)),
    onSignAndSubmitBurnProof: (ethAccount, deployObject) => dispatch(submitDeployToSC(ethAccount, deployObject)),
    onRefreshAndGetProof: () => dispatch(refreshDeployStepThunk()),
    onGetDeployById: (deployId) => dispatch(getDeployById(deployId)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
    onCreateNewDeploy: (deploy) => dispatch(getLatestUnsuccessfulDeploySuccess(deploy)),
    onUpdateToolTip: (isOpenToolTip) => dispatch(updateToolTip(isOpenToolTip)),
    onUpdateEthTxInfo: (ethTxInfo) => dispatch(updateEthTxInfo(ethTxInfo)),
  }
}

const mapStateToProps = createStructuredSelector({
  activeStep: makeSelectDeployActiveStep(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  ethTxInfo: makeSelectETHTxDetail(),
  formInfo: makeSelectFormInfo(),
  latestUnsuccessfulDeploy: makeSelectLatestUnsuccessfulDeploy(),
  formValidate: makeSelectValidateForm(),
  configNetwork: makeSelectConfigNetwork(),
  skipForm: makeSelectSkipForm(),
  isOpenToolTip: makeSelectToolTip(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({key: 'deploy', reducer});

const withStylesDeployPage = withStyles(styles);
const withWidthDeployPage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesDeployPage,
  withWidthDeployPage,
)(DeployPage);
