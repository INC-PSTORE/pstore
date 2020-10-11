/*
* InfoDialog
*/
import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import styles from './styles';

/* eslint-disable react/prefer-stateless-function */
export class InfoDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
  }

  close() {
    this.props.onOk();
  }

  render() {
    const {
      isOpenedDialog,
      message,
      onOk,
    } = this.props;

    return (
      <div>
        <Dialog
          open={isOpenedDialog}
          onClose={this.close}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Information</DialogTitle>
          <DialogContent>
            <DialogContentText>{message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onOk} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default InfoDialog;
