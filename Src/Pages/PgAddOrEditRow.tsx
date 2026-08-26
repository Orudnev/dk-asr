import { useContext, useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Keyboard } from "react-native";
import { Button, Icon, ActivityIndicator, DataTable } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';
import { MoneyAccounts, TAllTables, TJCommonRow, TMoneyAccount } from '../googleDoc/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getProperty } from '../db/tblSettings';
import { getColumnTextStyle } from './PgPurchases';
import { AppContext } from '../../App';

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
            props.onChange(newItem);
        } else {
            props.onChange(newval);
        }
    };

    if (props.selItem != 'BnBish') {
        let s = 1;
    }

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <View style={{ ...props.fldStyle, ...fldStyles.fldCommon, ...borderStyle }}>
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

function joinAllAccountTables(allTblObj: TAllTables) {
    const getRows = (tblName: string) => {
        const rv = (allTblObj as any)[tblName].map((r: any) => ({ ...r, DestTable: tblName }));
        return rv;
    };
    const joinedTable = [...getRows("BnBish"), ...getRows("BnSok"), ...getRows("BnMb"), ...getRows("Nal")];
    return joinedTable as TJCommonRow[];
}

type TSearchResultDataGridProps = {
    rows: TJCommonRow[],
    onRowSelected: (rowId: string) => void
};



