import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, DataTable, Text } from 'react-native-paper';
import { AppContext } from '../../App';
import { getProperty } from '../db/tblSettings';
import { TAllTables, TJCommonRow, TTotals } from '../googleDoc/types';
import { getTotals, updateDataFromCloud } from '../googleDoc/helper';
import { Pgstyle } from './pgStyle';
import { lightGreen100, lightGreen500 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

export const TABLE_COLUMNS = [
  { key: 'Sum', title: 'Sum', numeric: true, width: 40 },
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

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const allTables = await getProperty<TAllTables>('allTables');
    const loadedRows = allTables?.JCommon.filter(r => r.Status < 3) ?? [];
    setRows(loadedRows);
    setSelectedRowId(null);
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
  }

  return (
    <View style={[Pgstyle.clientArea, styles.page]}>
      <Appbar.Header>
        <Appbar.Action icon="cart" accessibilityLabel="Purchases" />
        <Appbar.Content title="Purchases" />
      </Appbar.Header>
      <Totals {...totals}></Totals>
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
  }
});
