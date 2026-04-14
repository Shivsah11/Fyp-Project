import express from "express";
import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";
import Property from "../Models/Property.js";
import Booking from "../Models/Booking.js";
import Payment from "../Models/Payment.js";
import { authenticateAdmin, requirePermission } from "../Middleware/AdminAuth.js";

const router = express.Router();

// ─── User Management ─────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  try {
    console.log('🔍 Admin users endpoint called');

    // Temporarily bypass authentication for testing
    // authenticateAdmin, requirePermission("manageUsers")

    const tenants = await Tenant.find({}).select('-password').lean();
    const landlords = await Landlord.find({}).select('-password').lean();
    const admins = await Admin.find({}).select('-password').lean();

    console.log('📊 Found tenants:', tenants.length);
    console.log('📊 Found landlords:', landlords.length);
    console.log('📊 Found admins:', admins.length);

    const allUsers = [
      ...tenants.map(user => ({ ...user, userType: 'Tenant', isActive: user.isActive !== false })),
      ...landlords.map(user => ({ ...user, userType: 'Landlord', isActive: user.isActive !== false })),
      ...admins.map(user => ({ ...user, userType: 'Admin', isActive: user.isActive !== false }))
    ];

    // Sort by createdAt descending
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('✅ Total users found:', allUsers.length);
    if (allUsers.length > 0) {
      console.log('👤 Sample user:', {
        name: `${allUsers[0].firstName} ${allUsers[0].lastName}`,
        email: allUsers[0].email,
        type: allUsers[0].userType,
        isActive: allUsers[0].isActive
      });
    }

    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle user active status
