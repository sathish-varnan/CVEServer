import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import creditDebit from "../../types/creditDebit";

function getBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusCredDebData>
         <Kunnr>${id}</Kunnr>
      </urn:ZsvCusCredDebData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

interface rawCreditDebit {
    "Vbeln": { "_text": string };
    "Fkart": { "_text": string };
    "Fktyp": { "_text": string };
    "Vbtyp": { "_text": string };
    "Waerk": { "_text": string };
    "Vkorg": { "_text": string };
    "Kalsm": { "_text": string };
    "Knumv": { "_text": string };
    "Vsbed": { "_text": string };
    "Fkdat": { "_text": string };
    "Kurrf": { "_text": string };
    "Netwr": { "_text": string };
    "Erzet": { "_text": string };
    "Erdat": { "_text": string };
    "Stwae": { "_text": string };
    "BstnkF": { "_text": string };
    "Kunag": { "_text": string };
    "Arktx": { "_text": string };
    "Matnr": { "_text": string };
    "Posnr": { "_text": string };
    "Vrkme": { "_text": string };
};

function formatInquiryDetails(data: rawCreditDebit[]): creditDebit[] {
    const array: creditDebit[] = [];
    for (let element of data) {
        array.push({
            "Vbeln": element?.Vbeln?._text,
            "Fkart": element?.Fkart?._text,
            "Fktyp": element?.Fktyp?._text,
            "Vbtyp": element?.Vbtyp?._text,
            "Waerk": element?.Waerk?._text,
            "Vkorg": element?.Vkorg?._text,
            "Kalsm": element?.Kalsm?._text,
            "Knumv": element?.Knumv?._text,
            "Vsbed": element?.Vsbed?._text,
            "Fkdat": element?.Fkdat?._text,
            "Kurrf": element?.Kurrf?._text,
            "Netwr": element?.Netwr?._text,
            "Erzet": element?.Erzet?._text,
            "Erdat": element?.Erdat?._text,
            "Stwae": element?.Stwae?._text,
            "BstnkF": element?.BstnkF?._text,
            "Kunag": element?.Kunag?._text,
            "Arktx": element?.Arktx?._text,
            "Matnr": element?.Matnr?._text,
            "Posnr": element?.Posnr?._text,
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
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_cred_deb_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusCredDebDataResponse']['CredDebData']['item'];
        const formattedData = formatInquiryDetails(data);
        response.json({
            data: formattedData,
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};