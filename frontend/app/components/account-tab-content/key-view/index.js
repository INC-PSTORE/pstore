import React from 'react';
import { Paper, Typography, withStyles } from '@material-ui/core';
import styles from './styles';

class KeyView extends React.Component {
    render() {
      const { value, label, classes } = this.props;
      return (
        <div className={classes.container}>
          <Typography noWrap className={classes.label}>{label}</Typography>
          <Typography noWrap className={classes.value}>{value}</Typography>
        </div>
      );
    }
}

export default withStyles(styles)(KeyView);