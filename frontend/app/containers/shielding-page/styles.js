const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 30,
    width: '50%',
  },
  stepper: {
    backgroundColor: 'transparent',
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
