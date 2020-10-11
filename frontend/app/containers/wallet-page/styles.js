const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 30,
    width: '50%',
  },
  keyView: {},

  account: {
    width: '100%',
  },

  balances: {
    width: '100%',
  },

  tokenContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    height: 35,
  },
  icon: {
    width: 25,
    height: 25,
    marginBottom: 2,
    marginRight: 8,
  },
  mainActionButtons: {
    display: 'flex',
    justifyContent: 'center',
    margin: '12px 0px 1px 0px',
  },
  mainButton: {
    textTransform: 'none',
    margin: '0px 5px 0px 5px',
  },

  sideActionButtons: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '15px 0px 15px 0px',
  },
  sideButton: {
    textTransform: 'none',
    margin: '0px 5px 0px 5px',
  },

  '@media (max-width: 600px)': {
    root: {
      width: '95% !important',
    },
  },
  '@media (max-width: 1000px)': {
    root: {
      width: '80%',
    },
  },
});

export default styles;
