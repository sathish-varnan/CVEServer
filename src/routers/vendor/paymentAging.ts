import axios from "axios";
import { Request, Response } from "express";
import { convertDateFromInt } from "../../utils/date";

interface PaymentAging {
    "DocNumber": string,
    "CompanyCode": string,
    "FinancialYr": string,
    "PostingDate": string,
    "DocDate": string,
    "DocType": string,
    "Creator": string,
    "Amount": string,
    "TermsCondt": string,
    "ClrDocNo": string,
    "RefDocNo": string,
    "ItemNumber": string,
    "Supplier": string,
    "CurrKey": string,
    "RemainingDays": string
};

function getRemainingDays(start_date: string, end_date: string): string {

    const startDate = new Date(start_date);
    const endDate = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "Invalid date format. Please use YYYY-MM-DD";
    }
    
    const diffInMs = endDate.getTime() - startDate.getTime();

    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
        return `${Math.abs(diffInDays)} days ago`;
    }

    if (diffInDays === 0) {
        return "Today is the end date";
    }
    
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} remaining`;
}

export default async function (request: Request, response: Response): Promise<void> {
    const { supplier } = request.query as {
        supplier?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/PaymentAgingSet?$format=json',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );

        let _paymentAgingArray: PaymentAging[] = [];

        SAPresponse.data.d.results.forEach((item: any) => {
            _paymentAgingArray.push({
                "DocNumber": item?.DocNumber,
                "CompanyCode": item.CompanyCode,
                "FinancialYr": item.FinancialYr,
                "PostingDate": convertDateFromInt(item.PostingDate),
                "DocDate": convertDateFromInt(item.DocDate),
                "DocType": item.DocType,
                "Creator": item.Creator,
                "Amount": item.Amount,
                "TermsCondt": item.TermsCondt,
                "ClrDocNo": item.ClrDocNo,
                "RefDocNo": item.RefDocNo,
                "ItemNumber": item.ItemNumber,
                "Supplier": item.Supplier,
                "CurrKey": item.CurrKey,
                "RemainingDays": getRemainingDays(convertDateFromInt(item.DocDate), new Date().toISOString().split('T')[0])
            });
        });

        if (supplier) {
            _paymentAgingArray = _paymentAgingArray.filter(item => {
                return item.Supplier === supplier;
            });
        }

        response.status(200).json({ "data": _paymentAgingArray });
    } catch (error: any) {
        response.status(500).json({ error: error });
    }
}