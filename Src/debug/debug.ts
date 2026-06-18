import { printObjectArray } from "./printObjectArray";

export const dbg = {

}

export function RegisterDebugAPI(){
    (global as any).dbg = dbg;
    (dbg as any).util = {
        printObjArray: printObjectArray
    }; 
}