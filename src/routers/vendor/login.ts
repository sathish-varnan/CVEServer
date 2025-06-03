import axios from "axios";
import { Request, Response } from "express";

export default async function (request: Request, response: Response): Promise<void> {
    const { accountNumber, password } = request.query as {
        accountNumber?: string;
        password?: string;
    };
    const auth: string = process.env.BASE || '';

    console.log(accountNumber, password);

    try {
        const SAPresponse = await axios.get(
            `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/VendorSet('${accountNumber}')`,
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );
        const _accountNumber = SAPresponse.data["d"]["AccountNumber"];
        const _password = SAPresponse.data["d"]["Password"];

        if (_accountNumber === accountNumber && _password === password) {
            response.json({ status: "SUCCESS"});
        } else {
            response.json({status: "Failure"});
        }
    } catch (error: any) {
        console.log("SAP error: ", error);
        response.json({ status: "Failure"});
    }
}