import { grey } from "@material-ui/core/colors";

export default {
    container: {
    },
    item: {
        padding: 5,
        borderBottom: `solid 0.2px ${grey['300']}`,
        marginTop: 5,
        marginBottom: 5,
        '&:last-child': {
           borderBottom: 'none'
        }
    },
};