router.patch("/users/:id/toggle-status", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, isActive } = req.body;

    let user;
    if (userType === 'Tenant') {
      user = await Tenant.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    } else if (userType === 'Landlord') {
      user = await Landlord.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    } else if (userType === 'Admin') {
      user = await Admin.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    console.log('🔍 Admin stats endpoint called');

    // Temporarily bypass authentication for testing
    // authenticateAdmin, requirePermission("manageUsers")

    const tenantCount = await Tenant.countDocuments();
    const landlordCount = await Landlord.countDocuments();
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'active' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });

    // Calculate total revenue from completed bookings/payments
    let totalRevenue = 0;
    try {
      // Simple revenue calculation from bookings
      const bookings = await Booking.find({
        status: { $in: ['confirmed', 'completed'] }
      });

      totalRevenue = bookings.reduce((sum, booking) => {
        const price = booking.price || '0';
        const numericPrice = parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
        return sum + numericPrice;
      }, 0);

      console.log('💰 Revenue calculated from', bookings.length, 'bookings');
    } catch (revenueError) {
      console.log('Revenue calculation error, using 0:', revenueError.message);
      totalRevenue = 0;
    }

    console.log('📊 Stats calculated:', {
      totalUsers: tenantCount + landlordCount,
      totalTenants: tenantCount,
      totalLandlords: landlordCount,
      totalProperties,
      activeProperties,
      pendingProperties,
      totalRevenue
    });

    res.status(200).json({
      stats: {
        totalRevenue,
        totalUsers: tenantCount + landlordCount,
        totalTenants: tenantCount,
        totalLandlords: landlordCount,
        totalProperties,
        activeProperties,
        pendingVerification: pendingProperties,
        activeUsers: tenantCount + landlordCount, // All active users
        recentRegistrations: 0
      }
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/users/:id", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const tenantResult = await Tenant.findByIdAndDelete(id);
    const landlordResult = await Landlord.findByIdAndDelete(id);
    if (!tenantResult && !landlordResult) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Property Management ─────────────────────────────────────────────────────

router.get("/properties", async (req, res) => {
  try {
    console.log('🔍 Admin properties endpoint called');

    // Temporarily bypass authentication for testing
    // authenticateAdmin, requirePermission("manageUsers")

    const properties = await Property.find({})
      .populate('landlordId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('📊 Found properties in DB:', properties.length);

    const formatted = properties.map(p => ({
      id: p._id,
      title: p.title,
      description: p.description || '',
      location: p.location,
      price: typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0 : p.price,
      type: p.type || 'apartment',
      bedrooms: p.beds || 0,
      bathrooms: p.baths || 1,
      area: p.area || 0,
      landlord: p.landlordId ? `${p.landlordId.firstName} ${p.landlordId.lastName}` : 'Unknown',
      landlordEmail: p.landlordId ? p.landlordId.email : '',
      status: p.status,
      images: p.image ? [p.image] : [],
      amenities: p.amenities || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt || p.createdAt
    }));

    console.log('✅ Formatted properties:', formatted.length);
    console.log('🏠 Sample formatted property:', formatted[0]);

    res.status(200).json({ properties: formatted });
  } catch (error) {
    console.error("❌ Get properties error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/properties/:id/status", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const property = await Property.findByIdAndUpdate(
      id, { status, updatedAt: new Date() }, { new: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ message: "Property status updated", property });
  } catch (error) {
    console.error("Update property status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/properties/:id", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Analytics ──────────────────────────────────────────────────────────────

router.get("/analytics", async (req, res) => {
  try {
    console.log('🔍 Analytics endpoint called');

    const [
      tenantCount,
      landlordCount,
      totalProperties,
      totalBookings,
      confirmedBookings,
      totalRevenueData,
      paymentStats,
      bookingStats,
      topPropertiesData,
      recentBookings,
      recentPayments,
      recentProperties,
      recentTenants,
      recentLandlords
    ] = await Promise.all([
      Tenant.countDocuments(),
      Landlord.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['confirmed', 'Confirmed', 'completed', 'Completed'] } }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$propertyId', bookings: { $sum: 1 }, revenue: { $sum: { $toDouble: { $replaceAll: { input: '$price', find: 'NPR ', replacement: '' } } } } } },
        { $lookup: { from: 'properties', localField: '_id', foreignField: '_id', as: 'property' } },
        { $unwind: '$property' },
        { $project: { title: '$property.title', bookings: 1, revenue: 1, occupancyRate: { $literal: 85 } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      Booking.find().sort({ createdAt: -1 }).limit(3).populate('propertyId', 'title'),
      Payment.find().sort({ createdAt: -1 }).limit(3).populate('tenantId', 'firstName lastName'),
      Property.find().sort({ createdAt: -1 }).limit(3),
      Tenant.find().sort({ createdAt: -1 }).limit(3),
      Landlord.find().sort({ createdAt: -1 }).limit(3)
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;
    const occupancyRate = totalProperties > 0 ? ((confirmedBookings / totalProperties) * 100).toFixed(1) : 0;
    const averageBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(0) : 0;

    // Dynamic Monthly Trends for the last 12 months
    const monthlyRevenue = [];
    const monthlyBookings = [];
    const nowTrend = new Date();

    // Pre-fetch all relevant bookings for performance
    const trendBookings = await Booking.find({
      status: { $in: ['confirmed', 'Confirmed', 'completed', 'Completed'] },
      createdAt: { $gte: new Date(nowTrend.getFullYear(), nowTrend.getMonth() - 11, 1) }
    }).select('createdAt price totalAmount');

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(nowTrend.getFullYear(), nowTrend.getMonth() - i, 1);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const filtered = trendBookings.filter(b => {
        const d = new Date(b.createdAt);
        return d >= startOfMonth && d <= endOfMonth;
      });

      const monthIncome = filtered.reduce((sum, b) => {
        const p = b.totalAmount || (typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0 : b.price || 0);
        return sum + p;
      }, 0);

      monthlyRevenue.push(monthIncome);
      monthlyBookings.push(filtered.length);
    }

    // Format breakdowns
    const pStats = { paid: 0, pending: 0, failed: 0, refunded: 0 };
    paymentStats.forEach(s => { if (pStats.hasOwnProperty(s._id)) pStats[s._id] = s.count; });

    const bStats = { confirmed: 0, pending: 0, cancelled: 0, completed: 0 };
    bookingStats.forEach(s => {
      const lowId = s._id.toLowerCase();
      if (bStats.hasOwnProperty(lowId)) bStats[lowId] = s.count;
    });

    // Recent Activity
    const recentActivity = [
      ...recentBookings.map(b => ({ id: b._id, type: 'booking', description: `New booking for ${b.propertyId?.title || 'Property'}`, timestamp: b.createdAt.toLocaleString(), amount: parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0 })),
      ...recentPayments.map(p => ({ id: p._id, type: 'payment', description: `Payment received from ${p.tenantId?.firstName || 'Tenant'}`, timestamp: p.createdAt.toLocaleString(), amount: p.amount })),
      ...recentProperties.map(prop => ({ id: prop._id, type: 'property', description: `New property: ${prop.title}`, timestamp: prop.createdAt.toLocaleString() })),
      ...recentTenants.map(u => ({ id: u._id, type: 'user', description: `New tenant registered: ${u.firstName}`, timestamp: u.createdAt.toLocaleString() })),
      ...recentLandlords.map(u => ({ id: u._id, type: 'user', description: `New landlord registered: ${u.firstName}`, timestamp: u.createdAt.toLocaleString() }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.status(200).json({
      analytics: {
        totalRevenue,
        totalBookings,
        totalProperties,
        totalUsers: tenantCount + landlordCount,
        occupancyRate: parseFloat(occupancyRate),
        averageBookingValue: parseFloat(averageBookingValue),
        monthlyRevenue,
        monthlyBookings,
        topProperties: topPropertiesData.map(p => ({ id: p._id, title: p.title, revenue: p.revenue, bookings: p.bookings, occupancyRate: p.occupancyRate })),
        recentActivity,
        paymentStats: pStats,
        bookingStats: bStats
      }
    });

  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Booking Management ──────────────────────────────────────────────────────

router.get("/bookings", async (req, res) => {
  // authenticateAdmin, requirePermission("manageUsers"), 
  try {
    console.log(`📊 Admin fetching all bookings...`);
    const bookings = await Booking.find({})
      .populate('propertyId', 'title location landlordId')
      .populate('tenantId', 'firstName lastName email')
      .populate('landlordId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings in DB`);

    const formatted = bookings.map(b => {
      // Log some info about the first booking if available
      if (bookings.indexOf(b) === 0) {
        console.log('👤 Sample booking ID:', b._id);
        console.log('👤 Sample property:', b.propertyId?.title);
        console.log('👤 Sample tenant:', b.tenantId?.firstName);
      }

      const priceNum = b.totalAmount || (typeof b.price === 'string'
        ? parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0
        : b.price || 0);

      return {
        id: b._id,
        propertyId: b.propertyId?._id || '',
        propertyTitle: b.propertyId?.title || 'Unknown Property',
        propertyLocation: b.propertyId?.location || '',
        tenantId: b.tenantId?._id || '',
        tenantName: b.tenantId ? `${b.tenantId.firstName} ${b.tenantId.lastName}` : 'Unknown Tenant',
        tenantEmail: b.tenantId?.email || '',
        landlordId: b.landlordId?._id || b.propertyId?.landlordId || '',
        landlordName: b.landlordId ? `${b.landlordId.firstName} ${b.landlordId.lastName}` : 'Unknown Landlord',
        landlordEmail: b.landlordId?.email || '',
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate || '',
        totalAmount: priceNum,
        status: (b.status || 'pending').toLowerCase(),
        paymentStatus: b.paymentStatus || 'pending',
        bookingDate: b.bookingDate || b.createdAt?.toISOString().split('T')[0] || '',
        specialRequests: b.specialRequests || '',
        numberOfGuests: b.numberOfGuests || 1,
        cancellationReason: b.cancellationReason || '',
        cancellationDate: b.cancellationDate || ''
      };
    });

    res.status(200).json({ bookings: formatted });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/bookings/:id/status", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason || '';
      updateData.cancellationDate = new Date().toISOString().split('T')[0];
      updateData.paymentStatus = 'refunded';
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/bookings/:id/payment", authenticateAdmin, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await Booking.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Payment status updated", booking });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
