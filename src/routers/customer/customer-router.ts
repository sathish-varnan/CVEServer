import { Router } from "express";
import loginHandler from "./login";
import profileDetailsHandler from "./profileDetails";
import inquiryDataHandler from "./inquiryData";
import salesOrderDataHandler from "./salesOrderData";

const router = Router();

router.post('/login', loginHandler);
router.post('/profile', profileDetailsHandler);
router.post('/inquiry', inquiryDataHandler);
router.post('/sales-order', salesOrderDataHandler);

export default router;