import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../Controllers/AuthController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
