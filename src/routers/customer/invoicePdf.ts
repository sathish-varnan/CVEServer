import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';

function getBody(document_number: string, item_number: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusInvoicePdf>
         <DocumentNumber>${document_number}</DocumentNumber>
         <ItemNumber>${item_number}</ItemNumber>
      </urn:ZsvCusInvoicePdf>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response) {
    const { document_number, item_number } = request.body;
    const auth: string = process.env.BASE || '';
    const requestBody = getBody(document_number, item_number);
    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_invoice_pdf?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const base64_string: string = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusInvoicePdfResponse']['PdfBase64String']?._text;
        const pdfBuffer = Buffer.from(base64_string, "base64");
        
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename=invoice_${document_number}_${item_number}.pdf`);
        response.send(pdfBuffer);
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};
