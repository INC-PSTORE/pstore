/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { PSAFE_DOMAIN, PTRADE_DOMAIN } from '../../common/constants';

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

/* eslint-disable react/prefer-stateless-function */
export default class NotFound extends React.PureComponent {
  render() {
    return (
      <div style={{ textAlign: 'center', width: '80%' }}>
        <List >
          {/* <ListItem alignItems="flex-start"> */}
          <ListItemLink href={PSAFE_DOMAIN}>
            <ListItemAvatar>
              <Avatar alt="MultiSig" src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT7FQR4cwPPG_j0ZZUfSmLCBkGyoHH7swFvUw&usqp=CAU" />
            </ListItemAvatar>
            <ListItemText
              primary="pMultisig"
              secondary={
                <Typography component="span" color="textPrimary">
                  The first privacy multisig wallet...
              </Typography>
              }
            />
          </ListItemLink>

          <ListItemLink href={PTRADE_DOMAIN}>
            <ListItemAvatar>
              <Avatar alt="pTrade" src="https://cdn.publish0x.com/prod/fs/images/621a7ff87ce20787ca278d6ca6ae21780ac6b2aa79510cb201cf573e9d1a6604.jpeg" />
            </ListItemAvatar>
            <ListItemText
              primary="pTrade"
              secondary={
                <Typography component="span" color="textPrimary">
                  A privacy mode for Uniswap...
              </Typography>
              }
            />
          </ListItemLink>
          {/* </ListItem> */}
        </List>
      </div>
    );
  }
}
