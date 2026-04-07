import Booking from "../Models/Booking.js";
import Property from "../Models/Property.js";

// @desc    Get all bookings for a landlord's properties
// @route   GET /api/bookings/landlord
// @access  Private (Landlord/Admin)
export const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user.userId;

    // 1. Find all properties owned by this landlord
    const properties = await Property.find({ landlordId });
    const propertyIds = properties.map((p) => p._id);

    // 2. Find all bookings for these properties, populate tenant and property info
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('tenantId', 'firstName lastName email phone')
      .populate('propertyId', 'title type location amenities image')
      .sort({ createdAt: -1 });

    // 3. Format bookings for the frontend
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      tenantName: booking.tenantId ? `${booking.tenantId.firstName} ${booking.tenantId.lastName}` : 'Unknown Tenant',
      tenantEmail: booking.tenantId ? booking.tenantId.email : 'Unknown Email',
      tenantPhone: booking.tenantId ? booking.tenantId.phone : 'Unknown Phone',
      propertyName: booking.propertyId ? booking.propertyId.title : 'Unknown Property',
      propertyType: booking.propertyId ? booking.propertyId.type : 'Unknown Type',
      location: booking.propertyId ? booking.propertyId.location : 'Unknown Location',
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate || 'Not specified',
      status: booking.status.toLowerCase(), // Frontend expects lowercase
      price: parseInt(booking.price.replace(/[^0-9]/g, "")) || 0, // Parse price as number
      paymentStatus: booking.paymentStatus ? booking.paymentStatus.toLowerCase() : 'pending',
      image: booking.propertyId?.image || '/api/placeholder/300/200',
      amenities: booking.propertyId?.amenities || [],
      requestDate: booking.createdAt,
      specialRequests: booking.specialRequests || '',
    }));

    res.status(200).json({
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
    const { status } = req.body; // e.g., 'confirmed' or 'cancelled'
    const landlordId = req.user.userId;

    if (!['pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify the logged-in landlord owns the property associated with the booking
    // Support admins overriding this by checking user role if necessary, but right now ensuring landlordId matches
    if (booking.propertyId.landlordId.toString() !== landlordId.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json({
      message: `Booking successfully ${status.toLowerCase()}`,
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
      price: parseInt(booking.price.replace(/[^0-9]/g, "")) || 0,
      paymentStatus: booking.paymentStatus ? booking.paymentStatus.toLowerCase() : 'pending',
      image: booking.propertyId?.image || '/api/placeholder/300/200',
      amenities: booking.propertyId?.amenities || [],
      landlord: booking.propertyId?.landlordId 
        ? `${booking.propertyId.landlordId.firstName} ${booking.propertyId.landlordId.lastName}` 
        : 'Unknown Landlord',
      landlordContact: booking.propertyId?.landlordId 
        ? `${booking.propertyId.landlordId.email} (${booking.propertyId.landlordId.phone || 'no phone'})` 
        : 'Unknown Contact',
    }));

    res.status(200).json({
      success: true,
      message: "Tenant bookings fetched successfully",
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching tenant bookings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching your bookings" 
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

    const newBooking = await Booking.create({
      propertyId,
      tenantId,
      landlordId: property.landlordId,
      checkInDate,
      checkOutDate: checkOutDate || '',
      price: property.price,
      numberOfGuests: numberOfGuests || 1,
      specialRequests: specialRequests || '',
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: new Date().toISOString()
    });

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
