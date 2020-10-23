/*
* ShieldingProof
*/

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { compose } from 'redux';
import styles from './styles';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';

import {
  SHIELDING_PROOF_SUBMITTING,
  SHIELDING_PROOF_SUBMITTED,
  SHIELDING_PROOF_SUBMIT_REJECTED,
  ETH_DEPOSIT_FAILED,
  ETH_DEPOSITING_TO_INC_CONTRACT,
  ETH_DEPOSITED_TO_INC_CONTRACT,
} from '../../common/constants';
import {withStyles} from "@material-ui/core/styles";

let refresher = null;

/* eslint-disable react/prefer-stateless-function */
export class ShieldingProof extends React.PureComponent {
  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    const { latestUnsuccessfulShielding, onRefreshShieldingProofStep, ethAccount } = this.props;
    onRefreshShieldingProofStep(ethAccount);

    if (!latestUnsuccessfulShielding || [ETH_DEPOSITING_TO_INC_CONTRACT, SHIELDING_PROOF_SUBMITTING, ETH_DEPOSITED_TO_INC_CONTRACT].includes(latestUnsuccessfulShielding.status)) {
      refresher = setInterval(this.refresh, 10000); // run every 10s
    }
  }

  componentWillUnmount() {
    if (refresher) {
      clearInterval(refresher);
    }
    refresher = null;
  }

  componentDidUpdate(prevProps) {
    const { latestUnsuccessfulShielding } = this.props;
    if (latestUnsuccessfulShielding && ([SHIELDING_PROOF_SUBMIT_REJECTED, ETH_DEPOSIT_FAILED, SHIELDING_PROOF_SUBMITTED].includes(latestUnsuccessfulShielding.status))) {
      if (refresher) {
        clearInterval(refresher);
      }
      refresher = null;
    }
  }

  refresh() {
    const { ethAccount, onRefreshShieldingProofStep } = this.props;
    onRefreshShieldingProofStep(ethAccount);
  }

  createData(fieldName, value) {
    return { fieldName, value };
  }

  render() {
    const {
      classes,
      onCheckBalances,
      ethTxInfo,
      latestUnsuccessfulShielding,
    } = this.props;

    let ethTxInfoRows = [];
    if (ethTxInfo) {
      ethTxInfoRows = [
        this.createData('Transaction hash', ethTxInfo.hash),
        this.createData('Status', ethTxInfo.status === 2 || ethTxInfo.status === undefined ? 'Pending' : 1 ? 'Succeeded' : 'Reverted'),
        this.createData('Block', ethTxInfo.blockNumber),
        this.createData('From', ethTxInfo.from),
        this.createData('To', ethTxInfo.to),
        this.createData('Value', ethTxInfo.value / 1e18 + ' ETH'),
        this.createData('Transaction Gas', ethTxInfo.gas),
      ];
    }

    let status = 'Not found';
    switch (latestUnsuccessfulShielding.status) {
      case SHIELDING_PROOF_SUBMITTING:
        status = 'Processing'
        break;
      case SHIELDING_PROOF_SUBMITTED:
        status = 'Succeeded'
        break;
      case SHIELDING_PROOF_SUBMIT_REJECTED:
        status = 'Rejected'
        break;
      default:
        break;
    }
    let depProofSubmitStatusRows = [
      this.createData('Status', status),
    ];

    return (
      <div className={classes.root}>
        <ExpansionPanel
          className={classes.shieldProof}
          square
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Deposit to Incognito smart contract</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Table aria-label="simple table">
              <TableBody>
                {ethTxInfoRows.map((row) => (
                  <TableRow key={row.fieldName}>
                    <TableCell className={classes.tableCellKey} align="left">{row.fieldName}</TableCell>
                    <TableCell className={classes.tableCell} align="left">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {(latestUnsuccessfulShielding && latestUnsuccessfulShielding.status >= SHIELDING_PROOF_SUBMITTING) &&
          <ExpansionPanel
            className={classes.shieldProof}
            square
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Get and Submit deposit proof to Incognito chain</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Table aria-label="simple table">
                <TableBody>
                  {depProofSubmitStatusRows.map((row) => (
                    <TableRow key={row.fieldName}>
                      <TableCell className={classes.tableCellKey} align="left">{row.fieldName}</TableCell>
                      <TableCell className={classes.tableCell} align="left">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        }
        {(!latestUnsuccessfulShielding || [ETH_DEPOSITING_TO_INC_CONTRACT, SHIELDING_PROOF_SUBMITTING, ETH_DEPOSITED_TO_INC_CONTRACT].includes(latestUnsuccessfulShielding.status)) &&
          <div className={classes.refresher}>
            <CircularProgress
              variant="indeterminate"
              disableShrink
              size={24}
              thickness={4}
              className={classes.cirProgress}
            />
            <Typography>status updating...</Typography>
          </div>
        }
        <div className={classes.buttons}>
          {(latestUnsuccessfulShielding && latestUnsuccessfulShielding.status === SHIELDING_PROOF_SUBMITTED) &&
            <Button
              variant="contained"
              color="primary"
              onClick={onCheckBalances}
              className={classes.buttons}
            >
              Check Balances
            </Button>
          }

          {/* <Button
            variant="contained"
            color="primary"
            onClick={onGetProofAndSubmit}
            className={classes.buttons}
          >
            Transfer To Private account
          </Button> */}
        </div>
      </div>
    );
  }
}
const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(ShieldingProof);
