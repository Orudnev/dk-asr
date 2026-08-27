import { useContext, useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Keyboard } from "react-native";
import { Button, Icon, ActivityIndicator, DataTable } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";

import { MoneyAccounts, TAllTables, TJCommonRow, TMoneyAccount } from '../googleDoc/types';

import { getProperty, setProperty } from '../db/tblSettings';
import { getColumnTextStyle } from './PgPurchases';
import { AppContext } from '../../App';
import { generatePseudoUniqueId } from '../googleDoc/helper';
import { DropDownBox } from '../components/dropdownbox';
import { SearchResultDataGrid } from '../components/searchresultdatagrid';
import { DatePicker } from '../components/datepicker';

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


function joinAllAccountTables(allTblObj: TAllTables) {
    const getRows = (tblName: string) => {
        const rv = (allTblObj as any)[tblName].map((r: any) => ({ ...r, DestTable: tblName }));
        return rv;
    };
    const joinedTable = [...getRows("BnBish"), ...getRows("BnSok"), ...getRows("BnMb"), ...getRows("Nal")];
    return joinedTable as TJCommonRow[];
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
    const [editMode, setEditMode] = useState(false);
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

    const copyValuesToJCommonRow = (rowId: string) => {
        if (allTables && allTables.JCommon && appContext ) {
            if (rowId) {
                var cr = allTables.JCommon.find(r => r.Id == rowId);
            } else {
                cr = {Id:generatePseudoUniqueId(),Date:date,DCItem:DCItem,DestTable:'BnBish',Dest:'Биш',Description:description,Sum:0,Sign:1,Status:0,AddRowTime:new Date()};
            }

            let sign = 1;
            if (cr) {
                const currDcItem = allTables.DCItems.find(r => r.Dest === dest);
                if (currDcItem) {
                    sign = currDcItem.Sign;
                }
                cr.Date = date;
                cr.DCItem = DCItem;
                cr.Dest = dest;
                cr.Description = description;
                cr.Sum = parseInt(sum);
                cr.Sign = sign;
                return cr;
            }
        }
        return undefined;
    };

    const handleSaveButtonPress = () => {
        if (appContext && appContext.currRow) {
            const cr = copyValuesToJCommonRow(appContext.currRow.Id);
            if (cr && allTables) {
                setProperty('allTables', allTables);
            }
        }
        setEditMode(false);
        Keyboard.dismiss();
    };

    const hanldeAddNewButtonPress = () => {
        const cr = copyValuesToJCommonRow('');
        if(cr && allTables){
            allTables.JCommon.push(cr);
            setProperty('allTables', allTables);
        }
        setEditMode(false);
        Keyboard.dismiss();
    }
    const searchGridHeight = editMode ? 50 : 250;
    return (
        <SafeAreaView>
            <View style={[{ display: 'flex', flexDirection: 'row', marginRight: 10 }, { ...fldStyles.fldMargins, ...borderStyle }]}>
                <RButton onClick={() => { }} />
                <TextInput style={[styles.value, { maxWidth: 300 }]}
                    multiline={true}
                    value={searchCriteria}
                    onChangeText={(tx) => {
                        onSearchCriteriaChange(tx);
                    }}
                />
            </View>
            <View style={[borderStyle, { height: searchGridHeight, marginLeft: 5, marginRight: 5, marginTop: 10 }]}>
                <SearchResultDataGrid rows={searchResultRows} onRowSelected={handleOnDataGridRowSelected} />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: 300 }}>
                <DropDownBox itemSourse={MoneyAccounts}
                    fldStyle={[fldStyles.destTable,fldStyles.fldMargins,borderStyle]}
                    selItem={destTable}
                    onChange={(newitm) => {
                        setDestTable(newitm);
                    }}
                />
                <DatePicker initialValue={date} onChange={setDate} />
                <DropDownBox itemSourse={allTables?.DCItems.map(itm => itm.Name)}
                    fldStyle={[fldStyles.DCItem,fldStyles.fldMargins,borderStyle]}
                    selItem={DCItem}
                    onChange={(newitm) => {
                        setDCItem(newitm);
                    }}
                />
                <DropDownBox itemSourse={allTables?.Dest}
                    fldStyle={[fldStyles.Dest,fldStyles.fldMargins,borderStyle]}
                    selItem={dest}
                    onChange={(newitm) => {
                        setDest(newitm);
                    }}
                />
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ ...fldStyles.Sum, ...fldStyles.fldMargins, ...borderStyle }}>
                        <TextInput style={styles.value} value={sum.toString()}
                            onFocus={() => setEditMode(true)}
                            onChangeText={setSum}
                            keyboardType='numeric' />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ ...fldStyles.Description, ...fldStyles.fldMargins, ...borderStyle }}>
                        <TextInput style={styles.value} value={description}
                            onFocus={() => setEditMode(true)}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>
            </View>
            <View style={[{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, marginTop: 40, gap: 100 }]}>
                <Button mode="outlined" icon="content-save-edit" onPress={handleSaveButtonPress} disabled={!appContext || !appContext.currRow} style={styles.saveNewButton}>Save</Button>
                <Button mode="outlined" icon="content-save-plus" onPress={hanldeAddNewButtonPress} style={styles.saveNewButton}>New</Button>
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
    fldMargins: {
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
    saveNewButton: {
        width: 120
    }
});