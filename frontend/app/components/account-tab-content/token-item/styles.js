export default theme => ({
    container: {
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 35,
        cursor: 'pointer'
    },
    // icon: {
    //     flexBasis: 50,

    // },
    nameView: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        transform: 'translateX(0px)',
        transition: 'transform 0.3s',
        '&:hover': {
            transform: 'translateX(5px)'
        }
    },
    balance: {
        fontSize: 16,
        flexBasis: 150
    },
    icon: {
        width: 25,
        height: 25,
        marginBottom: 2,
        marginRight: 8,
    },
});