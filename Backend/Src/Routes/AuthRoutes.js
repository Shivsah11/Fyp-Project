/**
 * @file AuthRoutes.js
 * @description Authentication routing configuration. Contains signup, login, and password recovery endpoints.
 */

import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../Controllers/AuthController.js";

const router = express.Router();

// Registration and authentication endpoints
router.post("/signup", signup);
router.post("/login", login);

// Password recovery endpoints
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;

