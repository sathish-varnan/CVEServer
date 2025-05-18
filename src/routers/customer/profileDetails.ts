import { Request, Response } from "express";
import { CustomerProfile } from "../../types/customerProfile";

let dummyDetails: CustomerProfile = {
    customerID: 7,
    countryKey: "IN",
    firstName: "CorePath",
    city: "Chennai",
    postalCode: "600 063",
    landmark: "Mudichur"
};

export default function (request: Request, response: Response) {
    response.json(dummyDetails);
}