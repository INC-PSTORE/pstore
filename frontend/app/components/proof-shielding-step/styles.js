
const styles = theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  shieldProof: {
    width: '100%',
    textAlign: 'center',
  },
  tableCell: {
    overflowWrap: 'anywhere',
    // for safari case
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  buttons: {
    margin: 12,
    textAlign: 'center',
  },
  '@media (max-width: 600px)': {
    tableCell: {
      padding: "2px",
    },
    tableCellKey: {
      padding: "8px",
    }
  },
  refresher: {
    display: 'flex',
    flexDirection: 'column',
    margin: 20,
    alignItems: 'center',
  },
  cirProgress: {
    margin: 8,
  },
});

export default styles;
