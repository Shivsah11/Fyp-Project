import User from "../Models/User.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mock dashboard data - you can replace this with real data from your database
    const dashboardData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      stats: {
        daysUntilRent: 24,
        activeRequests: 1,
        currentRoom: "Studio A"
      },
      recentBookings: [
        {
          id: 1,
          room: "2 BHK",
          checkIn: "23 Jun 2025",
          status: "Confirmed",
          price: "NPR 30000"
        }
      ],
      recommendedRooms: [
        {
          id: 1,
          title: "Cozy Studio Apartment",
          price: "$850/month",
          location: "Downtown",
          rating: 4.5,
          beds: 1,
          baths: 1
        },
        {
          id: 2,
          title: "Modern 2BR Apartment", 
          price: "$1,200/month",
          location: "Uptown",
          rating: 4.8,
          beds: 2,
          baths: 2
        }
      ]
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: dashboardData
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error retrieving dashboard data" });
  }
};
