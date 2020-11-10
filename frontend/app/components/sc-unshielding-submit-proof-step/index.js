/*
* BurnToWithdraw
*/
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';
import React from 'react';
import {compose} from 'redux';
import styles from './styles';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {
  INC_BURNED_NOT_FOUND,
  INC_BURNED_TO_UNSHIELD,
  INC_BURN_TO_UNSHIELD_INIT,
  INC_BURNED_SUCCESS,
  INC_BURNED_FAILURE,
  INC_TRANSACTION_REJECTED,
  ETH_SUBMITING_TX,
  ETH_SUBMITED_TX,
  ETH_WITHDRAW_UNKNOWN,
  ETH_TRANSACTION_RECJECTED,
  ETH_WITHDRAW_SUCCESS, INC_BURNED_FAILED, ETH_WITHDRAW_FAILED,
} from "../../common/constants";
import {Paper} from '@material-ui/core';
import CircularProgress from "@material-ui/core/CircularProgress";

let refresher = null;

/* eslint-disable react/prefer-stateless-function */
export class BurnProofToWithdraw extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayForm = this.displayForm.bind(this);
    this.signAndSubmitToUnshield = this.signAndSubmitToUnshield.bind(this);
    this.redirectToAccounts = this.redirectToAccounts.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  signAndSubmitToUnshield() {
    const {latestUnsuccessfulUnshield, onSignAndSubmitBurnProof, ethAccount} = this.props;
    onSignAndSubmitBurnProof(ethAccount, latestUnsuccessfulUnshield);
  }

  redirectToAccounts() {
    const {history, createNewUnshield} = this.props;
    history.push('/wallet');
    createNewUnshield();
  }

  createData(fieldName, value) {

    return {fieldName, value};
  }

  componentDidMount() {
    const {latestUnsuccessfulUnshield, onRefreshAndGetProof} = this.props;
    onRefreshAndGetProof();
    if (latestUnsuccessfulUnshield && [INC_BURN_TO_UNSHIELD_INIT, ETH_SUBMITING_TX].includes(latestUnsuccessfulUnshield.status)) {
      refresher = setInterval(this.refresh, 30000); // run every 30s
    }
  }

  componentWillUnmount() {
    if (refresher) {
      clearInterval(refresher);
    }
    refresher = null;
  }

  componentDidUpdate(prevProps) {
    const {latestUnsuccessfulUnshield} = this.props;
    if (latestUnsuccessfulUnshield && [ETH_WITHDRAW_SUCCESS, INC_BURNED_FAILED, ETH_WITHDRAW_FAILED].includes(latestUnsuccessfulUnshield.status)) {
      if (refresher) {
        clearInterval(refresher);
      }
      refresher = null;
    }
  }

  refresh() {
    const {latestUnsuccessfulUnshield, onRefreshAndGetProof} = this.props;
    if (latestUnsuccessfulUnshield && [INC_BURN_TO_UNSHIELD_INIT, ETH_SUBMITING_TX].includes(latestUnsuccessfulUnshield.status)) {
      onRefreshAndGetProof();
    }
  }

  displayForm() {
    const {classes, latestUnsuccessfulUnshield, isDeploy} = this.props;
    if (latestUnsuccessfulUnshield && latestUnsuccessfulUnshield.status === INC_BURNED_SUCCESS) {
      return (
        <Paper className={classes.unshield} elevation={1}>
          <TextField
            className={classes.burnProof}
            id="outlined-read-only-input"
            label="Proof"
            value={latestUnsuccessfulUnshield.ethrawinput}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={this.signAndSubmitToUnshield}
            className={classes.unshieldButton}
          >
            {isDeploy ? "Deploy" : "Unshield"}
          </Button>
        </Paper>
      )
    } else if (latestUnsuccessfulUnshield && latestUnsuccessfulUnshield.status === ETH_WITHDRAW_SUCCESS) {
      return (
        <div>
          <Button
            className={classes.actionButton}
            variant="contained"
            color="primary"
            onClick={this.redirectToAccounts}
          >
            Check Balances
          </Button>
        </div>
      )
    }
  }

  render() {
    const {classes, latestUnsuccessfulUnshield, ethTxInfo, isDeploy} = this.props;
    if (latestUnsuccessfulUnshield) {
      let status = 'Success';
      switch (latestUnsuccessfulUnshield.status) {
        case INC_BURN_TO_UNSHIELD_INIT:
          status = 'Submiting'
          break;
        case INC_BURNED_TO_UNSHIELD:
          status = 'Submitted'
          break;
        case INC_BURNED_NOT_FOUND:
          status = 'Not Found'
          break;
        case INC_BURNED_FAILED:
          status = 'Failed'
          break;
        case INC_TRANSACTION_REJECTED:
          status = 'Rejected'
          break;
        default:
          break;
      }

      let depProofSubmitStatusRows = [
        this.createData('TransactionID', latestUnsuccessfulUnshield.inctx),
        this.createData('Status', status),
      ];

      let withdrawEthStatus = [];
      if (ethTxInfo && latestUnsuccessfulUnshield.status > INC_TRANSACTION_REJECTED) {
        withdrawEthStatus = [
          this.createData('Transaction hash', ethTxInfo.hash),
          this.createData('Status', ethTxInfo.status === 2 || ethTxInfo.status === undefined  ? 'Pending' : 1 ? 'Success' : 'Reverted'),
          this.createData('Block', ethTxInfo.blockNumber),
          this.createData('From', ethTxInfo.from),
          this.createData('To', ethTxInfo.to),
          this.createData('Value', ethTxInfo.value / 1e18 + ' ETH'),
          this.createData('Transaction Gas', ethTxInfo.gas),
        ]
      }

      let disableGetProof = false;
      if ([INC_BURNED_SUCCESS, INC_BURNED_FAILED, ETH_WITHDRAW_FAILED, ETH_WITHDRAW_SUCCESS].includes(latestUnsuccessfulUnshield.status)) {
        disableGetProof = true;
      }
      return (
        <div className={classes.root}>
          <div className={classes.getProof}>
            <ExpansionPanel
              square
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography> Burn to {isDeploy ? "deploy" : "unshield"} transaction status </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Table className={classes.table} aria-label="simple table">
                  <TableBody>
                    {depProofSubmitStatusRows.map((row) => (
                      <TableRow key={row.fieldName}>
                        <TableCell align="left" className={classes.tableCellKey}>{row.fieldName}</TableCell>
                        <TableCell align="left" className={classes.tableCell}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>

          {ethTxInfo &&
          <div className={classes.getProof}>
            <ExpansionPanel
              square
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography> {isDeploy ? "Deploy" : "Withdraw"} transaction on ethereum status </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Table className={classes.table} aria-label="simple table">
                  <TableBody>
                    {withdrawEthStatus.map((row) => (
                      <TableRow key={row.fieldName}>
                        <TableCell align="left" className={classes.tableCellKey}>{row.fieldName}</TableCell>
                        <TableCell align="left" className={classes.tableCell}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
          }
          {!disableGetProof &&
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
          {this.displayForm()}
        </div>
      );
    } else {
      return (
        <div>
          Waiting for responses from server
        </div>
      )
    }
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(BurnProofToWithdraw);
