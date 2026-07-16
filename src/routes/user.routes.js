import express from "express";
import { createUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser, logoutUser, verifyOTP, } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/verify-otp", verifyOTP);
router.get("/getUsers", authenticate, authorizeRoles("superadmin", "admin"), getAllUsers);
router.get("/profile/:id", authenticate, getUserById);
router.put("/update/:id", authenticate, authorizeRoles("superadmin", "admin" ), updateUser);
router.delete("/delete/:id", authenticate, deleteUser);


export default router;
