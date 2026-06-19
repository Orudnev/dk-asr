export type TMoneyAccount = 'BnBish'|'BnSok'|'BnMb'|'Nal';

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

export type TJCommonRow = Omit<TAccountRow,"Tot"> & {
    DestTable:TMoneyAccount,
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
