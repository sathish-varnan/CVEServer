import axios from "axios";
import { Request, Response } from "express";
import PurchaseOrder from "../../types/purchaseOrder";
import { convertDateFromInt } from "../../utils/date";

interface PO {
    "__metadata": any,
    "DocumentNumber": string,
    "DocumentType": string,
    "AccountNumber": string,
    "PurchasingOrg": string,
    "PurchasingGroup": string,
    "DocumentDate": string,
    "CreatedBy": string,
    "CurrencyKey": string,
    "ItemNumber": string,
    "MaterialNumber": string,
    "Description": string,
    "Quantity": string,
    "MeasureUnit": string,
    "Price": string,
    "Plant": string,
    "ItemCategory": string,
};

export default async function (request: Request, response: Response): Promise<void> {

    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/PurchaseOrderSet?$format=json',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );

        let _POArray: PurchaseOrder[] = [];

        SAPresponse["data"]["d"]["results"].forEach((item: any) => {
            _POArray.push({
                "DocumentNumber": item?.["DocumentNumber"],
                "DocumentType": item["DocumentType"],
                "AccountNumber": item["AccountNumber"],
                "PurchasingOrg": item["PurchasingOrg"],
                "PurchasingGroup": item["PurchasingGroup"],
                "DocumentDate":  convertDateFromInt(item["DocumentDate"]),
                "CreatedBy": item["CreatedBy"],
                "CurrencyKey": item["CurrencyKey"],
                "ItemNumber": item["ItemNumber"],
                "MaterialNumber": item["MaterialNumber"],
                "Description": item["Description"],
                "Quantity": item["Quantity"],
                "MeasureUnit": item["MeasureUnit"],
                "Price": item["Price"],
                "Plant": item["Plant"],
                "ItemCategory": item["ItemCategory"],
            });
        });

        _POArray = _POArray.filter(item => {
            return item.AccountNumber === accountNumber;
        });

        response.status(200).json({ "data": _POArray });
    } catch (error: any) {
        response.status(500).json({ error: error });
    }

}