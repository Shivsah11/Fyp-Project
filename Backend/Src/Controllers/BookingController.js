import Booking from "../Models/Booking.js";
import Property from "../Models/Property.js";
import Admin from "../Models/Admin.js";
import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import { createInternalNotification } from "./NotificationController.js";

// @desc    Get all bookings for a landlord's properties
// @route   GET /api/bookings/landlord
// @access  Private (Landlord/Admin)
export const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    console.log(`[BOOKING_REQUEST] Fetching bookings for landlord: ${landlordId}`);

    // 1. Find all properties owned by this landlord
    const properties = await Property.find({ landlordId });
    const propertyIds = properties.map((p) => p._id);

    // 2. Find all bookings for these properties or directly assigned to landlord, populate tenant and property info
    const bookings = await Booking.find({ 
      $or: [
        { propertyId: { $in: propertyIds } },
        { landlordId }
      ]
    })
      .populate('tenantId', 'firstName lastName email phone')
      .populate('propertyId', 'title type location amenities image images price')
      .sort({ createdAt: -1 });

    // 3. Format bookings for the frontend
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      tenantName: booking.tenantId ? `${booking.tenantId.firstName} ${booking.tenantId.lastName}` : 'Unknown Tenant',
      tenantId: booking.tenantId ? booking.tenantId._id : null,
      tenantEmail: booking.tenantId ? booking.tenantId.email : 'Unknown Email',
      tenantPhone: booking.tenantId ? booking.tenantId.phone : 'Unknown Phone',
      propertyName: booking.propertyId ? booking.propertyId.title : 'Unknown Property',
      propertyType: booking.propertyId ? booking.propertyId.type : 'Unknown Type',
      location: booking.propertyId ? booking.propertyId.location : 'Unknown Location',
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate || 'Not specified',
      price: (typeof booking.price === 'string' ? parseInt(booking.price.replace(/[^0-9]/g, "")) : (booking.price || 0)),
      totalAmount: (booking.totalAmount || (typeof booking.price === 'string' ? parseInt(booking.price.replace(/[^0-9]/g, "")) : (booking.price || 0))),
      status: booking.status || 'pending',
      paymentStatus: booking.paymentStatus ? booking.paymentStatus.toLowerCase() : 'pending',
      image: booking.propertyId?.image || (booking.propertyId?.images?.length > 0 ? booking.propertyId.images[0] : '/api/placeholder/300/200'),
      amenities: booking.propertyId?.amenities || [],
      requestDate: booking.createdAt,
      specialRequests: booking.specialRequests || '',
    }));

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching landlord bookings:", error);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
};

