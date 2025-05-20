import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import DeliveryData from "../../types/listOfDeliveryData";

interface RawDelivery {
    "Vbeln": { "_text": string; },
    "Posnr": { "_text": string; },
    "Matnr": { "_text": string; },
    "Arktx": { "_text": string; },
    "Lfart": { "_text": string; },
    "Lfdat": { "_text": string; },
    "Kunnr": { "_text": string; },
    "Vrkme": { "_text": string; },
    "Lfimg": { "_text": string; },
    "Netwr": { "_text": string; },
    "Waerk": { "_text": string; },
    "Lgort": { "_text": string; },
    "Bestk": { "_text": string; },
    "Gbstk": { "_text": string; },
    "Vstel": { "_text": string; },
    "Werks": { "_text": string; }
}

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusDeliveryData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusDeliveryData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function getFormattedData(data: RawDelivery[]): DeliveryData[] {
    const array: DeliveryData[] = [];
    for (let element of data) {
        array.push({
            Vbeln: element?.Vbeln?._text ?? '',
            Posnr: element?.Posnr?._text ?? '',
            Matnr: element?.Matnr?._text ?? '',
            Arktx: element?.Arktx?._text ?? '',
            Lfart: element?.Lfart?._text ?? '',
            Lfdat: element?.Lfdat?._text ?? '',
            Kunnr: element?.Kunnr?._text ?? '',
            Vrkme: element?.Vrkme?._text ?? '',
            Lfimg: element?.Lfimg?._text ?? '',
            Netwr: element?.Netwr?._text ?? '',
            Waerk: element?.Waerk?._text ?? '',
            Lgort: element?.Lgort?._text ?? '',
            Bestk: element?.Bestk?._text ?? '',
            Vstel: element?.Vstel?._text ?? '',
            Werks: element?.Werks?._text ?? ''
        });
    }
    return array;
}

export default async function (request: Request, response: Response) {
    console.log("ListOfDeliveryDataHandler");
    const {id} = request.body;
    const auth: string = process.env.BASE || '';
    const requestBody = getBody(id);

    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_delivery_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']["n0:ZsvCusDeliveryDataResponse"]["DeliveryData"]["item"];
        const formattedData = getFormattedData(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};