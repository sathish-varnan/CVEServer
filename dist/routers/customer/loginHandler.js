"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
let dummyID = "0000000007";
let dummyPWD = "CorePath@123";
function default_1(request, response) {
    console.log(request.body);
    const { id, password } = request.body;
    if (id === dummyID && password === dummyPWD) {
        response.json({ "status": "success" });
    }
    else {
        response.json({ "status": "failure" });
    }
    response.send({ "status": "success" });
}
