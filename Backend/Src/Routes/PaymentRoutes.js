import express from "express";
import { authenticateToken } from "../Middleware/Auth.js";
import { recordPayment, getLandlordPayments, updatePaymentStatus } from "../Controllers/PaymentController.js";

const router = express.Router();

// Record a new payment (for tenants)
router.post("/", authenticateToken, recordPayment);

// Get all payments for landlord
router.get("/landlord", authenticateToken, getLandlordPayments);

// Update payment status (for landlord)
router.put("/:paymentId/status", authenticateToken, updatePaymentStatus);

export default router;
