import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, DataTable, Icon, Text, Checkbox, Menu } from 'react-native-paper';
import { AppContext } from '../../App';
import { getProperty } from '../db/tblSettings';
import { TAllTables, TJCommonRow, TTotals } from '../googleDoc/types';
import { getTotals, updateDataFromCloud } from '../googleDoc/helper';
import { Pgstyle } from './pgStyle';
import { lightGreen100, lightGreen500 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import DataTableCell from 'react-native-paper/lib/typescript/components/DataTable/DataTableCell';
import { DlgGroupEdit } from './DlgGroupEdit';

export const TABLE_COLUMNS = [
  { key: 'Sum', title: 'Sum', numeric: true, width: 50 },
  { key: 'Description', title: 'Description', numeric: false, width: 120 },
  { key: 'DestTable', title: 'DstTbl', numeric: false, width: 50 },
  { key: 'Date', title: 'Date', numeric: false, width: 80 },
  { key: 'DCItem', title: 'DCItem', numeric: false, width: 120 },
  { key: 'Dest', title: 'Dest', numeric: false, width: 100 },
] as const;




function Totals(props: TTotals) {
  return (
    <View style={[Pgstyle.totalBar]}>
      <View style={[styles.totalItemContainer]}>
        <Text style={[styles.totalItemLabel]}>BnBish</Text>
        <Text style={[styles.totalItemValue]}>{props.BnBish}</Text>
      </View>
      <View style={[styles.totalItemContainer]}>
        <Text style={[styles.totalItemLabel]}>BnSok</Text>
        <Text style={[styles.totalItemValue]}>{props.BnSok}</Text>
      </View>
      <View style={[styles.totalItemContainer]}>
        <Text style={[styles.totalItemLabel]}>BnMb</Text>
        <Text style={[styles.totalItemValue]}>{props.BnMb}</Text>
      </View>
      <View style={[styles.totalItemContainer]}>
        <Text style={[styles.totalItemLabel]}>Nal</Text>
        <Text style={[styles.totalItemValue]}>{props.Nal}</Text>
      </View>
    </View>
  );
}

export function getColumnStyle(column: (typeof TABLE_COLUMNS)[number]) {
  return [
    styles.column,
    { width: column.width },
    !column.numeric && styles.textColumn,
    column.numeric && styles.numberColumn
  ];
}

export function getColumnTextStyle(column: (typeof TABLE_COLUMNS)[number]) {
  return !column.numeric ? styles.leftAlignedText : undefined;
}

export default function PgPurchases() {
  const appContext = useContext(AppContext);
  const [isLoasing, setIsLoading] = useState(false);
  const [rows, setRows] = useState<TJCommonRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [totals, setTotals] = useState<TTotals>({ BnBish: 0, BnSok: 0, BnMb: 0, Nal: 0 });
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [menuVisibility, setMenuVisibility] = useState(false);
  const [dlgGroupEditVisibility,setDlgGroupEditVisibility] = useState(false);

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const allTables = await getProperty<TAllTables>('allTables');
    const loadedRows = allTables?.JCommon.filter(r => r.Status < 3) ?? [];
    setRows(loadedRows);
    const newTotals = await getTotals();
    setTotals(newTotals);
    setIsLoading(false);
  }, []);

  const loadDataFromCloud = async () => {
    setIsLoading(true);
    await updateDataFromCloud();
    reloadData();
  };

  useEffect(() => {
    if (appContext?.currPage !== 'purchases') {
      return;
    }

    reloadData();
  }, [appContext?.currPage, reloadData]);

  function formatCellValue(row: TJCommonRow, columnKey: (typeof TABLE_COLUMNS)[number]['key']) {
    const value = (row as any)[columnKey];

    if (columnKey === 'Date') {
      return value ? String(value).slice(0, 10) : '';
    }

    return value == null ? '' : String(value);
  }
  function handleRowPress(rowId: string) {
    setSelectedRowId(current => (current === rowId ? null : rowId));
    const currRow = rows.find(r => r.Id === rowId);
    if (appContext && currRow) {
      appContext.setCurrRow(currRow);
    }
  }


  return (
    <View style={[Pgstyle.clientArea, styles.page]}>
      <DlgGroupEdit show={dlgGroupEditVisibility} 
        initValues={rows.find(r=>r.Id === selectedRowIds[0])}
        onApplyButtonClick={()=>{}}
        onCancelButtonClick={()=>{setDlgGroupEditVisibility(false)}}
       />
      <Appbar.Header>
        <Appbar.Action icon="cart" accessibilityLabel="Purchases" />
        <Appbar.Content title="Purchases" />
      </Appbar.Header>
      <Totals {...totals}></Totals>
      <View style={[Pgstyle.commandButtons]}>
        <Button mode="outlined" icon="reload" onPress={loadDataFromCloud}>Reload</Button>
        <Button mode="outlined"
          onPress={() => { setMultiSelect(!multiSelect) }}
          style={multiSelect ? styles.selectedBackgrColor : undefined}
        >
          <Icon source="check-outline" size={20} />
        </Button>
        {(multiSelect || selectedRowId) && (
          <Menu
            visible={menuVisibility}
            onDismiss={() => setMenuVisibility(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisibility(true)}><Icon source="menu" size={20} /></Button>
            }
          >
            {multiSelect && (
              <Menu.Item
                onPress={() => {
                }}
                title="Delete selected"
              />
            )}
            {multiSelect && (
              <Menu.Item
                onPress={() => {
                  setDlgGroupEditVisibility(true);
                }}
                title="Group edit"
              />
            )}
            {selectedRowId && (
              <Menu.Item
                onPress={() => {
                }}
                title="Repeat"
              />
            )}
          </Menu>
        )}
      </View>
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <DataTable>
              <DataTable.Header>
                {multiSelect && (
                  <DataTable.Title style={{ marginTop: 8 }}
                    key={'checkColumn'}>
                    <Checkbox
                      status={selectAllCheckBox ? 'checked' : 'unchecked'}
                      onPress={() => {
                        const newValue = !selectAllCheckBox;
                        setSelectAllCheckBox(newValue);
                        if (newValue) {
                          setSelectedRowIds(rows.map(r => r.Id));
                        } else {
                          setSelectedRowIds([]);
                        }
                      }}
                    />
                  </DataTable.Title>
                )}
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
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              <DataTable>
                {rows.map(row => (
                  <DataTable.Row
                    key={row.Id}
                    onPress={() => handleRowPress(row.Id)}
                    style={selectedRowId === row.Id ? styles.selectedRow : undefined}>
                    {multiSelect && (
                      <DataTable.Cell key="checkColumn">
                        <Checkbox
                          status={selectedRowIds.includes(row.Id) ? 'checked' : 'unchecked'}
                          onPress={() => {
                            if (selectedRowIds.includes(row.Id)) {
                              setSelectedRowIds(selectedRowIds.filter(r => r === row.Id));
                            } else {
                              const newList = [...selectedRowIds];
                              newList.push(row.Id);
                              setSelectedRowIds(newList);
                            }
                          }}
                        />
                      </DataTable.Cell>
                    )}
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
      </View>
      {isLoasing && (
        <View style={[Pgstyle.overlay]} >
          <Text style={[{ fontSize: 30 }]}>Loading...</Text>
        </View>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableBody: {
    maxHeight: 450,
  },
  column: {
    flexGrow: 0,
    flexShrink: 0,
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
  selectedRow: {
    backgroundColor: 'rgba(187, 134, 252, 0.18)',
  },
  totalItemContainer: {
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    padding: 5,
    gap: 5
  },
  totalItemLabel: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center'
  },
  totalItemValue: {
    fontSize: 20,
    color: '#04d454'
  },
  selectedBackgrColor: {
    backgroundColor: '#3eac44'
  }
});
