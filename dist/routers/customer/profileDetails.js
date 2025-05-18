"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
let dummyDetails = {
    customerID: 7,
    countryKey: "IN",
    firstName: "CorePath",
    city: "Chennai",
    postalCode: "600 063",
    landmark: "Mudichur"
};
function default_1(request, response) {
    response.json(dummyDetails);
}
