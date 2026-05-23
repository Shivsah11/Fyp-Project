/**
 * @file BookingRoutes.js
 * @description Express router configuration for property bookings. All routes require token authentication.
 */

import express from "express";
import { getLandlordBookings, updateBookingStatus, getTenantBookings, createBooking, getBookingById, completeBookingPayment } from "../Controllers/BookingController.js";
import { authenticateToken, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// Require JWT token authentication globally for all booking endpoints
router.use(authenticateToken);

// Landlord bookings retrieval; allowed for landlords and administrators
router.get("/landlord", authorizeRoles("landlord", "admin"), getLandlordBookings);

// Approve or reject a booking status; allowed for landlords and administrators
router.put("/:id/status", authorizeRoles("landlord", "admin"), updateBookingStatus);

// Tenant bookings list; allowed for tenants and administrators
router.get("/tenant", authorizeRoles("tenant", "admin"), getTenantBookings);

// Request a new booking; restricted to tenant role
router.post("/", authorizeRoles("tenant"), createBooking);

// View details for a single booking; open to the associated tenant, landlord, or administrators
router.get("/:id", authorizeRoles("tenant", "landlord", "admin"), getBookingById);

// Submit payment information to confirm booking; allowed for tenants and administrators
router.put("/:id/pay", authorizeRoles("tenant", "admin"), completeBookingPayment);

export default router;