export function SearchResultDataGrid(props: TSearchResultDataGridProps) {

    const TABLE_COLUMNS = [
        { key: 'Sum', title: 'Sum', numeric: true, width: 40 },
        { key: 'Description', title: 'Description', numeric: false, width: 220 },
        { key: 'DCItem', title: 'DCItem', numeric: false, width: 120 },
    ] as const;


    function getColumnStyle(column: (typeof TABLE_COLUMNS)[number]) {
        return [
            styles.column,
            { width: column.width },
            !column.numeric && styles.textColumn,
            column.numeric && styles.numberColumn
        ];
    }
    function getColumnTextStyle(column: (typeof TABLE_COLUMNS)[number]) {
        return !column.numeric ? styles.leftAlignedText : undefined;
    }


    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    function handleRowPress(rowId: string) {
        setSelectedRowId(current => (current === rowId ? null : rowId));
        props.onRowSelected(rowId);
    }

    function formatCellValue(row: TJCommonRow, columnKey: (typeof TABLE_COLUMNS)[number]['key']) {
        const value = (row as any)[columnKey];
        return value == null ? '' : String(value);
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
                <DataTable>
                    <DataTable.Header>
                        {TABLE_COLUMNS.map(column => (
                            <DataTable.Title
                                key={column.key}
                                numeric={column.numeric}
                                style={getColumnStyle(column)}
                                textStyle={getColumnTextStyle(column)}>
                                {column.title}
                            </DataTable.Title>
                        ))}
                    </DataTable.Header>
                </DataTable>
                <ScrollView style={{ maxHeight: 450, }} nestedScrollEnabled>
                    <DataTable>
                        {props.rows.map((row, index) => (
                            <DataTable.Row
                                key={row.Id.toString + "_" + index.toString()}
                                onPress={() => handleRowPress(row.Id)}
                                style={selectedRowId === row.Id ? styles.selectedRow : undefined}>
                                {TABLE_COLUMNS.map(column => (
                                    <DataTable.Cell
                                        key={column.key}
                                        numeric={column.numeric}
                                        style={getColumnStyle(column)}
                                        textStyle={getColumnTextStyle(column)}>
                                        {formatCellValue(row, column.key)}
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </ScrollView>
            </View>
        </ScrollView>
    );
}

export function PgAddOrEditRow(): React.JSX.Element {
    const appContext = useContext(AppContext);
    const [searchCriteria, setSearchCriteria] = useState('');
    const [destTable, setDestTable] = useState<TMoneyAccount>('BnBish');
    const [date, setDate] = useState<Date>(new Date());
    const [DCItem, setDCItem] = useState("Прод");
    const [dest, setDest] = useState("Биш");
    const [description, setDescription] = useState("Blablablablab");
    const [sum, setSum] = useState((100500).toString());
    const [allTables, setAllTables] = useState<TAllTables | null>(null);
    const [allAccTableRows, setAllAccTableRows] = useState<TJCommonRow[]>([]);
    const [searchResultRows, setSearchResultRows] = useState<TJCommonRow[]>([]);
    useEffect(() => {
        const loadTables = async () => {
            const data = await getProperty<TAllTables>('allTables');
            setAllTables(data);
            let searchSrc = joinAllAccountTables(data);
            setAllAccTableRows(searchSrc);
        };
        loadTables();
    }, []);
    useEffect(() => {
        if (searchResultRows.length === 1) {
            handleOnDataGridRowSelected(searchResultRows[0].Id);
            Keyboard.dismiss();
        }
    }, [searchResultRows]);
    useEffect(() => {
        if (appContext && appContext.currRow) {
            setDestTable(appContext.currRow.DestTable);
            setDate(appContext.currRow.Date);
            setDCItem(appContext.currRow.DCItem);
            setDest(appContext.currRow.Dest);
            setSum(appContext.currRow.Sum.toString());
            setDescription(appContext.currRow.Description);
        }

    }, [appContext?.currPage])

    const onSearchCriteriaChange = (searchCriteria: string) => {
        setSearchCriteria(searchCriteria);
        const normalize = (str: string) => str.toLowerCase().replace(/ё/g, 'е');
        const words = searchCriteria.split(' ');
        const searchDescript = normalize(words[0]);
        const searchSum = words.length > 1 ? words[1] : "";
        let newSearchResult = allAccTableRows.filter(r => r.Description && r.Date).filter(r => {
            const srchDescriptResult = normalize(r.Description).includes(searchDescript);
            return srchDescriptResult;
        })
            .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        const lengthLimit = 50;
        if (newSearchResult.length >= lengthLimit) {
            let firstN = newSearchResult.slice(0, lengthLimit);
            newSearchResult = firstN;
        }
        let finalList: TJCommonRow[] = [];
        newSearchResult.forEach(itm => {
            if (!finalList.find(flItm => flItm.Sum == itm.Sum)) {
                finalList.push(itm);
            }
        });
        if (searchSum) {
            finalList = finalList.filter(r => r.Sum === parseInt(searchSum));
        }
        setSearchResultRows(finalList);
    }

    const handleOnDataGridRowSelected = (rowId: string) => {
        let row = searchResultRows.find(r => r.Id === rowId);
        if (row) {
            setDCItem(row.DCItem);
            setSum(row.Sum.toString());
            setDescription(row.Description);
        }
    };

    return (
        <SafeAreaView>
            <View style={[{ display: 'flex', flexDirection: 'row', marginRight: 10 }, { ...fldStyles.fldCommon, ...borderStyle }]}>
                <RButton onClick={() => { }} />
                <TextInput style={[styles.value, { maxWidth: 300 }]}
                    multiline={true}
                    value={searchCriteria}
                    onChangeText={(tx) => {
                        onSearchCriteriaChange(tx);
                    }}
                />
            </View>
            <View style={[borderStyle, { height: 250, marginLeft: 5, marginRight: 5, marginTop: 10 }]}>
                <SearchResultDataGrid rows={searchResultRows} onRowSelected={handleOnDataGridRowSelected} />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: 300 }}>
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
                        <TextInput style={styles.value} value={sum.toString()}
                            onChangeText={setSum}
                            keyboardType='numeric' />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ ...fldStyles.Description, ...fldStyles.fldCommon, ...borderStyle }}>
                        <TextInput style={styles.value} value={description}
                            onChangeText={setDescription}
                        />
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
        minHeight: 50,
    },
    destTable: {
        width: 140
    },
    selectedDate: {
        width: 120,
        minHeight: 50
    },
    datePickerText: {
        color: '#ffffff',
        width: 120
    },
    DCItem: {
        width: 195
    },
    Dest: {
        width: 140
    },
    Description: {
        paddingTop: 3,
        width: '95%',
    },
    Sum: {
        paddingTop: 5,
        width: 140
    },


});

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
    column: {
        flexGrow: 0,
        flexShrink: 0,
    },

    selectedRow: {
        backgroundColor: 'rgba(187, 134, 252, 0.18)',
    },
    textColumn: {
        justifyContent: 'flex-start',
    },
    numberColumn: {
        marginRight: 10
    },
    leftAlignedText: {
        textAlign: 'left',
    },
});