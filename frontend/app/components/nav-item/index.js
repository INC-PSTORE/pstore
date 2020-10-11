/*
* Nav Item
*/
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { compose } from 'redux';
import styles from './styles';


/* eslint-disable react/prefer-stateless-function */
export class NavItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.clickNavItem = this.clickNavItem.bind(this);
  }

  clickNavItem() {
    const { onClickNavItem, routePath } = this.props;
    onClickNavItem(routePath);
  }

  render() {
    const { classes, navItemText, routePath } = this.props;
    return (
      <div className={classes.root}>
        <Button onClick={this.clickNavItem} color="inherit">
          <NavLink exact to={routePath}>{navItemText}</NavLink>
        </Button>
      </div>
    );
  }
}

const withMyStyles = withStyles(styles);

export default compose(withMyStyles)(NavItem);
