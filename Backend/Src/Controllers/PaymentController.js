import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";
import Property from "../Models/Property.js";
import Tenant from "../Models/Tenant.js";

export const recordPayment = async (req, res) => {
  try {
    const { amount, method, description, transactionId } = req.body;
    const userId = req.user.userId;

    console.log("Recording payment request:", { amount, method, description, transactionId, userId });

    if (!amount || !method || !description) {
      console.log("Validation failed: Missing fields", { amount, method, description });
      return res.status(400).json({ message: "Missing required payment fields: amount, method, or description" });
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      console.log("Validation failed: Invalid amount", { amount });
      return res.status(400).json({ message: "Invalid payment amount: must be a number" });
    }

    const newPayment = new Payment({
      tenantId: userId,
      amount: amountNum,
      method,
      description,
      status: 'completed', // For mock integration, we assume success
      date: new Date().toISOString().split('T')[0]
    });

    console.log("Saving new payment record:", newPayment);
    await newPayment.save();
    console.log("Payment saved successfully");

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: newPayment
    });
  } catch (error) {
    console.error("Critical: Record payment database error:", error);
    res.status(500).json({ 
      message: "Server database error recording payment",
      details: error.message 
    });
  }
};

export const getLandlordPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching payments for landlord:", userId);
    
    // Get all bookings for this landlord's properties
    const landlordBookings = await Booking.find({ landlordId: userId });
    console.log("Found landlord bookings:", landlordBookings.length);
    
    if (landlordBookings.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No bookings found for this landlord"
      });
    }
    
    // Get all payments without populate first to avoid reference errors
    const payments = await Payment.find({});
    console.log("Total payments in database:", payments.length);
    
    // Filter payments to only include those from landlord's tenants
    const landlordPayments = payments.filter(payment => {
      return landlordBookings.some(booking => 
        booking.tenantId.toString() === payment.tenantId.toString()
      );
    });
    
    console.log("Filtered landlord payments:", landlordPayments.length);
    
    // Get property details for each booking
    const propertyIds = landlordBookings.map(booking => booking.propertyId);
    const properties = await Property.find({ _id: { $in: propertyIds } });
    
    // Try to populate tenant information safely
    const populatedPayments = await Promise.all(
      landlordPayments.map(async (payment) => {
        try {
          // Try to populate tenant info
          const populatedPayment = await Payment.findById(payment._id)
            .populate('tenantId', 'firstName lastName email')
            .lean();
          
          // Find the booking and property for this payment
          const booking = landlordBookings.find(b => 
            b.tenantId.toString() === payment.tenantId.toString()
          );
          const property = properties.find(p => 
            booking && p._id.toString() === booking.propertyId.toString()
          );
          
          return {
            id: payment._id,
            tenantName: populatedPayment?.tenantId 
              ? `${populatedPayment.tenantId.firstName} ${populatedPayment.tenantId.lastName}`
              : 'Unknown Tenant',
            tenantEmail: populatedPayment?.tenantId?.email || 'unknown@example.com',
            propertyName: property ? property.title : 'Unknown Property',
            propertyLocation: property ? property.location : 'Unknown Location',
            amount: payment.amount,
            method: payment.method,
            date: payment.date,
            status: payment.status,
            description: payment.description,
            bookingId: booking ? booking._id : null,
            createdAt: payment.createdAt
          };
        } catch (err) {
          console.error("Error populating payment:", payment._id, err);
          // Return basic payment info if populate fails
          const booking = landlordBookings.find(b => 
            b.tenantId.toString() === payment.tenantId.toString()
          );
          const property = properties.find(p => 
            booking && p._id.toString() === booking.propertyId.toString()
          );
          
          return {
            id: payment._id,
            tenantName: 'Unknown Tenant',
            tenantEmail: 'unknown@example.com',
            propertyName: property ? property.title : 'Unknown Property',
            propertyLocation: property ? property.location : 'Unknown Location',
            amount: payment.amount,
            method: payment.method,
            date: payment.date,
            status: payment.status,
            description: payment.description,
            bookingId: booking ? booking._id : null,
            createdAt: payment.createdAt
          };
        }
      })
    );
    
    // Sort by date (newest first)
    populatedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("Final formatted payments:", populatedPayments.length);
    
    res.status(200).json({
      success: true,
      data: populatedPayments,
      count: populatedPayments.length
    });
  } catch (error) {
    console.error("Error fetching landlord payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    
    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'completed' or 'failed'"
      });
    }
    
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    ).populate('tenantId', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Payment ${status} successfully`,
      data: payment
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
};
