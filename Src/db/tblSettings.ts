import { SQLiteDatabase } from "react-native-sqlite-storage";
import { openDatabase } from "./dbTypes";
import { TJCommonRow } from "../googleDoc/types";
import { printObjectArray } from "../debug/printObjectArray";


export const DefaultSettings = {
    googleDocUrl: "",
    allTables: {}
}

async function createIfNotExists(db: SQLiteDatabase) {
    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Settings (
      PropName TEXT PRIMARY KEY,
      Content TEXT
    );
  `);
}

export async function getProperty<T>(propName: keyof typeof DefaultSettings): Promise<T> {
    const defaultValue = DefaultSettings[propName] as T;
    const db = await openDatabase();
    await createIfNotExists(db);
    const result = await db.executeSql(
        "SELECT Content FROM Settings WHERE PropName = ?",
        [propName]
    );
    if (!result || result[0].rows.length === 0) {
        return defaultValue;
    }
    const row = result[0].rows.item(0);
    try {
        const rv = JSON.parse(row.Content) as T;
        return rv;
    } catch {
        return defaultValue;
    }
}

export async function setProperty(
    propName: keyof typeof DefaultSettings,
    value: any
): Promise<void> {
    const db = await openDatabase();
    await createIfNotExists(db);

    const content = JSON.stringify(value) ?? "null";
    await db.executeSql(
        "INSERT OR REPLACE INTO Settings (PropName, Content) VALUES (?, ?)",
        [propName, content]
    );
    console.log(`Setting ${propName} stored`);
}

async function printAllRows() {
    const db = await openDatabase();
    await createIfNotExists(db);
    const result = await db.executeSql("SELECT PropName, Content FROM Settings");
    if (!result || result[0].rows.length === 0) {
        console.log(`Table Settings: No Rows`);
        return;
    }
    let rows: any[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        rows.push(row);
    }
    printObjectArray(rows);
}

export function RegDebugApiFunc(dbg: object) {
    (dbg as any).Settings = {
        getProp: getProperty,
        setProp: setProperty,
        printAllRows: printAllRows
    };
}




