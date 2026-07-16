import { config } from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";


config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json());

import userRoutes from "./routes/user.routes.js";

// Register routes
app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
