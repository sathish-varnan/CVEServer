import { Router } from "express";
import loginHandler from "./login";
import profileDetailsHandler from "./profileDetails";
import inquiryDataHandler from "./inquiryData";
import salesOrderDataHandler from "./salesOrderData";
import listOfDeliveryHandler from "./listOfDelivery";
import creditDebitData from "./creditDebitData";
import salesSummary from "./salesSummary";

const router = Router();

router.post('/login', loginHandler);
router.post('/profile', profileDetailsHandler);
router.post('/inquiry', inquiryDataHandler);
router.post('/sales-order', salesOrderDataHandler);
router.post('/list-of-delivery', listOfDeliveryHandler);
router.post('/credit-debit-memo', creditDebitData);
router.post('/sales-summary', salesSummary);

export default router;