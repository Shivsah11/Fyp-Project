import Message from "../Models/Message.js";
import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";

// Helper to determine the model name for a given user ID
const getUserModel = async (userId) => {
  if (await Tenant.findById(userId)) return "Tenant";
  if (await Landlord.findById(userId)) return "Landlord";
  if (await Admin.findById(userId)) return "Admin";
  return null;
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, content, type } = req.body;
    const senderId = req.user.userId;
    // Extract from token and normalize to Title Case ('Tenant', 'Landlord', 'Admin') to match Mongoose refPath Enums
    const rawRole = req.user.role || 'Tenant';
    const senderModel = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: "Recipient and content are required" });
    }

    // Determine recipient model
    const recipientModel = await getUserModel(recipientId);
    if (!recipientModel) {
      return res.status(404).json({ success: false, message: "Recipient user not found" });
    }

    const newMessage = await Message.create({
      senderId,
      senderModel,
      recipientId,
      recipientModel,
      subject: subject || "No Subject",
      content,
      type: type || "landlord",
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error sending message" });
  }
};

// @desc    Get all messages for the current user (Inbox & Sent)
// @route   GET /api/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch messages where user is sender OR recipient
    // Populate sender details based on their specific model
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    })
    .sort({ createdAt: -1 });

    // We manually populate because refPath population can be tricky with multiple models in a list
    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      const isSent = msg.senderId.toString() === userId.toString();
      const otherPartyId = isSent ? msg.recipientId : msg.senderId;
      const otherPartyModel = isSent ? msg.recipientModel : msg.senderModel;
      
      let otherUser;
      if (otherPartyModel === 'Tenant') otherUser = await Tenant.findById(otherPartyId).select('firstName lastName email');
      else if (otherPartyModel === 'Landlord') otherUser = await Landlord.findById(otherPartyId).select('firstName lastName email');
      else if (otherPartyModel === 'Admin') otherUser = await Admin.findById(otherPartyId).select('firstName lastName email');

      const otherPartyName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown User";

      return {
        id: msg._id,
        sender: isSent ? "Me" : otherPartyName,
        recipient: isSent ? otherPartyName : "Me",
        subject: msg.subject,
        content: msg.content,
        timestamp: msg.createdAt,
        isRead: msg.isRead,
        type: isSent ? 'sent' : msg.type,
        avatar: otherUser ? otherUser.firstName.charAt(0) + otherUser.lastName.charAt(0) : "U",
        otherPartyId,
        otherPartyRole: otherPartyModel
      };
    }));

    res.status(200).json({
      success: true,
      data: populatedMessages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error fetching messages" });
  }
};

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    // Only recipient can mark as read
    if (message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    // Only sender or recipient can delete
    if (message.senderId.toString() !== userId.toString() && message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSent = msg.senderId.toString() === userId.toString();
      const otherPartyId = isSent ? msg.recipientId.toString() : msg.senderId.toString();
      const otherPartyModel = isSent ? msg.recipientModel : msg.senderModel;

      if (!conversationsMap.has(otherPartyId)) {
        let otherUser;
        if (otherPartyModel === 'Tenant') otherUser = await Tenant.findById(otherPartyId).select('firstName lastName email');
        else if (otherPartyModel === 'Landlord') otherUser = await Landlord.findById(otherPartyId).select('firstName lastName email');
        else if (otherPartyModel === 'Admin') otherUser = await Admin.findById(otherPartyId).select('firstName lastName email');

        const otherPartyName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown User";

        conversationsMap.set(otherPartyId, {
          otherPartyId,
          otherPartyRole: otherPartyModel,
          name: otherPartyName,
          avatar: otherUser ? otherUser.firstName.charAt(0) + otherUser.lastName.charAt(0) : "U",
          lastMessage: {
            id: msg._id,
            content: msg.content,
            subject: msg.subject,
            timestamp: msg.createdAt,
            isRead: msg.isRead,
            isSent
          },
          unreadCount: 0
        });
      }

      if (!isSent && !msg.isRead) {
        conversationsMap.get(otherPartyId).unreadCount++;
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(conversationsMap.values())
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error fetching conversations" });
  }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => {
      const isSent = msg.senderId.toString() === currentUserId.toString();
      return {
        id: msg._id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        subject: msg.subject,
        content: msg.content,
        timestamp: msg.createdAt,
        isRead: msg.isRead,
        isSent
      };
    });

    res.status(200).json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({ success: false, message: "Server error fetching conversation messages" });
  }
};

