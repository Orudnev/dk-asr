import { SQLiteDatabase } from "react-native-sqlite-storage";
import { openDatabase } from "./dbTypes";
import { TAllTables, TJCommonRow } from "../googleDoc/types";
import { printObjectArray } from "../debug/printObjectArray";

export const DefaultSettings = {
    googleDocUrl: "",
    allTables: {BnBish:[],BnSok:[],BnMb:[],Nal:[],JCommon:[],DCItems:[],Dest:[]} as TAllTables
}

function deserializeDates(propName:keyof typeof DefaultSettings,objValue:any){
    const restoreDate = (obj:any,datePropNames:string[])=>{
        datePropNames.forEach(propName =>{
            const strValue = obj[propName];
            const dateValue = new Date(strValue);
            obj[propName] = dateValue;
        })
    }
    switch (propName){
        case 'allTables':
            const tobj = objValue as TAllTables;
            tobj.JCommon.forEach(r=>restoreDate(r,["Date","AddRowTime"]));
            break
        default:
    }
    return objValue;
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
        deserializeDates(propName,rv)
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


async function joinAllAccountTables(){
    const allTblObj = await getProperty<TAllTables>('allTables');
    addResultToGlobal("allTblObj",allTblObj);
    const getRows = (tblName:string)=>{
        const rv = (allTblObj as any)[tblName].map((r:any)=>({...r,DestTable:tblName}));
        return rv;
    };
    const joinedTable = [...getRows("BnBish"),...getRows("BnSok"),...getRows("BnMb"),...getRows("Nal")];
    return joinedTable as TJCommonRow[];
}


function addResultToGlobal(name:string,value:any){
    if(!(global as any).result){
        (global as any).result = {};
    }
    (global as any).result[name] = value;
}

export function RegDebugApiFunc(dbg: object) {
    (dbg as any).Settings = {
        getProp: getProperty,
        setProp: setProperty,
        printAllRows: printAllRows,
        getAllTableRows:async(result:any)=>{
            const joinedTbl = await joinAllAccountTables();
            console.log(joinedTbl);
            addResultToGlobal("joinedTbl",joinedTbl);
        },
        findRows:async(searchCriteria:string)=>{
            if(!(global as any).result || !(global as any).result.joinedTbl.filter){
                await (global as any).dbg.Settings.getAllTableRows();
            }
            const normalize = (str:string)=>str.toLowerCase().replace(/ё/g, 'е');
            const result = (global as any).result.joinedTbl.filter((row:any)=>normalize(row.Description).includes(normalize(searchCriteria))).sort((r:any)=>r.Date).reverse();
            console.log(result);
            printObjectArray(result);
        }
    };
}





