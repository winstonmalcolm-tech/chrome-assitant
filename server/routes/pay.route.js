import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { webhook } from "../controllers/pay.controller.js";

const router = express.Router();



router.post('/webhook', webhook);



export default router;