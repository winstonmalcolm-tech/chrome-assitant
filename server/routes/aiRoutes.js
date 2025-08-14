import express from "express";
import { generateTemplate, paraphraseText, citeUrl } from "../controllers/aiControllers.js";

const router = express.Router();


//TEMPLATE GENERATED ROUTE
router.post("/generate-template", generateTemplate);

//PARAPHRASE ROUTE 
router.post("/paraphrase", paraphraseText);


export default router;