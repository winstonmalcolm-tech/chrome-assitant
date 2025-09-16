import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";

//Routes
import AIRoutes from "./routes/ai.route.js";
import AuthRoutes from "./routes/auth.route.js";
import PayRoutes from "./routes/pay.route.js";

//Middlewares
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(cors())

app.use(express.json());


app.use("/ai", AIRoutes);
app.use("/auth", AuthRoutes);
app.use("/pay", PayRoutes);

app.use(errorHandler);

console.log('Loaded API Key in index:', process.env.GEMINI_API_KEY);
app.listen(process.env.PORT, () => {
  console.log("Server running on PORT ", process.env.PORT);
})