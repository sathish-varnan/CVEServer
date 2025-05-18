import { Request, Response } from "express";
import LoginRequest from "../../types/loginRequest";

let dummyID = "0000000007";
let dummyPWD = "CorePath@123";

export default function (request: Request<{}, {}, LoginRequest>, response: Response) {
    console.log(request.body);
    const {id, password} = request.body;
    if (id === dummyID && password === dummyPWD) {
        response.json({"status": "success"});
    } else {
        response.json({"status": "failure"});
    }
    response.send({"status": "success"});
}