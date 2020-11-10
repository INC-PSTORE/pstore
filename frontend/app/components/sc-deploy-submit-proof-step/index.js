/*
* BurnToDeploy
*/
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
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
  INC_BURNED_TO_DEPLOY,
  INC_BURN_TO_DEPLOY_INIT,
  INC_BURNED_SUCCESS,
  INC_TRANSACTION_REJECTED,
  ETH_SUBMITING_TX,
  ETH_DEPLOY_SUCCESS,
  INC_BURNED_FAILED,
  ETH_DEPLOY_FAILED, ETH_WITHDRAW_FAILED, ETH_WITHDRAW_SUCCESS, INC_BURN_TO_UNSHIELD_INIT, INC_BURNED_TO_UNSHIELD,
} from "../../common/constants";
import {Paper} from '@material-ui/core';
import CircularProgress from "@material-ui/core/CircularProgress";

let refresher = null;

/* eslint-disable react/prefer-stateless-function */
export class BurnProofToDeploy extends React.PureComponent {
  constructor(props) {
    super(props);
    this.displayForm = this.displayForm.bind(this);
    this.signAndSubmitToDeploy = this.signAndSubmitToDeploy.bind(this);
    this.redirectToAccounts = this.redirectToAccounts.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  signAndSubmitToDeploy() {
    const {latestUnsuccessfulDeploy, onSignAndSubmitBurnProof, ethAccount} = this.props;
    onSignAndSubmitBurnProof(ethAccount, latestUnsuccessfulDeploy);
  }

  redirectToAccounts() {
    const {history, createNewDeploy} = this.props;
    history.push('/wallet');
    createNewDeploy();
  }

  createData(fieldName, value) {
    return {fieldName, value};
  }

  componentDidMount() {
    const {latestUnsuccessfulDeploy, onRefreshAndGetProof} = this.props;
    onRefreshAndGetProof();
    if (latestUnsuccessfulDeploy && [INC_BURN_TO_UNSHIELD_INIT, ETH_SUBMITING_TX].includes(latestUnsuccessfulDeploy.status)) {
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
    const {latestUnsuccessfulDeploy} = this.props;
    if (latestUnsuccessfulDeploy && [ETH_WITHDRAW_SUCCESS, INC_BURNED_FAILED, ETH_WITHDRAW_FAILED].includes(latestUnsuccessfulDeploy.status)) {
      if (refresher) {
        clearInterval(refresher);
      }
      refresher = null;
    }
  }

  refresh() {
    const {latestUnsuccessfulDeploy, onRefreshAndGetProof} = this.props;
    if (latestUnsuccessfulDeploy  && [INC_BURN_TO_UNSHIELD_INIT, ETH_SUBMITING_TX].includes(latestUnsuccessfulDeploy.status)) {
      onRefreshAndGetProof();
    }
  }

  displayForm() {
    const {classes, latestUnsuccessfulDeploy} = this.props;
    if (latestUnsuccessfulDeploy && latestUnsuccessfulDeploy.status === INC_BURNED_SUCCESS) {
      return (
        <Paper className={classes.deploy} elevation={1}>
          <TextField
            className={classes.burnProof}
            id="outlined-read-only-input"
            label="Proof"
            value={latestUnsuccessfulDeploy.ethrawinput}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={this.signAndSubmitToDeploy}
            className={classes.deployButton}
          >
            Deploy
          </Button>
        </Paper>
      )
    } else if (latestUnsuccessfulDeploy && latestUnsuccessfulDeploy.status === ETH_WITHDRAW_SUCCESS) {
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
    const {classes, latestUnsuccessfulDeploy, ethTxInfo} = this.props;
    if (latestUnsuccessfulDeploy) {
      let status = 'Success';
      switch (latestUnsuccessfulDeploy.status) {
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
        this.createData('TransactionID', latestUnsuccessfulDeploy.inctx),
        this.createData('Status', status),
      ];

      let deployEthStatus = [];
      if (ethTxInfo && latestUnsuccessfulDeploy.status > INC_TRANSACTION_REJECTED) {
        deployEthStatus = [
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
      if ([INC_BURNED_SUCCESS, INC_BURNED_FAILED, ETH_WITHDRAW_FAILED, ETH_WITHDRAW_SUCCESS].includes(latestUnsuccessfulDeploy.status)) {
        disableGetProof = true;
      }
      return (
        <div className={classes.root}>
          <div className={classes.getProof}>
            <ExpansionPanel
              square
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography> Deposit to pApps transaction status </Typography>
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
                <Typography> Deploy transaction on ethereum status </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Table className={classes.table} aria-label="simple table">
                  <TableBody>
                    {deployEthStatus.map((row) => (
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

export default compose(withMyStyles)(BurnProofToDeploy);
