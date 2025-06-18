import axios from "axios";
import { Request, Response } from "express";
import { convertDateFromInt } from "../../utils/date";

interface Invoice {
    "DocNumber": string,
    "FinancialYr": string,
    "DocDate": string,
    "CompanyCode": string,
    "RefDocNumber": string,
    "CurrKey": string,
    "Amount": string,
    "TaxAmount": string,
    "BaseDate": string,
    "AccountNumber": string,
    "DocItem": string,
    "PdocNumber": string,
    "ItemNumber": string,
    "MaterialNumber": string,
    "Plant": string,
    "TotalAmount": string,
    "Quantity": string,
    "Unit": string
};

export default async function (request: Request, response: Response): Promise<void> {
    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/InvoiceSet?$format=json',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );

        let _invoiceArray: Invoice[] = [];

        SAPresponse.data.d.results.forEach((item: any) => {
            _invoiceArray.push({
                "DocNumber": item?.DocNumber,
                "FinancialYr": item.FinancialYr,
                "DocDate": convertDateFromInt(item.DocDate),
                "CompanyCode": item.CompanyCode,
                "RefDocNumber": item.RefDocNumber,
                "CurrKey": item.CurrKey,
                "Amount": item.Amount,
                "TaxAmount": item.TaxAmount,
                "BaseDate": convertDateFromInt(item.BaseDate),
                "AccountNumber": item.AccountNumber,
                "DocItem": item.DocItem,
                "PdocNumber": item.PdocNumber,
                "ItemNumber": item.ItemNumber,
                "MaterialNumber": item.MaterialNumber,
                "Plant": item.Plant,
                "TotalAmount": item.TotalAmount,
                "Quantity": item.Quantity,
                "Unit": item.Unit
            });
        });

        if (accountNumber) {
            _invoiceArray = _invoiceArray.filter(item => {
                return item.AccountNumber === accountNumber;
            });
        }

        response.status(200).json({ "data": _invoiceArray });
    } catch (error: any) {
        response.status(500).json({ error: error });
    }
}