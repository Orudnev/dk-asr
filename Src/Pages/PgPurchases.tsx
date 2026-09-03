import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Appbar, Button, DataTable, Icon, Text, Checkbox, Menu } from 'react-native-paper';
import { AppContext } from '../../App';
import { getProperty, setProperty } from '../db/tblSettings';
import { TAllTables, TJCommonRow, TMoneyAccount, TTotals } from '../googleDoc/types';
import { generatePseudoUniqueId, getTotals, updateDataFromCloud } from '../googleDoc/helper';
import { Pgstyle } from './pgStyle';
import { DlgGroupEdit } from './DlgGroupEdit';
import { dateToStr } from '../components/datepicker';
import { DatePickerModal } from 'react-native-paper-dates';

export const TABLE_COLUMNS = [
  { key: 'Sum', title: 'Sum', numeric: true, width: 50 },
  { key: 'Description', title: 'Description', numeric: false, width: 120 },
  { key: 'DestTable', title: 'DstTbl', numeric: false, width: 65 },
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
    { width: column.width, maxWidth: column.width },
    !column.numeric && styles.textColumn,
    column.numeric && styles.numberColumn
  ];
}

export function getColumnTextStyle(column: (typeof TABLE_COLUMNS)[number]) {
  return !column.numeric ? styles.leftAlignedText : undefined;
}

