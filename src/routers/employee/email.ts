import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';
import nodemail from 'nodemailer';

async function sendMail(pdf: Buffer, id: string) {
    const transporter = nodemail.createTransport({
        secure: true,
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'sathish.kaartech@gmail.com',
            pass: 'orfrvpqokqmygtdn'
        }
    });

    const mailOptions = {
        from: 'sathish.kaartech@gmail.com', // Sender address
        to: 'varnan.sathish@gmail.com',    // List of recipients
        subject: `PaySlip of ${id}`,       // Subject line
        text: `Please find attached the payslip for employee ${id}.`, // Plain text body
        attachments: [
            {
                filename: `payslip_${id}.pdf`, // Name of the attachment
                content: pdf,                   // Buffer containing the PDF
                contentType: 'application/pdf'  // MIME type
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

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
        await sendMail(pdfBuffer, employee_id);
        response.status(201).json({ message: "Email sent" });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
};