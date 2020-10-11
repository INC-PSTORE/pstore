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
  ETH_UNDEPLOYED_FROM_INC_CONTRACT,
  ETH_UNDEPLOYING_FROM_INC_CONTRACT,
  UNDEPLOYED_PROOF_SUBMITTED,
  UNDEPLOYED_PROOF_SUBMITTING,
  UNDEPLOYED_PROOF_SUBMIT_REJECTED,
  UNDEPLOY_FINISHED,
  ETH_UNDEPLOYING_FAILED,
} from '../../common/constants';

import { getDefaultSupportedTokens } from '../../common/utils';
import ShieldingProof from '../../components/proof-shielding-step';
import SmartContractDeposit from '../../components/sc-deposit-shielding-step';

import {
  makeSelectPrivateIncAccount,
  makeSelectTempIncAccount,
  makeSelectGeneratedETHAccFromIncAcc,
} from '../App/selectors';

import { changeAmount, changeSelectedToken } from './actions';

import {
  undeployThunk,
  getLatestUnsuccessfulUndeployThunk,
  refreshUndeployProofStepThunk,
  updateUndeployThunk,
} from './middlewares';

import reducer from './reducer';

import {
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulUndeploy,
  makeSelectETHTxInfo,
  makeSelectInsufficientBalancesInfo,
} from './selectors';

import styles from './styles';


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
  }

  componentDidMount() {
    const {
      ethAccount,
      onGetLatestUnsuccessfulUndeploy,
    } = this.props;
    onGetLatestUnsuccessfulUndeploy(ethAccount);
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
    const { onChangeSelectedToken } = this.props;
    let supportedTokens = getDefaultSupportedTokens();
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
      />
    );
    const undeployProofComp = (
      <ShieldingProof
        ethAccount={ethAccount}
        latestUnsuccessfulShielding={latestUnsuccessfulUndeploy}
        ethTxInfo={ethTxInfo}
        onRefreshShieldingProofStep={onRefreshUndeployProofStep}
        onCheckBalances={this.checkBalances}
      />
    );

    if (!latestUnsuccessfulUndeploy) {
      return { comp: scUndeployComp, step: 0 };
    }
    switch (latestUnsuccessfulUndeploy.status) {
      case ETH_UNDEPLOYING_FAILED:
        return { comp: scDepComp, step: 0 };
      case ETH_UNDEPLOYING_FROM_INC_CONTRACT:
      case ETH_UNDEPLOYED_FROM_INC_CONTRACT:
      case UNDEPLOYED_PROOF_SUBMITTING:
      case UNDEPLOYED_PROOF_SUBMITTED:
      case UNDEPLOYED_PROOF_SUBMIT_REJECTED:
        return { comp: undeployProofComp, step: 1 };

      case UNDEPLOY_FINISHED:
        return { comp: scUndeployComp, step: 0 };

      default:
        return { comp: scUndeployComp, step: 0 };
    }
  }

  render() {
    const steps = getSteps();
    const {
      classes,
    } = this.props;

    const { comp, step } = this.displayStepContent();
    return (
      <div className={classes.root}>
        <Stepper alternativeLabel activeStep={step} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {comp}
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
