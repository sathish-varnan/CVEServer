import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import SalesOrderData from "../../types/salesOrderData";

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusSalesOrderData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusSalesOrderData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

interface rawSalesData {
    Vbeln: { _text: any; };
    Posnr: { _text: any; };
    Matnr: { _text: any; };
    Arktx: { _text: any; };
    Auart: { _text: any; };
    Erdat: { _text: any; };
    Kwmeng: { _text: any; };
    VdatuAna: { _text: any; };
    Bstnk: { _text: any; };
    Kunnr: { _text: any; };
    Vrkme: { _text: any; };
    Netwr: { _text: any; };
    Waerk: { _text: any; };
    Spart: { _text: any; };
    Gbstk: { _text: any; };
    Lfgsk: { _text: any; };
    Lgort: { _text: any; };
}

function getFormattedData(data: rawSalesData[]): SalesOrderData[] {
    const array: SalesOrderData[] = [];
    for (let element of data) {
        array.push({
            Vbeln: element?.Vbeln?._text ?? '',
            Posnr: element?.Posnr?._text ?? '',
            Matnr: element?.Matnr?._text ?? '',
            Arktx: element?.Arktx?._text ?? '',
            Auart: element?.Auart?._text ?? '',
            Erdat: element?.Erdat?._text ?? '',
            Kwmeng: element?.Kwmeng?._text ?? '',
            VdatuAna: element?.VdatuAna?._text ?? '',
            Bstnk: element?.Bstnk?._text ?? '',
            Kunnr: element?.Kunnr?._text ?? '',
            Vrkme: element?.Vrkme?._text ?? '',
            Netwr: element?.Netwr?._text ?? '',
            Waerk: element?.Waerk?._text ?? '',
            Spart: element?.Spart?._text ?? '',
            Gbstk: element?.Gbstk?._text ?? '',
            Lfgsk: element?.Lfgsk?._text ?? '',
            Lgort: element?.Lgort?._text ?? ''
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
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_sales_order_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusSalesOrderDataResponse']["SalesOrder"]["item"];
        const formattedData = getFormattedData(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};