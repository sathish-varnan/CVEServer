import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import Payment from "../../types/paymentData";

interface RawPayment {
    "Mandt": { "_text": string };
    "Kunnr": { "_text": string };
    "Bukrs": { "_text": string };
    "Belnr": { "_text": string };
    "Gjahr": { "_text": string };
    "Buzei": { "_text": string };
    "Augbl": { "_text": string };
    "Wrbtr": { "_text": string };
    "Mwskz": { "_text": string };
    "Zfbdt": { "_text": string };
    "Vbeln": { "_text": string };
    "Budat": { "_text": string };
    "Bldat": { "_text": string };
    "Cpudt": { "_text": string };
    "Waers": { "_text": string };
    "Blart": { "_text": string };
    "Monat": { "_text": string };
};

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusPayAgeData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusPayAgeData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function getRemainingDays(start_date: string, end_date: string): string {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
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

function getFormattedData(data: RawPayment[]): Payment[] {
    const array: Payment[] = [];
    for (let element of data) {
        array.push({
            "Mandt": element?.Mandt?._text,
            "Kunnr": element?.Kunnr?._text,
            "Bukrs": element?.Bukrs?._text,
            "Belnr": element?.Belnr?._text,
            "Gjahr": element?.Gjahr?._text,
            "Buzei": element?.Buzei?._text,
            "Augbl": element?.Augbl?._text,
            "Wrbtr": element?.Wrbtr?._text,
            "Mwskz": element?.Mwskz?._text,
            "Zfbdt": element?.Zfbdt?._text,
            "Vbeln": element?.Vbeln?._text,
            "Budat": element?.Budat?._text,
            "Bldat": element?.Bldat?._text,
            "Cpudt": element?.Cpudt?._text,
            "Waers": element?.Waers?._text,
            "Blart": element?.Blart?._text,
            "Monat": element?.Monat?._text,
            "RemainingDays": getRemainingDays(element?.Bldat?._text ?? ``, element?.Zfbdt?._text),
        });
    }
    return array;
}

export default async function (request: Request, response: Response) {
    const {id} = request.body;
    const auth: string = process.env.BASE || '';
    const requestBody = getBody(id);

    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_pay_age_dat?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']["n0:ZsvCusPayAgeDataResponse"]["PayAgeData"]["item"];
        const formattedData = getFormattedData(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};