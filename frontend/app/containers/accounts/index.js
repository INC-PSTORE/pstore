import React from 'react';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import cn from 'classnames';
import AccountContent from '../account-content';
import styles from './styles';
import {compose} from "redux";
import {
  makeSelectPrivateIncAccount, makeSelectTempIncAccount,
  makeSelectPrivIncAccPrivateKey,
  makeSelectTempIncAccPrivateKey,
  makeSelectGeneratedETHAccFromIncAcc,
} from "../App/selectors";
import {createStructuredSelector} from "reselect";
import {
  PRIVATE_INC_ACC_NAME,
  TEMP_INC_ACC_NAME,
  ETH_ACC_NAME,
  ETH_TAB_ID,
  PRIV_INC_ACC_TAB_ID,
  TEMP_INC_ACC_TAB_ID,
  ETH_DEPLOYED_BALANCES_ID,
  ETH_DEPLOYED_BALANCES_NAME,
} from './constants';

import Container from '../../components/container';

const TABS = [
  {
    id: ETH_TAB_ID,
    label: ETH_ACC_NAME,
  },
  {
    id: PRIV_INC_ACC_TAB_ID,
    label: PRIVATE_INC_ACC_NAME,
  },
  // {
  //   id: TEMP_INC_ACC_TAB_ID,
  //   label: TEMP_INC_ACC_NAME,
  // }
];

class Accounts extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      selectedAccountID: PRIV_INC_ACC_TAB_ID
    };
  }

  onChangeTab(tabId) {
    this.setState({selectedAccountID: tabId});
  }

  render() {
    const { selectedAccountID } = this.state;
    const {
      classes,
      generatedETHAccFromIncAcc,
    } = this.props;

    const filterRes = TABS.filter(tab => tab.id === ETH_DEPLOYED_BALANCES_ID);
    if (generatedETHAccFromIncAcc.privateKey && filterRes.length === 0) {
      TABS.push({
        id: ETH_DEPLOYED_BALANCES_ID,
        label: ETH_DEPLOYED_BALANCES_NAME,
      });
    }

    return (
      <Container>
        <div className={classes.container}>
          <div className={classes.tabs}>
            {
              TABS.map(tab =>
                <div
                  className={cn(classes.tab, selectedAccountID === tab.id && classes.tabActive)}
                  key={tab.id}
                  onClick={() => this.onChangeTab(tab.id)}
                >
                  {tab.label}
                </div>
              )
            }
          </div>
          <div className={classes.tabContent}>
            <AccountContent tabId={selectedAccountID}/>
          </div>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector(
  {
    generatedETHAccFromIncAcc: makeSelectGeneratedETHAccFromIncAcc(),
    privateIncAccount: makeSelectPrivateIncAccount(),
    tempIncAccount: makeSelectTempIncAccount(),

    privIncAccPrivateKey: makeSelectPrivIncAccPrivateKey(),
    tempIncAccPrivateKey: makeSelectTempIncAccPrivateKey(),
  }
)

// const mapDispatchToProps = (dispatch) => {
//   return {
//     importETHAccount: (privateKeyStr) => dispatch(importETHAccountAction(privateKeyStr)),
//   };
// };

let withConnect = connect(
  mapStateToProps,
  null
);
const withStylesAccounts = withStyles(styles);

export default compose(
  withConnect,
  withStylesAccounts
)(Accounts);

