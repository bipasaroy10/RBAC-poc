import { config } from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";

config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
