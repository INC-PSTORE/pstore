import {blue, grey, orange, lightBlue} from "@material-ui/core/colors";
import { PRIMARY_COLOR } from '../../common/constants';

const styles = theme => ({
  root: {
    // position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
  },
  appBar: {
    backgroundColor: PRIMARY_COLOR,
  },
  link: {
    textDecoration: 'none',
    color: grey[300],
    fontWeight: 500,
  },
  activeLink: {
    color: '#fff',
    textDecoration: 'none',
  },
  logo: {
    color: '#fff',
    backgroundColor: PRIMARY_COLOR,
  },
  pappsMenuList: {
    zIndex: 9999,
  },
  homeLink: {
    height: 26,
    color: '#fff',
    textDecoration: 'none',
  },
  homeIcon: {
    verticalAlign: 'unset',
  },
  arrowDropDownIcon: {
    color: grey[300],
  },
  metaMaskMess: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f44336",
    color: 'white',
  },
  navItemButton: {
    textTransform: 'none',
  },
  switchNetwork: {
    marginLeft: 'auto',
  },
  iOSSwitchBase: {
    '&$iOSChecked': {
      color: theme.palette.common.white,
      '& + $iOSBar': {
        backgroundColor: '#52d869',
      },
    },
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.sharp,
    }),
  },
  iOSChecked: {
    transform: 'translateX(15px)',
    '& + $iOSBar': {
      opacity: 1,
      border: 'none',
    },
  },
  iOSBar: {
    borderRadius: 13,
    width: 38,
    height: 20,
    marginTop: -10,
    marginLeft: -20,
    border: 'solid 1px',
    borderColor: theme.palette.grey[400],
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  iOSIcon: {
    width: 22,
    height: 22,
  },
  iOSIconChecked: {
    boxShadow: theme.shadows[1],
  },
});

export default styles;
