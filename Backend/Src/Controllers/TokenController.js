import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";

export const redeemCoins = async (req, res) => {
  try {
    const { amount, rewardType } = req.body; // amount is the coin amount to redeem
    const userId = req.user.userId;
    const role = req.user.role;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid coin amount" });
    }

    // Find the user
    const UserModel = role === "Landlord" ? Landlord : Tenant;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user has enough coins
    if (user.coins < amount) {
      return res.status(400).json({ success: false, message: "Insufficient coins" });
    }

    // Deduct coins
    user.coins -= amount;
    await user.save();

    // Log the transaction (In a real app, you'd have a Transaction model)
    console.log(`User ${user.email} redeemed ${amount} coins for ${rewardType}`);

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ${amount} coins for ${rewardType}!`,
      newBalance: user.coins
    });

  } catch (error) {
    console.error("Redeem coins error:", error);
    res.status(500).json({ success: false, message: "Server error during redemption" });
  }
};
