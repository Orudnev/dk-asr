import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, DataTable } from 'react-native-paper';
import { AppContext } from '../../App';
import { getProperty } from '../db/tblSettings';
import { TAllTables, TJCommonRow } from '../googleDoc/types';
import { updateDataFromCloud } from '../googleDoc/helper';
import { Pgstyle } from './pgStyle';

const TABLE_COLUMNS = [
  { key: 'DestTable', title: 'DestTable', numeric: false, width: 110 },
  { key: 'Date', title: 'Date', numeric: false, width: 110 },
  { key: 'DCItem', title: 'DCItem', numeric: false, width: 120 },
  { key: 'Dest', title: 'Dest', numeric: false, width: 100 },
  { key: 'Description', title: 'Description', numeric: false, width: 240 },
  { key: 'Sum', title: 'Sum', numeric: true, width: 100 },
] as const;


function Totals(totals:TTotals){
  return (
    <View style={[Pgstyle.commandButtons]}>

    </View>
  );
}


export default function PgPurchases() {
  const appContext = useContext(AppContext);
  const [rows, setRows] = useState<TJCommonRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const reloadData = useCallback(async () => {
    const allTables = await getProperty<TAllTables>('allTables');
    const loadedRows = allTables?.JCommon ?? [];
    setRows(loadedRows);
    setSelectedRowId(null);
  }, []);

  const loadDataFromCloud = async () => {
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

  function getColumnStyle(column: (typeof TABLE_COLUMNS)[number]) {
    return [
      styles.column,
      { width: column.width },
      !column.numeric && styles.textColumn,
    ];
  }

  function getColumnTextStyle(column: (typeof TABLE_COLUMNS)[number]) {
    return !column.numeric ? styles.leftAlignedText : undefined;
  }

  function handleRowPress(rowId: string) {
    setSelectedRowId(current => (current === rowId ? null : rowId));
  }

  return (
    <View style={[Pgstyle.clientArea, styles.page]}>
      <Appbar.Header>
        <Appbar.Action icon="cart" accessibilityLabel="Purchases" />
        <Appbar.Content title="Purchases" />
      </Appbar.Header>
      <View style={[Pgstyle.commandButtons]}>
        <Button mode="outlined" icon="reload" onPress={loadDataFromCloud}>Reload</Button>
      </View>
      <View style={styles.tableWrapper}>
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
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              <DataTable>
                {rows.map(row => (
                  <DataTable.Row
                    key={row.Id}
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
      </View>
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
    maxHeight: 300,
  },
  column: {
    flexGrow: 0,
    flexShrink: 0,
  },
  textColumn: {
    justifyContent: 'flex-start',
  },
  leftAlignedText: {
    textAlign: 'left',
  },
  selectedRow: {
    backgroundColor: 'rgba(187, 134, 252, 0.18)',
  },
});
