import { Router } from "express";
import loginHandler from "./login";
import profileDetailsHandler from "./profile";
import leaveRequest from "./leaveRequest";
import paySlip from "./paySlip";
import paySlipPDF from "./paySlipPDF";
import email from "./email";

const router = Router();

router.get("/login", loginHandler);
router.get("/profile", profileDetailsHandler);
router.get("/leave-request", leaveRequest);
router.get("/payslip", paySlip);
router.get("/payslip-pdf", paySlipPDF);
router.get("/email", email);

export default router;