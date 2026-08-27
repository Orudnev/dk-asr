import { useState, } from 'react';
import { View, Text, StyleSheet, } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

export type TDatePickerProps = {
    initialValue: Date,
    onChange: (d: Date) => void
}

export function DatePicker(props: TDatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(props.initialValue);
    const [show, setShow] = useState(false);
    const onChange = (event: any, newDate?: Date) => {
        setShow(false);
        if (newDate) {
            setSelectedDate(newDate);
            props.onChange(newDate);
        }
    };
    return (
        <View style={[styles.container]}>
            <Text style={[{ marginTop: 5 }, styles.value, styles.datePickerText]} onPress={() => setShow(true)}>{selectedDate.toLocaleDateString()}</Text>
            {show && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        display: 'flex', 
        flexDirection: 'row',
        width: 120,
        minHeight: 50,
        marginTop: 10,
        marginLeft: 5,
        borderWidth: 1,
        borderColor: '#ddd2bf',
        borderRadius: 12,
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
    datePickerText: {
        color: '#ffffff',
        width: 120
    },       
});    