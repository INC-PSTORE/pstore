/*
* PrivateTransfer
*/

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import { compose } from 'redux';
import styles from './styles';

/* eslint-disable react/prefer-stateless-function */
export class PrivateTransfer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  createData(fieldName, value) {
    return { fieldName, value };
  }

  render() {
    const rows = [
      this.createData('Transaction hash', '0x45f61a7fc00f14c654a1aade07d166c1e72e38f647bb46fc026460383132a615'),
      this.createData('Status', 'Success'),
      this.createData('Block', 10428767),
      this.createData('From', '0xdbcb4582f750591ad56fac0ce192bcb328ef3d6a'),
      this.createData('To', '0xba355726e71cec29e718d7aa519ae1e10e3f3640'),
      this.createData('Value', '0.0015 Ether'),
      this.createData('Transaction Fee', '0.0004927083 Ether'),
    ];
    const {
      classes,
      onRefresh,
      onDone,
    } = this.props;
    return (
      <div className={classes.root}>
        <Table className={classes.table} aria-label="simple table">
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="left">{row.fieldName}</TableCell>
                <TableCell align="left">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={onRefresh}
            className={classes.buttons}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onDone}
            className={classes.buttons}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(PrivateTransfer);
