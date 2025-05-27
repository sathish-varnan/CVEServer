import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import SalesSummary from "../../types/salesSummary";

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusSalesSummaryData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusSalesSummaryData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

interface rawSalesSummary {
    "Vbeln": { "_text": string },
    "Audat": { "_text": string },
    "Kunnr": { "_text": string },
    "Vkorg": { "_text": string },
    "Vtweg": { "_text": string },
    "Spart": { "_text": string },
    "Netwr": { "_text": string },
    "Waerk": { "_text": string },
    "Vkbur": { "_text": string },
    "Vkgrp": { "_text": string },
    "Bstnk": { "_text": string },
    "Matnr": { "_text": string },
    "Arktx": { "_text": string },
    "Kwmeng": { "_text": string },
    "Vrkme": { "_text": string },
    "Pstyv": { "_text": string },
    "Posex": { "_text": string }
};

function getFormattedData(data: rawSalesSummary[]): SalesSummary[] {
    const array: SalesSummary[] = [];
    for (let element of data) {
        array.push({
            "Vbeln": element?.Vbeln?._text,
            "Audat": element?.Audat?._text,
            "Kunnr": element?.Kunnr?._text,
            "Vkorg": element?.Vkorg?._text,
            "Vtweg": element?.Vtweg?._text,
            "Spart": element?.Spart?._text,
            "Netwr": element?.Netwr?._text,
            "Waerk": element?.Waerk?._text,
            "Vkbur": element?.Vkbur?._text,
            "Vkgrp": element?.Vkgrp?._text,
            "Bstnk": element?.Bstnk?._text,
            "Matnr": element?.Matnr?._text,
            "Arktx": element?.Arktx?._text,
            "Kwmeng": element?.Kwmeng?._text,
            "Vrkme": element?.Vrkme?._text,
            "Pstyv": element?.Pstyv?._text,
            "Posex": element?.Posex?._text
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
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_sales_summary_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusSalesSummaryDataResponse']["SalesSummary"]["item"];
        const formattedData = getFormattedData(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};