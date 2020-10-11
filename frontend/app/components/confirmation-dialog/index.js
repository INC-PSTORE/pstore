/*
* ConfirmationDialog
*/
import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import styles from './styles';

/* eslint-disable react/prefer-stateless-function */
export class ConfirmationDialog extends React.PureComponent {
  render() {
    const {
      isOpenedDialog,
      confirmationMessage,
      onCancel,
      onConfirm,
    } = this.props;
    return (
      <div>
        <Dialog
          open={isOpenedDialog}
          onClose={onCancel}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>{confirmationMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={onConfirm} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const withStylesConfirmationDialog = withStyles(styles);

export default compose(withStylesConfirmationDialog)(ConfirmationDialog);
