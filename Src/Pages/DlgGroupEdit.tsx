import { useContext, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Button,
    Dialog,
    Icon,
    Portal,
    Text,
} from 'react-native-paper';
import { DropDownBox } from '../components/dropdownbox';
import { MoneyAccounts, TJCommonRow, TMoneyAccount } from '../googleDoc/types';
import { generatePseudoUniqueId } from '../googleDoc/helper';
import { DatePicker } from '../components/datepicker';



type TDlgGroupEditResult = {
    account:string,
    date:Date|undefined,
    dest:string
}

type TDlgGroupEdit = {
    show: boolean,
    initValues: TJCommonRow,
    destList: string[],
    onApplyButtonClick: (result: TDlgGroupEditResult) => void,
    onCancelButtonClick: () => void
}


export function DlgGroupEdit(props: TDlgGroupEdit) {
    const [result, setResult] = useState(props.initValues);
    const [destTable, setDestTable] = useState('*');
    const [dest, setDest] = useState("*");
    const [showDatePicker, setShowDatePicker] = useState(false);
    useEffect(() => {
        setResult(props.initValues)
    }, [props.initValues]);
    return (
        <Portal>
            <Dialog visible={props.show} style={styles.dialog}>
                <Dialog.Title>Group edit</Dialog.Title>
                <Dialog.Content style={{paddingTop:30}}>
                    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: 300 }}>
                        <View style={styles.fldContainer}>
                            <Text style={styles.fldLabel}>Account</Text>
                            <DropDownBox itemSourse={["*", ...MoneyAccounts]}
                                fldStyle={[styles.destTable, styles.fldMargins]}
                                selItem={destTable}
                                onChange={(newitm) => {
                                    setDestTable(newitm);
                                }}
                            />
                        </View>
                        <View style={styles.fldContainer}>
                            <Text style={styles.fldLabel}>Date</Text>
                            <Button mode="outlined"
                                style={{ height: 40, marginTop: 18, marginLeft:4, backgroundColor: showDatePicker ? '#3eac44' : undefined }}
                                onPress={() => { setShowDatePicker(!showDatePicker) }}
                            >
                                <Icon source="check-outline" size={18} />
                            </Button>
                            {showDatePicker && (
                                <DatePicker value={result.Date}
                                    onChange={(d) => {
                                        const newResult = { ...result };
                                        newResult.Date = d;
                                        setResult(newResult);
                                    }
                                    } />
                            )}
                        </View>
                        <View style={styles.fldContainer}>
                            <Text style={styles.fldLabel}>Dest</Text>
                            <DropDownBox itemSourse={["*", ...props.destList]}
                                fldStyle={[styles.destTable, styles.fldMargins]}
                                selItem={dest}
                                onChange={(newitm) => {
                                    setDest(newitm);
                                }}
                            />
                        </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button mode='outlined' onPress={() => { 
                            const rv:TDlgGroupEditResult = {
                                account:destTable === "*"?"":destTable,
                                date:showDatePicker?result.Date:undefined,
                                dest:dest==="*"?"":dest
                            }
                            props.onApplyButtonClick(rv); 
                        }}>Apply</Button>
                        <Button mode='outlined' onPress={() => { props.onCancelButtonClick() }}>Cancel</Button>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    dialog: {
        marginLeft: 12,
        marginRight: 10,
        minHeight: 450,
        borderWidth: 1,
        borderColor: '#635e5e'
    },
    fldMargins: {
        marginTop: 10,
        marginLeft: 5,
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#ddd2bf',
        borderRadius: 12,
    },
    destTable: {
        width: 140
    },
    fldContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    fldLabel: {
        marginTop: 25,
        minWidth: 100,
        marginRight: 15,
        fontSize: 20
    },
    buttonsContainer:{
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 5, 
        marginRight: 5, 
        marginTop: 70, 
        gap: 100 
    }
});
