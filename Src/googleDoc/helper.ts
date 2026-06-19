import { getProperty, setProperty } from "../db/tblSettings";
import { GetAllTablesContent } from "../helpers/webApiWrapper";
import { TAccountRow, TAllTables, TDCItemRow, TJCommonRow } from "./types";

export async function updateDataFromCloud() {
    const rawData: any = await GetAllTablesContent();
    const allTblContentDTO: TAllTables = {
        JCommon: convertArrayToJCommonRows(rawData.JCommon),
        BnBish: convertArrayToAccountRows(rawData.BnBish),
        BnSok: convertArrayToAccountRows(rawData.BnSok),
        BnMb: convertArrayToAccountRows(rawData.BnMb),
        Nal: convertArrayToAccountRows(rawData.Nal),
        Dest: (() => rawData.Dest.map((itm: any) => itm[0]))(),
        DCItems: convertArrayToDCItemRows(rawData.DCItems)
    }
    await setProperty('allTables', allTblContentDTO);
}

function convertArrayToJCommonRows(rows: any[]): TJCommonRow[] {
    let result: TJCommonRow[] = [];
    rows.forEach((row) => {
        let newRow: TJCommonRow = {
            Id: row[0],
            DestTable: row[1],
            Date: new Date(row[2]),
            DCItem: row[3],
            Description: row[4],
            Dest: row[5],
            Sum: row[6],
            Sign: row[7],
            AddRowTime: new Date(row[8]),
            Status: row[9]
        };
        result.push(newRow);
    });
    return result;
}

function convertArrayToAccountRows(rows: any[]): TAccountRow[] {
    let result: TAccountRow[] = [];
    rows.forEach((row) => {
        let newRow: TAccountRow = {
            Id: row[0],
            Date: new Date(row[1]),
            DCItem: row[2],
            Dest: row[3],
            Description: row[4],
            Sum: row[5],
            Sign: row[6],
            Total: row[7],
            Status: row[8]
        };
        result.push(newRow);
    });
    return result;
}


function convertArrayToDCItemRows(rows: any[]): TDCItemRow[] {
    let result: TDCItemRow[] = [];
    rows.forEach((row) => {
        let newRow: TDCItemRow = {
            Name: row[0],
            Sign: row[1],
            Dest: row[2]
        };
        result.push(newRow);
    });
    return result;
}