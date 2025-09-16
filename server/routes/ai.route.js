import express from "express";
import { generateEmailTemplate, paraphraseText, generateDocTemplate, chatAI, getPastMessages } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { tokenTracker } from "../middlewares/tokenTracker.js";

const router = express.Router();

//CHAT ROUTE
router.post("/chat", authMiddleware, tokenTracker, chatAI);

//TEMPLATE GENERATED ROUTE
router.post("/generate-template", authMiddleware, tokenTracker, generateEmailTemplate);

//PARAPHRASE ROUTE 
router.post("/paraphrase", authMiddleware, tokenTracker, paraphraseText);

//GENERATE TEMPLATE ROUTE
router.post("/generate-doc-template", authMiddleware, tokenTracker, generateDocTemplate);

//GET PAST MESSAGES
router.get("/past-messages", authMiddleware, getPastMessages);


export default router;