export type TMoneyAccount = 'BnBish'|'BnSok'|'BnMb'|'Nal';

export type TJCommonRow = {
    Id:string,
    DestTable:TMoneyAccount,
    Date:Date,
    DCItem:string,
    Description:string,
    Dest:string,
    Sum:number,
    Sign:number,
    Status:number
}

export type TAccountRow = {
    Id:string,
    Date:Date,
    DCItem:string,
    Dest:string,
    Description:string,
    Sum:number,
    Sign:number,
    Total:number,
    Status:number
}