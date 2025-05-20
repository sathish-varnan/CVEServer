import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import InquiryData from "../../types/inquiryData";

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusInquiryData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusInquiryData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

interface rawInquiryData { 
    Kunnr: { _text: any; }; 
    Erdat: { _text: any; }; 
    Auart: { _text: any; }; 
    Angdt: { _text: any; }; 
    Bnddt: { _text: any; }; 
    Vbeln: { _text: any; }; 
    Posnr: { _text: any; }; 
    Netwr: { _text: any; }; 
    Waerk: { _text: any; }; 
    Arktx: { _text: any; }; 
    Posar: { _text: any; }; 
    Vrkme: { _text: any; }; 
    Kwmeng: { _text: any; }; 
};

function formatInquiryDetails(data: rawInquiryData[]): InquiryData[] {
    const array: InquiryData[] = [];
    for (let element of data) {
        array.push({
            Kunnr: element?.Kunnr?._text ?? '',
            Erdat: element?.Erdat?._text ?? '',
            Auart: element?.Auart?._text ?? '',
            Angdt: element?.Angdt?._text ?? '',
            Bnddt: element?.Bnddt?._text ?? '',
            Vbeln: element?.Vbeln?._text ?? '',
            Posnr: element?.Posnr?._text ?? '',
            Netwr: element?.Netwr?._text ?? '',
            Waerk: element?.Waerk?._text ?? '',
            Arktx: element?.Arktx?._text ?? '',
            Posar: element?.Posar?._text ?? '',
            Vrkme: element?.Vrkme?._text ?? '',
            Kwmeng: element?.Kwmeng?._text ?? '',
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
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_inquiry_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusInquiryDataResponse']['InquiryData']['item'];
        const formattedData = formatInquiryDetails(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};