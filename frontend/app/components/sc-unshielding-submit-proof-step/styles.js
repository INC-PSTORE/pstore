
const styles = theme => ({
  /*
    root -> getProof -> table
         -> (burnProof, button) || (buttons)
  */

  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  getProof: {
    width: '100%',
    textAlign: 'center',
  },
  getProofButton: {
    margin: 12,
  },
  tableCell: {
    overflowWrap: 'anywhere',
    // for safari case
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  unshield: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  burnProof: {
    width: '100%',
    marginTop: 20,
    padding: 10,
  },
  unshieldButton: {
    margin: '0px 10px 10px 10px',
    textAlign: 'right',
  },
  actionButton: {
    margin: 12,
  },
  tableCellKey : {
  },
  '@media (max-width: 600px)': {
    root: {
      width: '100%',
    },
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


