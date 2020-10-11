import green from '@material-ui/core/colors/green';

const styles = theme => ({
  root: {
    width: '65%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
  },
  '@media (max-width: 600px)': {
    root: {
      width: '90%',
    }
  },
  form: {
    width: '100%',
  },
  button: {
    margin: 20,
  },
  icon: {
    width: 20,
    height: 22,
    margin: '5px 10px 5px 0px',
  },
  tokenName: {
    paddingTop: 7,
  },
  coinInfo: {
    display: 'flex',
  },
});

export default styles;


