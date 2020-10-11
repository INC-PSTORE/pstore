import React from 'react';
import styles from './styles';
import { withStyles } from '@material-ui/core';

class Container extends React.Component {
    render() {
        const { classes } = this.props;
        
        return (
            <div className={classes.container}>
                {this.props.children}
            </div>
        );
    }
}

export default withStyles(styles)(Container);