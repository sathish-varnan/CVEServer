import { Request, Response } from "express";
import { CustomerProfile } from "../../types/customerProfile";
import axios from "axios";
import convert from 'xml-js';


function giveBody(id: string) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZsvCusProfileData>
         <Id>${id}</Id>
      </urn:ZsvCusProfileData>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export default async function (request: Request, response: Response) {
    console.log("profileDetailsHandler");
    console.log(request.body);
    const { id } = request.body;
    const auth: string = process.env.BASE || '';
    const requestBody = giveBody(id);

    try {
        const SAPresponse = await axios.post(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsv_cus_profile_data?sap-client=100',
            requestBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Basic ${auth}`
                },
            }
        );
        const result:any = convert.xml2js(SAPresponse.data, { compact: true });
        const data = result['soap-env:Envelope']['soap-env:Body']['n0:ZsvCusProfileDataResponse']['Data'];
        const profileData: CustomerProfile = {
            customerID: data?.Kunnr?._text ?? '',
            countryKey: data?.Land1?._text ?? '',
            firstName: data?.Name1?._text ?? '',
            city: data?.Ort01?._text ?? '',
            postalCode: data?.Pstlz?._text ?? '',
            landmark: data?.Stras?._text ?? '',
            region: data?.Regio?._text ?? '',
            phone: data?.Telf1?._text ?? ''
        }
        console.log(profileData);
        response.json({
            details: profileData
        });
    } catch (error: any) {
        response.status(500).json({ error: "SAP error", detail: error.message });
    }
}