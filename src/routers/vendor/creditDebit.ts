import axios from "axios";
import { Request, Response } from "express";
import { convertDateFromInt } from "../../utils/date";

interface CreditDebit {
    "CompanyCode": string,
    "LabelName": string,
    "Amount": string,
    "DocNumber": string,
    "FinancialYr": string,
    "ItemNumber": string,
    "GlAccNo": string,
    "PostingKey": string,
    "AccountNumber": string,
    "ClrDocNumber": string,
    "SpclGlEdn": string,
    "PostingDate": string,
    "DocDate": string,
    "DocCurr": string,
    "Name": string
};

export default async function (request: Request, response: Response): Promise<void> {
    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/CreditDebitSet?$format=json',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );

        let _creditDebitArray: CreditDebit[] = [];

        SAPresponse.data.d.results.forEach((item: any) => {
            _creditDebitArray.push({
                "CompanyCode": item.CompanyCode,
                "LabelName": item.LabelName,
                "Amount": item.Amount,
                "DocNumber": item.DocNumber,
                "FinancialYr": item.FinancialYr,
                "ItemNumber": item.ItemNumber,
                "GlAccNo": item.GlAccNo,
                "PostingKey": item.PostingKey,
                "AccountNumber": item.AccountNumber,
                "ClrDocNumber": item.ClrDocNumber,
                "SpclGlEdn": item.SpclGlEdn,
                "PostingDate": convertDateFromInt(item.PostingDate),
                "DocDate": convertDateFromInt(item.DocDate),
                "DocCurr": item.DocCurr,
                "Name": item.Name
            });
        });

        if (accountNumber) {
            _creditDebitArray = _creditDebitArray.filter(item => {
                return item.AccountNumber === accountNumber;
            });
        }

        response.status(200).json({ "data": _creditDebitArray });
    } catch (error: any) {
        console.log("Error: ", error);
        response.status(500).json({ error: error });
    }
}