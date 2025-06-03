import axios from "axios";
import { Request, Response } from "express";
import vendorProfile from "../../types/vendorProfile";

export default async function (request: Request, response: Response): Promise<void> {
    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    console.log(accountNumber);

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
        const _profile: vendorProfile = {
            "AccountNumber": SAPresponse.data["d"]["AccountNumber"],
            "Password": SAPresponse.data["d"]["Password"],
            "CountryKey": SAPresponse.data["d"]["CountryKey"],
            "Name": SAPresponse.data["d"]["Name"],
            "City": SAPresponse.data["d"]["City"],
            "PostalCode": SAPresponse.data["d"]["PostalCode"],
            "Region": SAPresponse.data["d"]["Region"],
            "SortField": SAPresponse.data["d"]["SortField"],
            "AddressPrefix": SAPresponse.data["d"]["AddressPrefix"],
            "AccountGroup": SAPresponse.data["d"]["AccountGroup"]
        };
        response.json({ data: _profile});
    } catch (error: any) {
        console.log("SAP error: ", error);
        response.status(500).json({ data: "Nothing" });
    }
}