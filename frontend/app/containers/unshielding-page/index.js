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
import {changeAmount, changeSelectedToken, changeStep, changeEthAddress, updateValidateForm} from './actions';
import {
  makeSelectLatestUnsuccessfulUnshield,
  makeSelectUnshieldActiveStep,
  makeSelectETHTxDetail,
  makeSelectValidateForm,
  makeSelectFormInfo
} from './selectors';
import {
  getLatestUnsuccessfulUnshieldThunk,
  burnToUnshield,
  withdrawThunk,
  refreshUnshieldStepThunk,
  getUnshieldById
} from './middlewares';
import BurnToWithdraw from '../../components/sc-unshielding-step';
import BurnProofToWithdraw from '../../components/sc-unshielding-submit-proof-step';

import {
  makeSelectPrivateIncAccount,
} from '../App/selectors';
import Snackbar from "@material-ui/core/Snackbar";


function getUnshieldSteps() {
  return ['Burn ptoken to unshield', 'Get & submit proof'];
}

/* eslint-disable react/prefer-stateless-function */
export class UnshieldPage extends React.PureComponent {
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
      onChangeEthAddress,
      onSubmitBurnTx,
      onSignAndSubmitBurnProof,
      onGetUnshieldById,
      onUpdateValidateForm,
      onRefreshAndGetProof,
      ethTxInfo,
      ethAccount,
      privateIncAccount,
      latestUnsuccessfulUnshield,
      formInfo,
      formValidate,
      history,
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
            onGetUnshieldById={onGetUnshieldById}
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
      onGetLatestUnsuccessfulUnshielding,
      onChangeAmount,
      onChangeEthAddress,
      onUpdateValidateForm,
    } = this.props;
    // TODO: replace these methods by rpc call to get pToken
    onChangeAmount();
    onChangeEthAddress("");
    onGetLatestUnsuccessfulUnshielding(privateIncAccount.address);
    onUpdateValidateForm(null);
  }

  render() {
    const steps = getUnshieldSteps();
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
    onChangeEthAddress: (ethAddress) => dispatch(changeEthAddress(ethAddress)),
    onChangeStep: (stepNumber) => dispatch(changeStep(stepNumber)),
    onGetLatestUnsuccessfulUnshielding: (incAddress) => dispatch(getLatestUnsuccessfulUnshieldThunk(incAddress)),
    onSubmitBurnTx: (formInfo, privateIncAccount) => dispatch(burnToUnshield(formInfo, privateIncAccount)),
    onSignAndSubmitBurnProof: (ethAccount, unshieldObject) => dispatch(withdrawThunk(ethAccount, unshieldObject)),
    onRefreshAndGetProof: (privateIncAccount) => dispatch(refreshUnshieldStepThunk(privateIncAccount)),
    onGetUnshieldById: (unshieldId) => dispatch(getUnshieldById(unshieldId)),
    onUpdateValidateForm: (validateForm) => dispatch(updateValidateForm(validateForm)),
  }
}

const mapStateToProps = createStructuredSelector({
  activeStep: makeSelectUnshieldActiveStep(),
  privateIncAccount: makeSelectPrivateIncAccount(),
  ethTxInfo: makeSelectETHTxDetail(),
  formInfo: makeSelectFormInfo(),
  latestUnsuccessfulUnshield: makeSelectLatestUnsuccessfulUnshield(),
  formValidate: makeSelectValidateForm(),
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
