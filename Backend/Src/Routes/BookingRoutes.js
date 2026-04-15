import express from "express";
import { getLandlordBookings, updateBookingStatus, getTenantBookings, createBooking, getBookingById, completeBookingPayment } from "../Controllers/BookingController.js";
import { authenticateToken, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// Require token for all booking routes
router.use(authenticateToken);

// Get bookings for the landlord
// Using authorizeRoles to ensure only Landlords and Admins can view landlord bookings
router.get("/landlord", authorizeRoles("Landlord", "Admin"), getLandlordBookings);

// Update booking status (approve/reject)
router.put("/:id/status", authorizeRoles("Landlord", "Admin"), updateBookingStatus);

// Get bookings for the logged-in tenant
router.get("/tenant", authorizeRoles("Tenant", "Admin"), getTenantBookings);

// Create a new booking
router.post("/", authorizeRoles("Tenant"), createBooking);

// Get a single booking by ID
router.get("/:id", authorizeRoles("Tenant", "Landlord", "Admin"), getBookingById);

// Complete payment for a booking
router.put("/:id/pay", authorizeRoles("Tenant", "Admin"), completeBookingPayment);

export default router;
