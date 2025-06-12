import { Router } from "express";
import loginHandler from "./login";
import profileDetailsHandler from "./profile";
import leaveRequest from "./leaveRequest";
import paySlip from "./paySlip";
import paySlipPDF from "./paySlipPDF";

const router = Router();

router.get("/login", loginHandler);
router.get("/profile", profileDetailsHandler);
router.get("/leave-request", leaveRequest);
router.get("/payslip", paySlip);
router.get("/payslip-pdf", paySlipPDF);

export default router;