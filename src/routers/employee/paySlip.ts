import { Request, Response } from "express";
import axios from "axios";
import convert from "xml-js";

function getPayrollRequestBody(employeeId: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:YsvEmpPayroll>
         <EmployeeId>${employeeId}</EmployeeId>
      </urn:YsvEmpPayroll>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response): Promise<void> {
    const { employeeId } = request.query as {
        employeeId: string;
    };
    const auth: string = process.env.BASE || '';
    const requestBody = getPayrollRequestBody(employeeId);

    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/ysv_emp_payroll?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`,
                },
            }
        );

        const result: any = convert.xml2js(SAPresponse.data, { compact: true });
        const payslipItems =
            result['soap-env:Envelope']?.['soap-env:Body']?.['n0:YsvEmpPayrollResponse']?.['PayslipDetails']?.['item'];

        if (!payslipItems) {
            response.status(404).json({ error: "No payslip details found." });
        }

        // Normalize response to always return an array
        const payslips = Array.isArray(payslipItems) ? payslipItems : [payslipItems];

        const formattedPayslips = payslips.map((item: any) => ({
            EmpId: item.EmpId?._text,
            CompanyCode: item.CompanyCode?._text,
            CostCenter: item.CostCenter?._text,
            Stell: item.Stell?._text,
            Name: item.Name?._text,
            Gender: item.Gender?._text,
            Dob: item.Dob?._text,
            Nationality: item.Nationality?._text,
            PsGroup: item.PsGroup?._text,
            PsLevel: item.PsLevel?._text,
            Amount: item.Amount?._text,
            WageType: item.WageType?._text,
            CurrencyKey: item.CurrencyKey?._text,
            WorkingHours: item.WorkingHours?._text,
        }));
        response.status(200).json({ payslips: formattedPayslips });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
}
