import { RegDebugApiFunc } from "../db/tblSettings";
import { GetAllTablesContent } from "../helpers/webApiWrapper";
import { printObjectArray } from "./printObjectArray";

export const dbg = {

}

export function RegisterDebugAPI(){
    (global as any).dbg = dbg;
    (dbg as any).util = {
        printObjArray: printObjectArray
    }; 
    (dbg as any).webapi = {
        getAllTablesContent: GetAllTablesContent
    }
    RegDebugApiFunc(dbg);
}