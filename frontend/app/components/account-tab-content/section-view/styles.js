import { blue, grey } from "@material-ui/core/colors";

export default {
    container: {
        borderRadius: '5px 5px 0px 0px',
        overflow: 'hidden',
        marginBottom: 40,
        width: '100%',
    },
    label: {
        padding: 5,
        fontSize: 14,
        fontWeight: 'bold',
        borderBottom: `solid 0.2px ${grey[300]}`,
        color: grey['600'],
        background: grey['100']
    },
    content: {
        padding: '10px 15px',
    }
};