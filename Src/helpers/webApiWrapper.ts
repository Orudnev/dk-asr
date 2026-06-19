import axios from "axios";
import { getProperty } from "../db/tblSettings";



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