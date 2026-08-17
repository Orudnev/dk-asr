import { useContext, useState } from 'react';
import { StyleSheet, View, Text } from "react-native";
import { Button, Icon } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';

type TRadioButtonProps = {
    onClick: (isPressed: boolean) => void
}

function RButton(props: TRadioButtonProps): React.JSX.Element {
    const [pressed, setPressed] = useState(false);
    const stPressed = pressed ? btnStyles.pressed : null;
    return (
        <Button style={[btnStyles.sizeAndPadding, stPressed]} mode="outlined"
            icon={({ color }) => (
                <View style={btnStyles.icon}>
                    <Icon source="magnify" size={50} />
                </View>
            )}
            onPress={() => {
                const newValue = !pressed;
                setPressed(newValue);
                props.onClick(newValue);
            }} > </Button>
    );
}

const btnStyles = StyleSheet.create({
    sizeAndPadding: {
        width: 64,
        height: 100,
    },
    icon: {
        marginLeft: 15,
        marginTop: 25
    },
    pressed: {
        color: '#3eac44',
        backgroundColor: '#3eac44'
    }
});

const data = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' },
];

export function PgAddOrEditRow(): React.JSX.Element {
    const [value, setValue] = useState('apple');
    return (
        <SafeAreaView style={{ marginTop: 10 }}>
            <View style={styles.panel}>
                <RButton onClick={() => { }} />
                <Text style={styles.value}>blablabla jhkjhlkh  jkhlkjhlkhlkhklh hkjhlkhklj hjkhl lkjhkljhhlk  kjhjklhlkh lkjl;j;lj lkjlkjljk lkj;lkj ;lkj;lj  </Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: 5, width: 200 }}>
                <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => setValue(itemValue)}
                    mode="dropdown">
                    <Picker.Item label="Apple" value="apple" />
                    <Picker.Item label="Banana" value="banana" />
                    <Picker.Item label="Orange" value="orange" />                        
                </Picker>
            </View>
        </SafeAreaView>
    );
}

const commonStyles = {
    borderWidth: 1,
    borderColor: '#ddd2bf',
    borderRadius: 12
}

const ddwnStyles = StyleSheet.create({
    dropdown: {
        ...commonStyles,
        paddingHorizontal: 12,
        minHeight: 48,
        backgroundColor: '#1f1f1f',
    },
    dropdownContainer: {
        borderRadius: 10,
        backgroundColor: '#1f1f1f',
        borderWidth: 1,
        borderColor: '#777',
    },
    dropdownText: {
        fontSize: 16,
        color: '#f5f5f5',
    },
    placeHolderText: {
        color: '#777'
    },
    dropdownItemContainer: {
        backgroundColor: '#1f1f1f',
    },
    activeItem: {
        backgroundColor: '#2c2c2c',
    },
});
const styles = StyleSheet.create({
    panel: {
        ...commonStyles,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#000',
        padding: 16,
        marginLeft: 5,
        marginRight: 5
    },
    label: {
        fontSize: 13,
        textTransform: 'uppercase',
        color: '#7b6f5c',
        marginBottom: 8,
        letterSpacing: 0.8,
    },
    value: {
        // borderStyle:'solid',
        // borderWidth:1,
        // borderColor:'red',
        width: '85%',
        paddingLeft: 10,
        paddingTop: 8,
        fontSize: 17,
        lineHeight: 24,
        color: '#d9f0ea',
    },
});