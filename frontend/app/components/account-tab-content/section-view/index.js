import React from 'react';
import { Paper, Typography, withStyles } from '@material-ui/core';
import styles from './styles';

class SectionView extends React.Component {
    render() {
      const { children, label, classes } = this.props;
      return (
        <Paper square className={classes.container}>
          <Typography className={classes.label}>{label}</Typography>
          <div className={classes.content}>
            { children }
          </div>
        </Paper>
      );
    }
}

export default withStyles(styles)(SectionView);