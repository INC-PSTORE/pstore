import {blue, grey, orange, lightBlue} from "@material-ui/core/colors";
import { PRIMARY_COLOR } from '../../common/constants';

const styles = {
  root: {
    position: 'absolute',
    height: '100%',
    width: '100%',
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
};

export default styles;
