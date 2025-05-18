import { Router } from "express";
import loginHandler from "./loginHandler";

const router = Router();

router.post('/login', loginHandler);

export default router;