import { useContext, useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text } from "react-native";
import { Button, Icon, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';
import { MoneyAccounts, TAllTables, TMoneyAccount } from '../googleDoc/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getProperty } from '../db/tblSettings';

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
        margin: 5
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
        <View style={[{ ...fldStyles.selectedDate, ...fldStyles.fldCommon, ...borderStyle }, { display: 'flex', flexDirection: 'row' }]}>
            <Text style={[{ marginTop: 5 }, styles.value, fldStyles.datePickerText]} onPress={() => setShow(true)}>{selectedDate.toLocaleDateString()}</Text>
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

export type TDropDownBoxProps = {
    itemSourse?: any[],
    labelField?: string,
    valueField?: string,
    selItem: any,
    fldStyle?: any,
    onChange: (newValue: any) => void
}

export function DropDownBox(props: TDropDownBoxProps) {
    const [selectedItem, setSelectedItem] = useState(props.selItem);
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
                <View style={{ ...props.fldStyle, ...fldStyles.fldCommon, ...borderStyle }}>
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
            setSelectedItem(newItem);
        } else {
            setSelectedItem(newval);
        }
    };

    if (props.selItem != 'BnBish') {
        let s = 1;
    }

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <View style={{ ...props.fldStyle, ...fldStyles.fldCommon, ...borderStyle }}>
                <Picker
                    selectedValue={getValue(selectedItem)}
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

export function PgAddOrEditRow(): React.JSX.Element {
    const [destTable, setDestTable] = useState<TMoneyAccount>('BnBish');
    const [date, setDate] = useState<Date>(new Date());
    const [DCItem, setDCItem] = useState("Прод");
    const [dest, setDest] = useState("Биш");
    const [description, setDescription] = useState("Blablablablab");
    const [sum, setSum] = useState(100500);
    const [allTables, setAllTables] = useState<TAllTables | null>(null);
    useEffect(() => {
        const loadTables = async () => {
            const data = await getProperty<TAllTables>('allTables');
            setAllTables(data);
        };

        loadTables();
    }, []);

    return (
        <SafeAreaView>
            <View style={[{ display: 'flex', flexDirection: 'row', marginRight: 10 }, { ...fldStyles.fldCommon, ...borderStyle }]}>
                <RButton onClick={() => { }} />
                <Text style={styles.value}>blablabla jhkjhlkh  jkhlkjhlkhlkhklh hkjhlkhklj hjkhl lkjhkljhhlk  kjhjklhlkh lkjl;j;lj lkjlkjljk lkj;lkj ;lkj;lj  </Text>
            </View>
            <View style={{display:'flex', flexDirection:'row', maxWidth: 300}}>
                <DropDownBox itemSourse={MoneyAccounts}
                    fldStyle={fldStyles.destTable}
                    selItem={destTable}
                    onChange={(newitm) => {
                        setDCItem(newitm);
                    }}
                />
                <DatePicker initialValue={date} onChange={setDate} />
                <DropDownBox itemSourse={allTables?.DCItems.map(itm => itm.Name)}
                    fldStyle={fldStyles.DCItem}
                    selItem={DCItem}
                    onChange={(newitm) => {
                        setDCItem(newitm);
                    }}
                />
                <DropDownBox itemSourse={allTables?.Dest}
                    fldStyle={fldStyles.Dest}
                    selItem={dest}
                    onChange={(newitm) => {
                        setDest(newitm);
                    }}
                />
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ ...fldStyles.Sum, ...fldStyles.fldCommon, ...borderStyle }}>
                        <Text style={styles.value}>{sum}</Text>
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ ...fldStyles.Description, ...fldStyles.fldCommon, ...borderStyle }}>
                        <Text style={styles.value}>{description}</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const borderStyle = {
    borderWidth: 1,
    borderColor: '#ddd2bf',
    borderRadius: 12,
}
const fldStyles = StyleSheet.create({
    fldCommon: {
        marginTop: 10,
        marginLeft: 5,
        minHeight: 50
    },
    destTable: {
        width: 140
    },
    selectedDate: {
        width: 120,
        minHeight: 50
    },
    datePickerText: {
        width: 120
    },
    DCItem: {
        width: 195
    },
    Dest: {
        width: 140
    },
    Description: {
        width: '95%',
    },
    Sum: {
        width: 140
    },

});
// const ddwnStyles = StyleSheet.create({
//     dropdown: {
//         ...commonStyles,
//         paddingHorizontal: 12,
//         minHeight: 48,
//         backgroundColor: '#1f1f1f',
//     },
// dropdownContainer: {
//     borderRadius: 10,
//     backgroundColor: '#1f1f1f',
//     borderWidth: 1,
//     borderColor: '#777',
// },
// dropdownText: {
//     fontSize: 16,
//     color: '#f5f5f5',
// },
// placeHolderText: {
//     color: '#777'
// },
// dropdownItemContainer: {
//     backgroundColor: '#1f1f1f',
// },
// activeItem: {
//     backgroundColor: '#2c2c2c',
// },
//});
const styles = StyleSheet.create({
    panel: {
        ...borderStyle,
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