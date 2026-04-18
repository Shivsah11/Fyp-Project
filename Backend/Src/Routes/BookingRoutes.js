import express from "express";
import { getLandlordBookings, updateBookingStatus, getTenantBookings, createBooking, getBookingById, completeBookingPayment } from "../Controllers/BookingController.js";
import { authenticateToken, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// Require token for all booking routes
router.use(authenticateToken);

// Get bookings for the landlord
// Using authorizeRoles to ensure only Landlords and Admins can view landlord bookings
router.get("/landlord", authorizeRoles("landlord", "admin"), getLandlordBookings);

// Update booking status (approve/reject)
router.put("/:id/status", authorizeRoles("landlord", "admin"), updateBookingStatus);

// Get bookings for the logged-in tenant
router.get("/tenant", authorizeRoles("tenant", "admin"), getTenantBookings);

// Create a new booking
router.post("/", authorizeRoles("tenant"), createBooking);

// Get a single booking by ID
router.get("/:id", authorizeRoles("tenant", "landlord", "admin"), getBookingById);

// Complete payment for a booking
router.put("/:id/pay", authorizeRoles("tenant", "admin"), completeBookingPayment);

export default router;
