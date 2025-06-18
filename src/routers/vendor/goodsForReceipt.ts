import axios from "axios";
import { Request, Response } from "express";
import { convertDateFromInt } from "../../utils/date";

interface GoodsReceipt {
    // "__metadata": any,
    "DocNumber": string,
    "DocYear": string,
    "PostDate": string,
    "DocDate": string,
    "DocType": string,
    "Name": string,
    "ItemNumber": string,
    "PoNumber": string,
    "PoItem": string,
    "MovementType": string,
    "Quantity": string,
    "Unit": string,
    "Plant": string,
    "StorageLoc": string,
    "MaterialNumber": string,
    "AccountNumber": string,
};

export default async function (request: Request, response: Response): Promise<void> {
    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/GoodsReceiptSet?$format=json',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );

        let _goodsReceiptArray: GoodsReceipt[] = [];

        SAPresponse.data.d.results.forEach((item: any) => {
            _goodsReceiptArray.push({
                "DocNumber": item?.DocNumber,
                "DocYear": item.DocYear,
                "PostDate": convertDateFromInt(item.PostDate),
                "DocDate": convertDateFromInt(item.DocDate),
                "DocType": item.DocType,
                "Name": item.Name,
                "ItemNumber": item.ItemNumber,
                "PoNumber": item.PoNumber,
                "PoItem": item.PoItem,
                "MovementType": item.MovementType,
                "Quantity": item.Quantity,
                "Unit": item.Unit,
                "Plant": item.Plant,
                "StorageLoc": item.StorageLoc,
                "MaterialNumber": item.MaterialNumber,
                "AccountNumber": item.AccountNumber,
            });
        });

        if (accountNumber) {
            _goodsReceiptArray = _goodsReceiptArray.filter(item => {
                return item.AccountNumber === accountNumber;
            });
        }

        response.status(200).json({ "data": _goodsReceiptArray });
    } catch (error: any) {
        response.status(500).json({ error: error });
    }
}