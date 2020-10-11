import { orange, red } from "@material-ui/core/colors";

export default theme => ({
    container: {
        padding: 20
    },
    importView: {
        marginBottom: 30
    },
    input: {
        width: '100%'
    },
    importBtn: {
        width: 150,
        float: 'right',
        marginTop: 10
    },
    createView: {
        marginTop: 60
    },
    createLink: {
        fontSize: 16,
        color: orange[600],
        cursor: 'pointer',
        transition: 'transform 0.3s',
        '&:hover': {
            transform: 'translateX(10px)'
        }
    },
    errorMsg: {
        color: red[500]
    }
});