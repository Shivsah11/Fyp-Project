import Notification from "../Models/Notification.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 for performance

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ success: false, message: "Error updating notifications" });
  }
};

// Clear all notifications
export const clearNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.deleteMany({ recipient: userId });

    res.status(200).json({
      success: true,
      message: "Notifications cleared successfully"
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({ success: false, message: "Error clearing notifications" });
  }
};

// Internal utility to create a notification (optional but useful for backend triggers)
export const createInternalNotification = async (data) => {
  try {
    const newNoti = await Notification.create(data);
    return newNoti;
  } catch (err) {
    console.error("Internal notification error:", err);
  }
};
