import { useContext, useState, useMemo, useEffect } from 'react';
import { View} from "react-native";
import { Button, Icon, ActivityIndicator} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';


export type TDropDownBoxProps = {
    itemSourse?: any[],
    labelField?: string,
    valueField?: string,
    selItem: any,
    fldStyle?: any,
    onChange: (newValue: any) => void
}

export function DropDownBox(props: TDropDownBoxProps) {
    const getValue = (itm: any) => {
        if (typeof (itm) == 'object' && props.valueField && itm.hasOwnProperty(props.valueField)) {
            return itm[props.valueField];
        }
        return itm;
    };
    const getLabel = (itm: any) => {
        if (typeof (itm) == 'object' && props.valueField && props.labelField && itm.hasOwnProperty(props.labelField)) {
            return itm[props.labelField];
        }
        return itm;
    };

    if (!props.itemSourse) {
        return (
            <View style={{ display: 'flex', flexDirection: 'row' }}>
                <View style={props.fldStyle}>
                    <ActivityIndicator animating={true} />
                </View>
            </View>
        );
    }

    const setValue = (newval: any) => {
        if (typeof (props.selItem) == 'object' && props.itemSourse && props.valueField && props.selItem.hasOwnProperty(props.valueField)) {
            let newItem = props.itemSourse.find(itm => {
                if (props.valueField && itm[props.valueField] == newval) {
                    return true;
                }
                return itm == newval;
            });
            props.onChange(newItem);
        } else {
            props.onChange(newval);
        }
    };

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <View style={props.fldStyle}>
                <Picker
                    selectedValue={getValue(props.selItem)}
                    onValueChange={(itemValue: any) => {
                        setValue(itemValue);
                        props.onChange(itemValue);
                    }}
                    mode="dropdown">
                    {props.itemSourse.map(itm => {
                        let label = getLabel(itm);
                        let value = getValue(itm);
                        return (<Picker.Item key={value} label={label} value={value} />);
                    })
                    }
                </Picker>
            </View>
        </View>
    );
}