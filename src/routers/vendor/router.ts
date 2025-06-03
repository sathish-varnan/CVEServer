import { Router } from "express";
import login from "./login";
import profileDetails from "./profileDetails";
import purchaseOrder from "./purchaseOrder";
import requestForQuotation from "./requestForQuotation";
import goodsReceipt from "./goodsForReceipt";
import paymentAging from "./paymentAging";
import invoice from "./invoice";
import creditDebit from "./creditDebit";
import invoicePDF from "./invoicePdf";

const router = Router();

router.get("/login", login);
router.get("/profile", profileDetails);
router.get("/purchase-order", purchaseOrder);
router.get("/roq", requestForQuotation);
router.get("/goods-receipt", goodsReceipt);
router.get("/payment-aging", paymentAging);
router.get("/invoice", invoice);
router.get("/credit-debit", creditDebit);
router.get("/invoice-pdf", invoicePDF);

export default router;