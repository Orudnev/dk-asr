import { useState, } from 'react';
import { View, Text, StyleSheet, } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

export type TDatePickerProps = {
    value: Date,
    onChange: (d: Date) => void
}

export function dateToStr(d:Date){
    const result = d.getFullYear()+"."+String(d.getMonth()+1).padStart(2,'0')+"."+String(d.getDate()).padStart(2,'0');
    return result;
}

export function strToDate(dstr:string){
    const date = new Date(dstr.replace(/\./g, '/'));
    return date;
}


export function DatePicker(props: TDatePickerProps) {
    const [show, setShow] = useState(false);
    const onChange = (event: any, newDate?: Date) => {
        setShow(false);
        if (newDate) {
            props.onChange(newDate);
        }
    };
    return (
        <View style={[styles.container]}>
            <Text 
                style={[{ marginTop: 5 }, styles.value, styles.datePickerText]} 
                onPress={() => {
                    setShow(true)
                }}
                >
                    {dateToStr(props.value)}
            </Text>
            {show && (
                <DateTimePicker
                    value={props.value}
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