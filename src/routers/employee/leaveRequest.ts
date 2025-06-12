import { Request, Response } from "express";
import axios from "axios";
import convert from "xml-js";

function getBody(employeeId: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:YsvEmpLr>
         <EmployeeId>${employeeId}</EmployeeId>
      </urn:YsvEmpLr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response): Promise<void> {
    const employeeId = request.query.employeeId as string;

    const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/ysv_emp_lr?sap-client=100';

    try {
        const body = getBody(employeeId);

        const axiosResponse = await axios.post(
            url, 
            body, 
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${process.env.BASE}`
                },
            }
        );

        const xmlResponse = axiosResponse.data;
        const jsonResponse: any = convert.xml2js(xmlResponse, { compact: true });

        // Extract leave details array from the response
        const leaveDetails = jsonResponse["soap-env:Envelope"]["soap-env:Body"]["n0:YsvEmpLrResponse"]["LeaveDetails"]["item"];

        // Convert to cleaner JSON format
        const leaveRecords = Array.isArray(leaveDetails) 
            ? leaveDetails.map((item: any) => ({
                EmployeeId: item.EmpId?._text ?? '',
                StartDate: item.StartDate?._text ?? '',
                EndDate: item.EndDate?._text ?? '',
                LeaveType: item.AbType?._text ?? '',
                LeaveDays: item.AbDays?._text ?? '',
                Reason: item.Reason?._text ?? '',
                QuotaNumber: item.QuotaNumber?._text ?? '',
                StartDateQuota: item.StartDateQuota?._text ?? '',
                EndDateQuota: item.EndDateQuota?._text ?? ''
            }))
            : [{
                EmployeeId: leaveDetails.EmpId?._text ?? '',
                StartDate: leaveDetails.StartDate?._text ?? '',
                EndDate: leaveDetails.EndDate?._text ?? '',
                LeaveType: leaveDetails.AbType?._text ?? '',
                LeaveDays: leaveDetails.AbDays?._text ?? '',
                Reason: leaveDetails.Reason?._text ?? '',
                QuotaNumber: leaveDetails.QuotaNumber?._text ?? '',
                StartDateQuota: leaveDetails.StartDateQuota?._text ?? '',
                EndDateQuota: leaveDetails.EndDateQuota?._text ?? ''
            }];

        response.status(200).json(leaveRecords);

    } catch (error: any) {
        response.status(500).json({ error: error.message });
        return;
    }
}