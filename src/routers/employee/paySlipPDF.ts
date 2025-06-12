import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';

function getBody(employeeId: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:YsvEmpPayrollPdf>
         <EmployeeId>${employeeId}</EmployeeId>
      </urn:YsvEmpPayrollPdf>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response) {
    const employee_id = request.query.employeeId as string;
    const auth: string = process.env.BASE || '';
    const requestBody = getBody(employee_id);
    
    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/ysv_emp_payroll_pdf?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        
        const result: any = convert.xml2js(SAPresponse.data, { compact: true });
        const base64_string: string = result['soap-env:Envelope']['soap-env:Body']['n0:YsvEmpPayrollPdfResponse']['PayslipPdf']?._text;
        const pdfBuffer = Buffer.from(base64_string, "base64");
        
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename=payroll_${employee_id}.pdf`);
        response.send(pdfBuffer);
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};