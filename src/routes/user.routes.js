import express from "express";
import { createUser, loginUser, getUserProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";


const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/profile", authenticate, getUserProfile);

export default router;
