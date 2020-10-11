import {grey, blue, red, orange} from "@material-ui/core/colors";

const styles = theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row'
  },
  tabs: {
    width: 250,
    padding: 10
  },
  tab: {
    marginTop: 15,
    marginBottom: 15,
    padding: '0px 5px',
    borderLeft: `solid 5px ${grey['300']}`,
    cursor: 'pointer',
    color: grey[900],
    // textTransform: 'uppercase',
    fontSize: 16,
    transition: 'all 0.3s',
  },
  tabActive: {
    borderLeft: `solid 5px ${orange['300']}`,
    color: blue['800'],
    fontWeight: 500,
  },
  tabContent: {
    width: 'calc(100% - 250px)',
    flex: 1,
    padding: 10
  },
  '@media (max-width: 600px)': {
    container: {
      flexDirection: 'column',
    },
    tabs: {
      width: "100%",
    },
    tabContent: {
      width: "100%",
    },
  },
  active: {},
  inactive: {
    display: 'none'
  },
});

export default styles;