// @desc    Update a booking's status
// @route   PUT /api/bookings/:id/status
// @access  Private (Landlord/Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod, paymentAmount, paymentReference } = req.body;
    const landlordId = req.user.userId;

    if (status && !['pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Authorization check:
    // 1. Admin can do anything
    // 2. Landlord can update if they own the property
    // 3. Tenant can ONLY cancel their own booking
    const userRoleNormalized = req.user.role ? req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1).toLowerCase() : '';
    const isAdmin = userRoleNormalized === 'Admin';
    const isLandlord = userRoleNormalized === 'Landlord' && booking.propertyId.landlordId.toString() === landlordId.toString();
    const isTenant = userRoleNormalized === 'Tenant' && booking.tenantId.toString() === req.user.userId.toString();

    if (!isAdmin && !isLandlord && !isTenant) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    // Restriction: Tenants can ONLY set status to 'cancelled'
    if (isTenant && !isLandlord && !isAdmin && status !== 'cancelled') {
      return res.status(403).json({ message: "Tenants can only cancel their own bookings" });
    }

    if (status) {
      booking.status = status;
    }

    // Update payment fields if provided
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (paymentMethod) booking.paymentMethod = paymentMethod;
    if (paymentAmount) booking.paymentAmount = paymentAmount;
    if (paymentReference) booking.paymentReference = paymentReference;

    const updatedBooking = await booking.save();

    res.status(200).json({
      message: `Booking successfully updated`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error updating booking status" });
  }
};

// @desc    Get all bookings for the logged-in tenant
// @route   GET /api/bookings/tenant
// @access  Private (Tenant/Admin)
export const getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user.userId;
    console.log(`[BOOKING_REQUEST] Fetching bookings for tenant: ${tenantId}`);

    // Fetch bookings for this tenant, deep populate property AND its landlord
    const bookings = await Booking.find({ tenantId })
      .populate({
        path: 'propertyId',
        populate: {
          path: 'landlordId',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ createdAt: -1 });

    // Format for frontend interface
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      propertyName: booking.propertyId ? booking.propertyId.title : 'Unknown Property',
      propertyType: booking.propertyId ? booking.propertyId.type : 'Unknown Type',
      location: booking.propertyId ? booking.propertyId.location : 'Unknown Location',
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate || 'Not specified',
      status: booking.status.toLowerCase(), // Frontend expects lowercase
      price: (typeof booking.price === 'string' ? parseInt(booking.price.replace(/[^0-9]/g, "")) : (booking.price || 0)),
      totalAmount: (booking.totalAmount || (typeof booking.price === 'string' ? parseInt(booking.price.replace(/[^0-9]/g, "")) : (booking.price || 0))),
      paymentStatus: booking.paymentStatus ? booking.paymentStatus.toLowerCase() : 'pending',
      image: booking.propertyId?.image || (booking.propertyId?.images?.length > 0 ? booking.propertyId.images[0] : '/api/placeholder/300/200'),
      amenities: booking.propertyId?.amenities || [],
      landlord: booking.propertyId?.landlordId && booking.propertyId.landlordId.firstName
        ? `${booking.propertyId.landlordId.firstName} ${booking.propertyId.landlordId.lastName}`
        : 'Unknown Landlord',
      landlordId: booking.landlordId || (booking.propertyId?.landlordId
        ? (booking.propertyId.landlordId._id || booking.propertyId.landlordId)
        : null),
      landlordContact: booking.propertyId?.landlordId && booking.propertyId.landlordId.email
        ? `${booking.propertyId.landlordId.email} (${booking.propertyId.landlordId.phone || 'no phone'})`
        : 'Unknown Contact',
    }));

    res.status(200).json({
      success: true,
      message: "Tenant bookings fetched successfully",
      data: formattedBookings,
    });
  } catch (error) {
    console.error("[BOOKING_ERROR] Server error in getTenantBookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching your bookings",
      details: error.message
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Tenant)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;
    const tenantId = req.user.userId;

    if (!propertyId || !checkInDate) {
      return res.status(400).json({ success: false, message: "Property ID and Check-in Date are required" });
    }

    // Fetch the property to get landlordId and price
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Calculate total amount based on duration
    let totalAmount = 0;
    const basePrice = Number(typeof property.price === 'string' ? property.price.replace(/[^0-9]/g, '') : property.price);

    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (days <= 0) {
        totalAmount = basePrice;
      } else if (days <= 30) {
        totalAmount = basePrice;
      } else {
        const fullMonths = Math.floor(days / 30);
        const remainingDays = days % 30;
        const months = remainingDays > 15 ? fullMonths + 1 : fullMonths;
        totalAmount = basePrice * (months || 1);
      }
    } else {
      totalAmount = basePrice;
    }

    const newBooking = await Booking.create({
      propertyId,
      tenantId,
      landlordId: property.landlordId,
      checkInDate,
      checkOutDate: checkOutDate || '',
      price: property.price,
      totalAmount: totalAmount,
      numberOfGuests: numberOfGuests || 1,
      specialRequests: specialRequests || '',
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: new Date().toISOString()
    });

    // Notify Admin of new booking
    try {
      const admin = await Admin.findOne();
      if (admin) {
        await createInternalNotification({
          recipient: admin._id,
          recipientModel: 'Admin',
          title: "New Booking Request",
          message: `A new booking request has been created for ${property.title}.`,
          type: "info",
          bookingId: newBooking._id
        });
      }
    } catch (notiError) {
      console.error("Failed to notify admin of new booking:", notiError);
    }

    // Notify Landlord of new booking
    try {
      await createInternalNotification({
        recipient: property.landlordId,
        recipientModel: 'Landlord',
        title: "New Booking Request",
        message: `You have a new booking request for your property: ${property.title}.`,
        type: "info",
        bookingId: newBooking._id
      });
    } catch (notiError) {
      console.error("Failed to notify landlord of new booking:", notiError);
    }

    res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      data: newBooking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Server error creating booking request" });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Tenant/Landlord/Admin)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Authorization check
    const isAdmin = req.user.role === 'Admin';
    const isLandlord = req.user.role === 'Landlord' && booking.propertyId.landlordId.toString() === req.user.userId;
    const isTenant = req.user.role === 'Tenant' && booking.tenantId.toString() === req.user.userId;

    if (!isAdmin && !isLandlord && !isTenant) {
      return res.status(403).json({ success: false, message: "Not authorized to view this booking" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...booking._doc,
        id: booking._id,
        // Ensure totalAmount is calculated if not present
        totalAmount: booking.totalAmount || (typeof booking.price === 'string' ? parseInt(booking.price.replace(/[^0-9]/g, "")) : (booking.price || 0))
      }
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ success: false, message: "Server error fetching booking details" });
  }
};

// @desc    Complete payment for a booking
// @route   PUT /api/bookings/:id/pay
// @access  Private (Tenant/Admin)
export const completeBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, amount, paymentMethod } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Authorization: Only the tenant who made the booking or an admin
    if (req.user.role !== 'Admin' && booking.tenantId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to pay for this booking" });
    }

    // Update status to confirmed (booked) and paymentStatus to paid
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';

    // Optional: store payment details
    if (transactionId) booking.paymentReference = transactionId;
    if (amount) booking.paymentAmount = amount;
    if (paymentMethod) booking.paymentMethod = paymentMethod;

    await booking.save();

    // Notify Admin of payment completion
    try {
      const admin = await Admin.findOne();
      if (admin) {
        await createInternalNotification({
          recipient: admin._id,
          recipientModel: 'Admin',
          title: "Payment Received",
          message: `A payment of NPR ${amount || booking.totalAmount} has been received for booking ${booking._id}.`,
          type: "success",
          bookingId: booking._id
        });
      }
    } catch (notiError) {
      console.error("Failed to notify admin of payment:", notiError);
    }

    // Notify Landlord of payment completion
    try {
      await createInternalNotification({
        recipient: booking.landlordId,
        recipientModel: 'Landlord',
        title: "Booking Payment Confirmed",
        message: `Payment has been confirmed for your property booking at ${booking.propertyId.title || 'your property'}.`,
        type: "success",
        bookingId: booking._id
      });
    } catch (notiError) {
      console.error("Failed to notify landlord of payment:", notiError);
    }

    res.status(200).json({
      success: true,
      message: "Payment successfully recorded and booking confirmed",
      data: booking
    });
  } catch (error) {
    console.error("Error completing booking payment:", error);
    res.status(500).json({ success: false, message: "Server error completing payment" });
  }
};
