import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { webhook, cancelSubscription, resumeSubscription } from "../controllers/pay.controller.js";

const router = express.Router();

router.post('/webhook', webhook);
router.post('/cancel', authMiddleware, cancelSubscription);
router.post('/resume', authMiddleware, resumeSubscription);


export default router;