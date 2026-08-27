import { useContext, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Button,
    Dialog,
    Portal,
    Text,
} from 'react-native-paper';
import { DropDownBox } from '../components/dropdownbox';
import { MoneyAccounts, TJCommonRow, TMoneyAccount } from '../googleDoc/types';
import { generatePseudoUniqueId } from '../googleDoc/helper';
import { DatePicker } from '../components/datepicker';

type TDlgGroupEdit = {
    show: boolean,
    initValues: TJCommonRow | undefined,
    destList:string[],
    onApplyButtonClick: (result: TJCommonRow) => void,
    onCancelButtonClick: () => void
}

function getInitValues(row: TJCommonRow | undefined) {
    if (!row) {
        row = { Id: generatePseudoUniqueId(), Date: new Date(), DCItem: 'Прод', DestTable: 'BnBish', Dest: 'Биш', Description: "", Sum: 0, Sign: 1, Status: 0, AddRowTime: new Date() };
    }
    return { ...row };
}

export function DlgGroupEdit(props: TDlgGroupEdit) {
    const [result, setResult] = useState(getInitValues(props.initValues));
    const [destTable, setDestTable] = useState('*');
    const [date, setDate] = useState(getInitValues(props.initValues).Date);
    const [dest,setDest] = useState("*");
    return (
        <Portal>
            <Dialog visible={props.show}>
                <Dialog.Title>Group edit</Dialog.Title>
                <Dialog.Content>
                    <DropDownBox itemSourse={["*",...MoneyAccounts]}
                        fldStyle={[styles.destTable, styles.fldMargins]}
                        selItem={destTable}
                        onChange={(newitm) => {
                            setDestTable(newitm);
                        }}
                    />
                    <DatePicker initialValue={date} wildCardInitialValue="*" onChange={setDate} />
                    <DropDownBox itemSourse={["*",...props.destList]}
                        fldStyle={[styles.destTable, styles.fldMargins]}
                        selItem={dest}
                        onChange={(newitm) => {
                            setDest(newitm);
                        }}
                    />

                    <View style={[{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, marginTop: 40, gap: 100 }]}>
                        <Button mode='outlined' onPress={() => { props.onApplyButtonClick(result) }}>Apply</Button>
                        <Button mode='outlined' onPress={() => { props.onCancelButtonClick() }}>Cancel</Button>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
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
});
