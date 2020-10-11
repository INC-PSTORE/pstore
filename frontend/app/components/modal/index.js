import React from 'react';
import Modal from '@material-ui/core/Modal';
import { Typography, withStyles, Paper } from '@material-ui/core';
import styles from './styles';

class CustomModal extends React.Component {
    render() {
        const { children, headerTitle, classes, onClose, ...modalProps } = this.props;
        return (
            <Modal
                disableBackdropClick
                disableEscapeKeyDown
                {...modalProps}
            >
                <Paper className={classes.container}>
                    <div className={classes.header}>
                        <Typography className={classes.headerTitle}>{headerTitle}</Typography>
                    </div>
                    <div className={classes.content}>
                        {children}
                    </div>
                </Paper>
            </Modal>
        );
    }
}

export default withStyles(styles)(CustomModal);