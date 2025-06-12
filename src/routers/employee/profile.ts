import { Request, Response } from "express";
import axios from "axios";
import convert from "xml-js";

function getBody(employeeId: string){
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:YsvEmpProfile>
         <EmployeeId>${employeeId}</EmployeeId>
      </urn:YsvEmpProfile>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response): Promise<void> {
    const employeeId = request.query.employeeId as string;

    const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/ysv_emp_profile?sap-client=100';

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

        const employeeProfile = jsonResponse["soap-env:Envelope"]["soap-env:Body"]["n0:YsvEmpProfileResponse"]["ProfileDetails"];

        const _data = {
            "BirthPlace": employeeProfile?.BirthPlace?._text ?? '',
            "CompanyName": employeeProfile?.CompanyName?._text ?? '',
            "CostCenter": employeeProfile?.CostCenter?._text ?? '',
            "Country": employeeProfile?.Country?._text ?? '',
            "Dob": employeeProfile?.Dob?._text ?? '',
            "EmpId": employeeProfile?.EmpId?._text ?? '',
            "FirstName": employeeProfile?.FirstName?._text ?? '',
            "Gender": employeeProfile?.Gender?._text ?? '',
            "Job": employeeProfile?.Job?._text ?? '',
            "JobPosition": employeeProfile?.JobPosition?._text ?? '',
            "LastName": employeeProfile?.LastName?._text ?? '',
            "MaritalStatus": employeeProfile?.MaritalStatus?._text ?? '',
            "NameInitial": employeeProfile?.NameInitial?._text ?? '',
            "Nationality": employeeProfile?.Nationality?._text ?? '',
            "NickName": employeeProfile?.NickName?._text ?? '',
            "State": employeeProfile?.State?._text ?? '',
            "Title": employeeProfile?.Title?._text ?? '',
        };
        response.status(200).json(_data);
    } catch (error: any) {
        response.status(500).json({ error: error });
        return;
    }
}