type TOrder = 'asc' | 'desc';
type TColumnOrder = {
  columnKey: string,
  colNumber: number,
  order: TOrder
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
  const [dlgGroupEditVisibility, setDlgGroupEditVisibility] = useState(false);
  const [destItems, setDestItems] = useState<string[]>([]);
  const [selMultipleDatesDlgVisibility, setSelMultipleDatesDlgVisibility] = useState(false)
  const [columnSortOrderList, setColumnSortOrderList] = useState<TColumnOrder[]>([]);
  const [isMultiColumnSort, setIsMultiColumnSort] = useState(false);

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const allTables = await getProperty<TAllTables>('allTables');
    setDestItems(allTables.Dest);
    const loadedRows = allTables?.JCommon.filter(r => r.Status < 3) ?? [];
    setRows(loadedRows);
    const newTotals = await getTotals();
    setSelectedRowIds([]);
    setTotals(newTotals);
    setIsLoading(false);
    setMenuVisibility(false);
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
      return value ? dateToStr(value) : '';
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

  function getColumnOrderIcon(columnKey: string) {
    const orderItem = columnSortOrderList.find(oitm => oitm.columnKey == columnKey);
    const iconSize = 12;
    const stl = { marginRight: 5 }
    if (!orderItem) return null;
    const numberIconName = `numeric-${orderItem.colNumber}-circle-outline`
    const numberIcon = isMultiColumnSort
      ? (
        <Icon source={numberIconName} size={iconSize} />
      )
      : (
        null
      );
    if (orderItem.order == 'asc') {
      return (
        <View style={stl}>
          <Icon source="arrow-up-thin" size={iconSize} />
          {numberIcon}
        </View>
      );
    }
    return (
      <View style={stl} >
        <Icon source="arrow-down-thin" size={iconSize} />
        {numberIcon}
      </View>
    );
  }

  function handleColumnHeaderPress(columnKey: string) {
    if (!multiSelect) {
      if (columnSortOrderList.length == 0) {
        setColumnSortOrderList([{ columnKey: columnKey, colNumber: 1, order: 'asc' }]);
        return;
      }
      if (columnSortOrderList[0].columnKey === columnKey) {
        if (columnSortOrderList[0].order == 'asc') {
          setColumnSortOrderList([{ columnKey: columnKey, colNumber: 1, order: 'desc' }]);
          return;
        }
        if (columnSortOrderList[0].order == 'desc') {
          setColumnSortOrderList([]);
          return;
        }
      } else {
        setColumnSortOrderList([{ columnKey: columnKey, colNumber: 1, order: 'asc' }]);
        return;
      }
    }
    let newColumnOrderList = [...columnSortOrderList];
    const orderItem = newColumnOrderList.find(oitm => oitm.columnKey == columnKey);
    if (orderItem) {
      if (orderItem.order == 'asc') {
        orderItem.order = 'desc';
      } else {
        const selectedColNumber = orderItem.colNumber;
        newColumnOrderList = newColumnOrderList.filter(x => x.columnKey != orderItem.columnKey)
        newColumnOrderList.forEach(itm => {
          if (itm.colNumber < selectedColNumber) {
            return;
          }
          itm.colNumber--;
        });
      }
    } else {
      newColumnOrderList.push({ columnKey: columnKey, colNumber: newColumnOrderList.length + 1, order: 'asc' });
    }
    setColumnSortOrderList(newColumnOrderList);
  }



  const dlgInitRow = rows.find(r => r.Id === selectedRowIds[0]);
  return (
    <View style={[Pgstyle.clientArea, styles.page]}>
      <Appbar.Header>
        <Appbar.Action icon="cart" accessibilityLabel="Purchases" />
        <Appbar.Content title="Purchases" />
      </Appbar.Header>
      <Totals {...totals}></Totals>
      <View style={[Pgstyle.commandButtons]}>
        <Button mode="outlined" icon="reload" onPress={loadDataFromCloud}>Reload</Button>
        <Button mode="outlined"
          onPress={() => {
            const newValue = !multiSelect;
            setMultiSelect(newValue);
            if (!newValue) {
              setSelectedRowIds([]);
            }
          }}
          style={multiSelect ? styles.selectedBackgrColor : undefined}
        >
          <Icon source="check-outline" size={20} />
        </Button>
        {(selectedRowId || ((multiSelect || selectedRowId) && selectedRowIds.length > 0)) && (
          <Menu
            style={styles.menuContainer}
            visible={menuVisibility}
            onDismiss={() => setMenuVisibility(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisibility(true)}><Icon source="menu" size={20} /></Button>
            }
          >
            {multiSelect && selectedRowIds.length > 0 && (
              <Menu.Item
                onPress={async () => {
                  const allTables = await getProperty<TAllTables>('allTables');
                  allTables.JCommon = rows.filter(r => !selectedRowIds.includes(r.Id));
                  await setProperty('allTables', allTables);
                  reloadData();
                }}
                title="Delete selected"
              />
            )}
            {multiSelect && selectedRowIds.length > 0 && (
              <Menu.Item
                onPress={() => {
                  setDlgGroupEditVisibility(true);
                  setMenuVisibility(false);
                }}
                title="Group edit"
              />
            )}
            {selectedRowId && (
              <Menu.Item titleStyle={menuTitleStyle} style={styles.menuItem}
                onPress={() => {
                  setSelMultipleDatesDlgVisibility(true);
                }}
                title="Repeat"
              />
            )}
            <Menu.Item title="Multi Column Sorting" titleStyle={[menuTitleStyleCheckBox]} style={styles.menuItem}
              onPress={() => {
                const newMultiColumnSort = !isMultiColumnSort
                setIsMultiColumnSort(newMultiColumnSort);
                setMenuVisibility(false);
                if (!newMultiColumnSort) {
                  setColumnSortOrderList([]);
                }
              }}
              leadingIcon={() => (
                <Checkbox status={isMultiColumnSort ? 'checked' : 'unchecked'} />
              )}
            />

          </Menu>
        )}
      </View>
      {dlgInitRow && (
        <DlgGroupEdit show={dlgGroupEditVisibility}
          initValues={dlgInitRow}
          destList={destItems}
          onApplyButtonClick={async (result) => {
            selectedRowIds.forEach(selRowId => {
              const selRow = rows.find(r => r.Id === selRowId)
              if (selRow) {
                if (result.account) selRow.DestTable = result.account as TMoneyAccount;
                if (result.date) selRow.Date = result.date;
                if (result.dest) selRow.Dest = result.dest;
              }
            });
            const allTables = await getProperty<TAllTables>('allTables');
            allTables.JCommon = rows;
            await setProperty('allTables', allTables);
            setDlgGroupEditVisibility(false);
            reloadData();
          }}
          onCancelButtonClick={() => { setDlgGroupEditVisibility(false) }}
        />)}
      <DatePickerModal mode='multiple' visible={selMultipleDatesDlgVisibility}
        locale="en"
        onDismiss={() => {
          setSelMultipleDatesDlgVisibility(false);
          setMenuVisibility(false);
        }}
        onConfirm={async ({ dates }) => {
          const currRow = rows.find(r => r.Id === selectedRowId);
          if (currRow) {
            dates.forEach(d => {
              const newRow = { ...currRow };
              newRow.Id = generatePseudoUniqueId();
              newRow.Date = d;
              rows.push(newRow);
            });
            const allTables = await getProperty<TAllTables>('allTables');
            allTables.JCommon = rows;
            await setProperty('allTables', allTables);
            reloadData();
          }
          setSelMultipleDatesDlgVisibility(false);
          setMenuVisibility(false);
        }}
      />
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
                    textStyle={getColumnTextStyle(column)}
                    onPress={() => handleColumnHeaderPress(column.key)}
                  >
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      {getColumnOrderIcon(column.key)}
                      <Text>{column.title}</Text>
                    </View>
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
  },
  menuContainer: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#636262',
  },

});

const menuTitleStyle: StyleProp<TextStyle> = {
  textAlign: 'right',
  width: 180,
  marginLeft: 31,
}

const menuTitleStyleCheckBox: StyleProp<TextStyle> = {
  textAlign: 'right',
  width: 180,
}