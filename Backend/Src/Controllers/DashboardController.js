import mongoose from "mongoose";
import User from "../Models/User.js";
import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";
import Property from "../Models/Property.js";
import Booking from "../Models/Booking.js";
import Payment from "../Models/Payment.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // 1. Find the user in collections
    let user = await Tenant.findById(userId).select('-password');
    if (!user) user = await Landlord.findById(userId).select('-password');
    if (!user) user = await Admin.findById(userId).select('-password');
    if (!user) user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- Legacy Support: Generate referral code if missing ---
    if (!user.referralCode) {
      user.referralCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    // --- ADMIN DASHBOARD ---
    if (userRole === 'Admin') {
      const [totalUsers, totalTenants, totalLandlords, totalProperties, totalBookings, totalPayments] = await Promise.all([
        User.countDocuments() + Tenant.countDocuments() + Landlord.countDocuments() + Admin.countDocuments(),
        Tenant.countDocuments(),
        Landlord.countDocuments(),
        Property.countDocuments(),
        Booking.countDocuments(),
        Payment.find()
      ]);

      const totalRevenue = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role');

      return res.status(200).json({
        success: true,
        message: "Admin dashboard data retrieved",
        data: {
          user,
          stats: {
            totalUsers,
            totalTenants,
            totalLandlords,
            totalProperties,
            totalBookings,
            totalRevenue
          },
          recentUsers,
          recommendedRooms: await Property.find().sort({ rating: -1 }).limit(4) // Admins see highest rated
        }
      });
    }

    // --- LANDLORD DASHBOARD ---
    if (userRole === 'Landlord') {
      const landlordProperties = await Property.find({ landlordId: userId });
      const propertyIds = landlordProperties.map(p => p._id);

      const allBookings = await Booking.find({ propertyId: { $in: propertyIds } })
        .populate('tenantId', 'firstName lastName email')
        .populate('propertyId', 'title')
        .sort({ createdAt: -1 });

      const confirmedBookings = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'confirmed');
      const pendingBookings = allBookings.filter(b => b.status === 'Pending' || b.status === 'pending');

      const totalIncome = confirmedBookings.reduce((sum, b) => {
        const priceNum = typeof b.price === 'string' ? parseInt(b.price.replace(/[^0-9]/g, "")) || 0 : b.price;
        return sum + priceNum;
      }, 0);

      // Calculate dynamic monthly revenue for the last 12 months
      const monthlyRevenue = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const monthIncome = allBookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          return (b.status === 'Confirmed' || b.status === 'confirmed' || b.status === 'Completed' || b.status === 'completed') &&
            bookingDate >= startOfMonth && bookingDate <= endOfMonth;
        }).reduce((sum, b) => {
          const priceNum = typeof b.price === 'string' ? parseInt(b.price.replace(/[^0-9]/g, "")) || 0 : b.price;
          return sum + priceNum;
        }, 0);

        monthlyRevenue.push(monthIncome);
      }

      const analytics = {
        totalIncome,
        activeTenants: confirmedBookings.length,
        pendingRequests: pendingBookings.length,
        totalProperties: landlordProperties.length,
        occupancyRate: landlordProperties.length > 0 ? Math.round((confirmedBookings.length / landlordProperties.length) * 100) : 0,
        averageRent: confirmedBookings.length > 0 ? Math.round(totalIncome / confirmedBookings.length) : 0,
        monthlyRevenue
      };

      return res.status(200).json({
        success: true,
        message: "Landlord dashboard data retrieved",
        data: {
          user,
          analytics,
          recentBookings: allBookings.slice(0, 5),
          properties: landlordProperties
        }
      });
    }

    // --- TENANT DASHBOARD ---
    // Calculate Days until Rent (1st of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diffTime = Math.abs(nextMonth.getTime() - now.getTime());
    const daysUntilRent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Count Active Requests (Pending Bookings)
    const activeRequestsCount = await Booking.countDocuments({
      tenantId: userId,
      status: { $in: ['Pending', 'pending'] }
    });

    const recommendedRoomsRaw = await Property.find({ status: { $in: ['Available', 'available', 'active'] } })
      .sort({ rating: -1 })
      .limit(4);

    const recentBookingsRaw = await Booking.find({ tenantId: userId })
      .populate('propertyId')
      .sort({ createdAt: -1 })
      .limit(5);

    const payments = await Payment.find({ tenantId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Find the most recent active (confirmed/paid) booking specifically
    // Use explicit ObjectId casting for reliability
    const activeBookingRaw = await Booking.findOne({ 
      tenantId: new mongoose.Types.ObjectId(userId), 
      status: { $regex: /^(confirmed|paid)$/i } 
    }).populate({
      path: 'propertyId',
      populate: { path: 'landlordId', select: 'firstName lastName email phone profileImage' }
    }).sort({ createdAt: -1 });

    let activeBooking = null;
    let daysRemaining = daysUntilRent;
    let daysLabel = "Days until Rent";

    if (activeBookingRaw && activeBookingRaw.propertyId) {
      const prop = activeBookingRaw.propertyId;
      activeBooking = {
        id: activeBookingRaw._id,
        title: prop.title,
        description: prop.description,
        location: prop.location,
        image: prop.image || (prop.images && prop.images.length > 0 ? prop.images[0] : ''),
        images: prop.images || [],
        amenities: prop.amenities || [],
        price: activeBookingRaw.price,
        checkIn: activeBookingRaw.checkInDate,
        checkOut: activeBookingRaw.checkOutDate,
        status: activeBookingRaw.status,
        landlord: prop.landlordId ? {
          name: `${prop.landlordId.firstName} ${prop.landlordId.lastName}`,
          email: prop.landlordId.email,
          phone: prop.landlordId.phone,
          image: prop.landlordId.profileImage
        } : null
      };

      // Calculate days until checkout if available
      if (activeBookingRaw.checkOutDate) {
        const checkout = new Date(activeBookingRaw.checkOutDate);
        if (!isNaN(checkout.getTime())) {
          const diff = checkout.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          daysLabel = "Days Remaining";
        }
      }
    }

    const dashboardData = {
      user,
      stats: {
        daysUntilRent: daysRemaining,
        daysLabel,
        activeRequests: activeRequestsCount,
        currentRoom: activeBooking ? activeBooking.title : "No active room"
      },
      activeBooking,
      recentBookings: recentBookingsRaw.map(b => ({
        id: b._id,
        room: b.propertyId ? b.propertyId.title : 'Unknown Property',
        checkIn: b.checkInDate,
        status: b.status,
        price: b.price
      })),
      recommendedRooms: recommendedRoomsRaw.map(r => ({
        id: r._id,
        title: r.title,
        price: r.price,
        location: r.location,
        rating: r.rating,
        image: r.image || ''
      })),
      payments
    };

    res.status(200).json({
      success: true,
      message: "Tenant dashboard data retrieved",
      data: dashboardData
    });

  } catch (error) {
    console.error("Dashboard controller error:", error);
    res.status(500).json({ success: false, message: "Server error fetching dashboard data" });
  }
};
