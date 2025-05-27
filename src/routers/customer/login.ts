import { Request, Response } from "express";
import axios from "axios";
import convert from "xml-js";

function giveBody(id: string, password: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusLoginCheck>
         <Id>${id}</Id>
         <Password>${password}</Password>
      </urn:ZsvCusLoginCheck>
   </soapenv:Body>
</soapenv:Envelope>`
}

export default async function (request: Request, response: Response): Promise<void> {
    const {id, password} = request.body;
    const auth: string = process.env.BASE || '';
    const requestBody = giveBody(id, password);

    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_login_check?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const responseBody = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusLoginCheckResponse'];
        response.json({
            status: responseBody?.Status?._text || 'F',
            JWToken: ''
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
}