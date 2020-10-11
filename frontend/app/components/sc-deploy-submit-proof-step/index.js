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
  INC_BURNED_FAILURE,
  INC_TRANSACTION_REJECTED,
  ETH_DEPLOY_FAILURE,
  ETH_SUBMITING_TX,
  ETH_SUBMITED_TX,
  ETH_DEPLOY_UNKNOWN,
  ETH_TRANSACTION_RECJECTED,
  ETH_DEPLOY_SUCCESS,
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
    this.getProof = this.getProof.bind(this);
    this.refreshEthState = this.refreshEthState.bind(this);
    this.redirectToAccounts = this.redirectToAccounts.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  signAndSubmitToDeploy() {
    const {latestUnsuccessfulDeploy, onSignAndSubmitBurnProof, ethAccount} = this.props;
    onSignAndSubmitBurnProof(ethAccount, latestUnsuccessfulDeploy);
  }

  getProof() {
    const {privateIncAccount, onRefreshAndGetProof} = this.props;
    onRefreshAndGetProof(privateIncAccount);
  }

  refreshEthState() {
    const {latestUnsuccessfulDeploy, onGetDeployById} = this.props;
    if (latestUnsuccessfulDeploy && latestUnsuccessfulDeploy.deployId !== null) {
      onGetDeployById(latestUnsuccessfulDeploy.deployId);
    }
  }

  redirectToAccounts() {
    const {history} = this.props;
    history.push('/wallet');
  }

  createData(fieldName, value) {
    return {fieldName, value};
  }

  componentDidMount() {
    const {latestUnsuccessfulDeploy} = this.props;
    this.getProof();
    if (!latestUnsuccessfulDeploy || latestUnsuccessfulDeploy.status !== ETH_DEPLOY_SUCCESS) {
      refresher = setInterval(this.refresh, 5000); // run every 10s
    }
  }

  componentWillUnmount() {
    if (refresher) {
      console.log('clearing interval because of leaving');
      clearInterval(refresher);
    }
    refresher = null;
  }

  componentDidUpdate(prevProps) {
    const {latestUnsuccessfulDeploy} = this.props;
    if (latestUnsuccessfulDeploy && latestUnsuccessfulDeploy.status === ETH_DEPLOY_SUCCESS) {
      if (refresher) {
        console.log('clearing interval because of finishing');
        clearInterval(refresher);
      }
      refresher = null;
    }
  }

  refresh() {
    const {latestUnsuccessfulDeploy} = this.props;
    if (latestUnsuccessfulDeploy) {
      if (latestUnsuccessfulDeploy.status === INC_BURNED_TO_DEPLOY) {
        this.getProof()
      } else if (latestUnsuccessfulDeploy.status === ETH_SUBMITED_TX) {
        this.refreshEthState();
      }
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
            value={latestUnsuccessfulDeploy.burnToDeployProof}
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
    } else if (latestUnsuccessfulDeploy && latestUnsuccessfulDeploy.status > INC_TRANSACTION_REJECTED) {
      return (
        <div>
          {latestUnsuccessfulDeploy.status === ETH_DEPLOY_SUCCESS
            ?
            <Button
              className={classes.actionButton}
              variant="contained"
              color="primary"
              onClick={this.redirectToAccounts}
            >
              Check Balances
            </Button>
            :
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
        </div>
      )
    }
  }

  render() {
    const {classes, latestUnsuccessfulDeploy, ethTxInfo} = this.props;
    if (latestUnsuccessfulDeploy) {
      let status = 'Succeed';
      switch (latestUnsuccessfulDeploy.status) {
        case INC_BURN_TO_DEPLOY_INIT:
          status = 'Submiting'
          break;
        case INC_BURNED_TO_DEPLOY:
          status = 'Submitted'
          break;
        case INC_BURNED_NOT_FOUND:
          status = 'Not Found'
          break;
        case INC_BURNED_FAILURE:
          status = 'Failed'
          break;
        case INC_TRANSACTION_REJECTED:
          status = 'Rejected'
          break;
        default:
          break;
      }
      let incStatus = 'Succeed';
      switch (latestUnsuccessfulDeploy.status) {
        case ETH_SUBMITING_TX:
          incStatus = 'Submiting'
          break;
        case ETH_SUBMITED_TX:
          incStatus = 'Submitted'
          break;
        case INC_BURNED_NOT_FOUND:
          incStatus = 'Not Found'
          break;
        case ETH_DEPLOY_UNKNOWN:
          incStatus = 'Unknown'
          break;
        case ETH_TRANSACTION_RECJECTED:
          incStatus = 'Rejected'
          break;
        default:
          break;
      }

      let depProofSubmitStatusRows = [
        this.createData('TransactionID', latestUnsuccessfulDeploy.burnToDeployTxID),
        this.createData('Status', status),
      ];

      let deployEthStatus = [];
      if (ethTxInfo && latestUnsuccessfulDeploy.status > INC_TRANSACTION_REJECTED) {
        deployEthStatus = [
          this.createData('Transaction hash', ethTxInfo.transactionHash),
          this.createData('Status', incStatus),
          this.createData('Block', ethTxInfo.blockNumber),
          this.createData('To', ethTxInfo.toAddressStr),
          this.createData('Transaction Fee', ethTxInfo.txFee),
        ]
      }

      let disableGetProof = false;
      if (latestUnsuccessfulDeploy.status !== INC_BURNED_TO_DEPLOY) {
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
