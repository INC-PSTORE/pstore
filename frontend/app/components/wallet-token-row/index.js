/*
* Wallet token row
*/

import { withStyles } from '@material-ui/core/styles';
import React from 'react';

import Typography from '@material-ui/core/Typography';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { compose } from 'redux';
import styles from './styles';
import { incFormatBalance, ethFormatBalance } from '../../utils/format';

/* eslint-disable react/prefer-stateless-function */
export class WalletTokenRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.openTransferModal = this.openTransferModal.bind(this);
  }

  openTransferModal() {
    const { token, onOpenTransferModal } = this.props;
    onOpenTransferModal(token);
  }

  render() {
    const { classes, token } = this.props;
    return (
      <>
        <TableRow key={token.tokenId} onClick={this.openTransferModal} className={classes.row}>
          <TableCell component="th" scope="row">
            <div className={classes.tokenContainer}>
              <div>
                <img src={token.icon} className={classes.icon} />
              </div>
              <div className={classes.nameView}>
                <Typography noWrap className={classes.name}>{token.tokenSymbol || '---'}</Typography>
              </div>
            </div>
          </TableCell>
          <TableCell align="right">{typeof token.privateIncBal !== 'number' ? token.privateIncBal : incFormatBalance(token.privateIncBal, token.pDecimals)}</TableCell>
          <TableCell align="right">{typeof token.pAppsDepositedBal !== 'number' ? token.pAppsDepositedBal : ethFormatBalance(token.pAppsDepositedBal)}</TableCell>
        </TableRow>
      </>
    );
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(WalletTokenRow);
