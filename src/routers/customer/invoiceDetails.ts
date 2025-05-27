import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import InvoiceData from "../../types/invoiceData";

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusInvoiceData>
         <Kunnr>0000000003</Kunnr>
      </urn:ZsvCusInvoiceData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

interface rawInvoiceData {
    "Vbeln": { '_text': string },
    "Fkdat": { '_text': string },
    "Erdat": { '_text': string },
    "Kunrg": { '_text': string },
    "Fkart": { '_text': string },
    "Vkorg": { '_text': string },
    "Vtweg": { '_text': string },
    "Spart": { '_text': string },
    "Netwr": { '_text': string },
    "Waerk": { '_text': string },
    "Xblnr": { '_text': string },
    "Posnr": { '_text': string },
    "Matnr": { '_text': string },
    "Arktx": { '_text': string },
    "Fkimg": { '_text': string },
    "Vrkme": { '_text': string },
};


function formatInvoiceDetails(data: rawInvoiceData[]): InvoiceData[] {
    const array: InvoiceData[] = [];
        for (let element of data) {
            array.push({
                "Vbeln": element?.Vbeln?._text,
                "Fkdat": element?.Fkdat?._text,
                "Erdat": element?.Erdat?._text,
                "Kunrg": element?.Kunrg?._text,
                "Fkart": element?.Fkart?._text,
                "Vkorg": element?.Vkorg?._text,
                "Vtweg": element?.Vtweg?._text,
                "Spart": element?.Spart?._text,
                "Netwr": element?.Netwr?._text,
                "Waerk": element?.Waerk?._text,
                "Xblnr": element?.Xblnr?._text,
                "Posnr": element?.Posnr?._text,
                "Matnr": element?.Matnr?._text,
                "Arktx": element?.Arktx?._text,
                "Fkimg": element?.Fkimg?._text,
                "Vrkme": element?.Vrkme?._text,
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
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_invoice_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']["n0:ZsvCusInvoiceDataResponse"]["Invoice"]["item"];
        const formattedData = formatInvoiceDetails(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};
