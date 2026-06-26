import {
    StyleSheet,
} from 'react-native';

export const Pgstyle = StyleSheet.create({
    clientArea: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        gap: 14,
    },
    totalBar: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    commandButtons: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});