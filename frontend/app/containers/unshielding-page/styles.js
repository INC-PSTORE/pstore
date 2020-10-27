const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
    // padding: 30,
    width: '40%',
  },
  stepper: {
    backgroundColor: 'transparent',
  },
  snackBar: {
    marginTop: "3%",
  },
  snackBarContent: {
    backgroundColor: "#f44336",
    color: "white",
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
  ethSkipStepWrapper: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ethSkipStepButton: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px',
  },
  ethSkipStep: {
    margin: theme.spacing.unit,
    // width: '50%',
  },
  skipStep: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: '-6%',
  },
  skipStepLink: {
    padding: '10px 2px 10px 10px',
    "&:hover": {
      textDecorationLine: 'underline',
      border: '1px',
      cursor: 'pointer',
    },
  }
});

export default styles;
