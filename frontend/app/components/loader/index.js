/*
* Loader
*/
import React from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import styles from './styles';

/* eslint-disable react/prefer-stateless-function */
export class Loader extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isActive,
    } = this.props;
    return (
      <div>
        <Backdrop style={styles.root} open={isActive}>
        </Backdrop>
        {isActive && <CircularProgress style={styles.spinner} color="primary" />}
      </div>
    );
  }
}

export default Loader;
