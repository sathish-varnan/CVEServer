import axios from "axios";
import { Request, Response } from "express";
import ROQ from "../../types/requestForQuotation";
import { convertDateFromInt } from "../../utils/date";

interface rawROQ {
    "__metadata": any;
    "Documentnumber": string;
    "Accountnumber": string;
    "Documenttype": string;
    "Purchasingorg": string;
    "Purchasinggroup": string;
    "Documentdate": string;
    "Createdby": string;
    "Itemnumber": string;
    "Materialnumber": string;
    "Description": string;
    "Quantity": string;
    "Measureunit": string;
    "Price": string;
    "Currencykey": string;
}

export default async function (request: Request, response: Response): Promise<void> {
    
    const { accountNumber } = request.query as {
        accountNumber?: string;
    };

    try {
        const SAPresponse = await axios.get(
            'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZSV_VENDOR_SERVICE_SRV/RequestForQuotationSet',
            {
                auth: {
                    username: process.env.SAP_USERNAME!,
                    password: process.env.SAP_PASSWORD!
                }
            }
        );
        
        let _ROQArray: ROQ[] = [];
        
        SAPresponse.data["d"]["results"].forEach((item: rawROQ) => {
            _ROQArray.push({
                "Documentnumber": item["Documentnumber"], 
                "Accountnumber": item["Accountnumber"], 
                "Documenttype": item["Documenttype"], 
                "Purchasingorg": item["Purchasingorg"], 
                "Purchasinggroup": item["Purchasinggroup"], 
                "Documentdate":  convertDateFromInt(item["Documentdate"]), 
                "Createdby": item["Createdby"], 
                "Itemnumber": item["Itemnumber"], 
                "Materialnumber": item["Materialnumber"], 
                "Description": item["Description"], 
                "Quantity": item["Quantity"], 
                "Measureunit": item["Measureunit"], 
                "Price": item["Price"], 
                "Currencykey": item["Currencykey"], 
            })
        });
        
        _ROQArray = _ROQArray.filter((item) => {
            return item.Accountnumber === accountNumber;
        });
        
        response.status(200).json({ data: _ROQArray });
    
    } catch (error: any) {
        response.status(500).json({ error: error});
    }
}