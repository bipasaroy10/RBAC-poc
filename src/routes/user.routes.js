import express from "express";
import { createUser, loginUser, getAllUsers, getUserById  } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/getUsers", authenticate, authorizeRoles("superadmin", "admin"), getAllUsers);
router.get("/profile/:id", authenticate, getUserById);

export default router;
