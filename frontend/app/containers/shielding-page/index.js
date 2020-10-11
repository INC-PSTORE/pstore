/*
* ShieldingPage
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
  ETH_DEPOSITED_TO_INC_CONTRACT,
  ETH_DEPOSITING_TO_INC_CONTRACT,
  PRIVATE_TRANSFERRED,
  PRIVATE_TRANSFERRING,
  PRIVATE_TRANSFER_FAILED,
  ETH_DEPOSIT_FAILED,
  SHIELDING_PROOF_SUBMITTED,
  SHIELDING_PROOF_SUBMITTING,
  SHIELDING_PROOF_SUBMIT_REJECTED,
  SHIELDING_FINISHED,
} from '../../common/constants';

import { getDefaultSupportedTokens } from '../../common/utils';
import PrivateTransfer from '../../components/private-transfer-shielding-step';
import ShieldingProof from '../../components/proof-shielding-step';
import SmartContractDeposit from '../../components/sc-deposit-shielding-step';

import {
  makeSelectPrivateIncAccount,
  makeSelectTempIncAccount,
} from '../App/selectors';

import { changeAmount, changeSelectedToken } from './actions';

import {
  depositThunk,
  getLatestUnsuccessfulShieldingThunk,
  refreshShieldingProofStepThunk,
  updateShieldingThunk,
} from './middlewares';

import reducer from './reducer';

import {
  // makeSelectActiveStep,
  makeSelectFormInfo,
  makeSelectLatestUnsuccessfulShielding,
  makeSelectETHTxInfo,
  makeSelectDepProofSubmitStatus,
  makeSelectInsufficientBalancesInfo,
  makeSelectRefresher,
} from './selectors';

import styles from './styles';


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
  }

  componentDidMount() {
    const {
      onGetLatestUnsuccessfulShielding,
    } = this.props;
    onGetLatestUnsuccessfulShielding(null);
  }

  checkBalances() {
    const { history, latestUnsuccessfulShielding, onUpdateShielding } = this.props;
    onUpdateShielding(latestUnsuccessfulShielding, history);
  }

  deposit(ethAccount, tempIncAccount, privateIncAccount, formInfo) {
    const { onDeposit } = this.props;
    onDeposit(ethAccount, tempIncAccount, privateIncAccount, formInfo);
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
      latestUnsuccessfulShielding,
      ethTxInfo,
      insufficientBalancesInfo,
      onRefreshShieldingProofStep,
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
    // const privTransferComp = (
    //   <PrivateTransfer
    //     latestUnsuccessfulShielding={latestUnsuccessfulShielding}
    //   />
    // );


    if (!latestUnsuccessfulShielding) {
      return { comp: scDepComp, step: 0 };
    }
    switch (latestUnsuccessfulShielding.status) {
      case ETH_DEPOSIT_FAILED:
        return { comp: scDepComp, step: 0 };
      case ETH_DEPOSITING_TO_INC_CONTRACT:
      case ETH_DEPOSITED_TO_INC_CONTRACT:
      case SHIELDING_PROOF_SUBMITTING:
      case SHIELDING_PROOF_SUBMITTED:
      case SHIELDING_PROOF_SUBMIT_REJECTED:
        return { comp: shieldingProofComp, step: 1 };

      case SHIELDING_FINISHED:
        return { comp: scDepComp, step: 0 };

      // case PRIVATE_TRANSFERRING:
      // case PRIVATE_TRANSFERRED:
      // case PRIVATE_TRANSFER_FAILED:
      //   return { comp: privTransferComp, step: 2 };

      default:
        return { comp: scDepComp, step: 0 };
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
    onDeposit: (ethAccount, tempIncAccount, privateIncAccount, formInfo) => dispatch(depositThunk(ethAccount, tempIncAccount, privateIncAccount, formInfo)),
    onChangeSelectedToken: (selectedToken) => dispatch(changeSelectedToken(selectedToken)),
    onChangeAmount: (changingAmount) => dispatch(changeAmount(changingAmount)),
    onGetLatestUnsuccessfulShielding: (ethAccount) => dispatch(getLatestUnsuccessfulShieldingThunk(ethAccount)),
    onRefreshShieldingProofStep: (ethAccount) => dispatch(refreshShieldingProofStepThunk(ethAccount)),
    onUpdateShielding: (latestUnsuccessfulShielding, history) => dispatch(updateShieldingThunk(latestUnsuccessfulShielding, history)),
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
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'shielding', reducer });

const withStylesShieldingPage = withStyles(styles);
const withWidthShieldingPage = withWidth();

export default compose(
  withReducer,
  withConnect,
  withStylesShieldingPage,
  withWidthShieldingPage,
)(ShieldingPage);
