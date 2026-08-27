import { useContext, useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Keyboard } from "react-native";
import { Button, Icon, ActivityIndicator, DataTable } from 'react-native-paper';
import { TJCommonRow } from '../googleDoc/types';


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
            { flexGrow: 0,flexShrink: 0, width: column.width },
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

const styles = StyleSheet.create({
    textColumn: {
        justifyContent: 'flex-start',
    },
    numberColumn: {
        marginRight: 10
    },
    selectedRow: {
        backgroundColor: 'rgba(187, 134, 252, 0.18)',
    },
    leftAlignedText: {
        textAlign: 'left',
    },    
});