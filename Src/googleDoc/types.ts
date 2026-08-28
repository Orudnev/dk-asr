export type TMoneyAccount = 'BnBish'|'BnSok'|'BnMb'|'Nal';
export const MoneyAccounts:TMoneyAccount[] = ['BnBish','BnSok','BnMb','Nal'];

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

export type TJCommonRow = Omit<TAccountRow,"Total"> & {
    DestTable:TMoneyAccount,
    AddRowTime:Date
}



export type TDCItemRow = {
    Name: string,
    Sign: number,
    Dest: string
}

export type TAllTables = {
    BnBish: TAccountRow[],
    BnSok: TAccountRow[],
    BnMb: TAccountRow[],
    Nal:TAccountRow[],
    JCommon: TJCommonRow[],
    DCItems: TDCItemRow[],
    Dest: string[]
}

export type TTotals = {
    BnBish: number,
    BnSok: number,
    BnMb: number,
    Nal: number
}

export enum StatusEnum {
    New = -1,
    NotProcessed = 0,
    InProcess = 1,
    Processed = 2,
    Lookup = 3
}