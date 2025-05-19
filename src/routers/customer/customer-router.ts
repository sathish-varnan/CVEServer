import { Router } from "express";
import loginHandler from "./login";
import profileDetailsHandler from "./profileDetails";
import inquiryDataHandler from "./inquiryData";

const router = Router();

router.post('/login', loginHandler);
router.post('/profile', profileDetailsHandler);
router.post('/inquiry', inquiryDataHandler);

export default router;