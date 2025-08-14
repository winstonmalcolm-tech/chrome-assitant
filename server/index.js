import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";

//Routes
import AIRoutes from "./routes/aiRoutes.js";
import TempleteGeneratorRoutes from "./routes/templateGeneratorRoutes.js";

const app = express();
app.use(cors())

app.use(express.json());


app.use("/ai", AIRoutes);
app.use("/template", TempleteGeneratorRoutes);


console.log('Loaded API Key in index:', process.env.GEMINI_API_KEY);
app.listen(process.env.PORT, () => {
  console.log("Server running on PORT ", process.env.PORT);
})