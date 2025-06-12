import { Request, Response } from "express";
import axios from "axios";
import convert from 'xml-js';

function getBody(employeeId: string, password: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:YsvEmpLogin>
         <EmployeeId>${employeeId}</EmployeeId>
         <Password>${password}</Password>
      </urn:YsvEmpLogin>
   </soapenv:Body>
</soapenv:Envelope>`
}

export default async function (request: Request, response: Response): Promise<void> {
    const employeeId = request.query.employeeId as string;
    const password = request.query.password as string;
    const auth: string = process.env.BASE || '';
    const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/ysv_emp_login?sap-client=100`;

    try {
        const axiosResponse = await axios.post(
        url,
        getBody(employeeId, password), 
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                },
                headers: {
                    'Content-Type': 'text/xml; charset=UTF-8',
                }
            }
        );

        const xmlResponse = axiosResponse.data;
        const jsonResponse: any = convert.xml2js(xmlResponse, {compact: true});

        const result = jsonResponse['soap-env:Envelope']['soap-env:Body']['n0:YsvEmpLoginResponse']['Status'];

        response.status(200).json({
            status: (result._text === 'S'? 'SUCCESS' : 'Failed'),
        });

    } catch (error: any) { 
        console.error(error);
        response.status(500).send({ error: `Error fetching data from SAP, ${error}` });
        return;
    }

}