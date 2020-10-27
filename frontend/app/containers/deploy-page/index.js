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
import {changeAmount, changeSelectedToken, changeStep, updateValidateForm} from './actions';
import {
  makeSelectLatestUnsuccessfulDeploy,
  makeSelectDeployActiveStep,
  makeSelectETHTxDetail,
  makeSelectValidateForm,
  makeSelectFormInfo
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


function getDeploySteps() {
  return ['Burn pToken to deposit to pApps', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class DeployPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayStepContent = this.displayStepContent.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
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
          />
        );
      // return null;
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
      privateIncAccount,
      onGetLatestUnsuccessfulDeploy,
      onChangeAmount,
      onUpdateValidateForm,
    } = this.props;
    // TODO: replace these methods by rpc call to get pToken
    onChangeAmount();
    onGetLatestUnsuccessfulDeploy(privateIncAccount.address);
    onUpdateValidateForm(null);
  }

  render() {
    const steps = getDeploySteps();
    const {
      classes,
      activeStep,
      formValidate,
    } = this.props;
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
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onChangeSelectedToken: (selectedTokenId) => dispatch(changeSelectedToken(selectedTokenId)),
    onChangeAmount: (amountToBurn) => dispatch(changeAmount(amountToBurn)),
    onChangeStep: (stepNumber) => dispatch(changeStep(stepNumber)),
    onGetLatestUnsuccessfulDeploy: (incAddress) => dispatch(getLatestUnsuccessfulDeployThunk(incAddress)),
    onSubmitBurnTx: (formInfo, privateIncAccount) => dispatch(burnToDeploy(formInfo, privateIncAccount)),
    onSignAndSubmitBurnProof: (ethAccount, deployObject) => dispatch(submitDeployToSC(ethAccount, deployObject)),
    onRefreshAndGetProof: (privateIncAccount) => dispatch(refreshDeployStepThunk(privateIncAccount)),
    onGetDeployById: (deployId) => dispatch(getDeployById(deployId)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
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
