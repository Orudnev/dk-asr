import axios from "axios";
import { getProperty } from "../db/tblSettings";
import { TAllTables } from "../googleDoc/types";



export async function GetAllTablesContent() {
     const API_URL = await getProperty<string>('googleDocUrl');
     return axios({
        url:API_URL,
        method:'GET',
        params:{method:"getAllTablesContent"}
    })
    .then((resp:any)=>{
        if (!resp.data.isOk) throw new Error(resp.data.error);
        return resp.data.invokeMethodResult;
    }); 
} 

export async function Commit() {
     const API_URL = await getProperty<string>('googleDocUrl');
     return axios({
        url:API_URL,
        method:'GET',
        params:{method:"commit"}
    })
    .then((resp:any)=>{
        if (!resp.data.isOk) throw new Error(resp.data.error);
        return resp.data.invokeMethodResult;
    }); 
} 

export async function UploadJCommon(){
     const API_URL = await getProperty<string>('googleDocUrl');
     const alltbl = await getProperty<TAllTables>('allTables')
     return axios({
        url:API_URL,
        method:'POST',
        data:alltbl.JCommon.filter(r=>r.Status === 0)
    })
    .then((resp:any)=>{
        return resp.data;
    }); 
}