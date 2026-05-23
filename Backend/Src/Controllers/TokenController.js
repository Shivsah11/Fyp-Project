/**
 * @file TokenController.js
 * @description Controller handling coins redemption system for rewards for both landlords and tenants.
 */

import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";

/**
 * Redeems a specific amount of coins from a user's balance for a designated reward.
 * Determines user type (Landlord or Tenant) dynamically from the request session role.
 *
 * @route POST /api/tokens/redeem
 * @access Private (authenticated users)
 */
export const redeemCoins = async (req, res) => {
  try {
    const { amount, rewardType } = req.body; // Amount of coins to redeem and name/type of reward
    const userId = req.user.userId;
    const role = req.user.role;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid coin amount" });
    }

    // Determine the user model collection based on user role (polymorphic design)
    const UserModel = role === "Landlord" ? Landlord : Tenant;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the user has a sufficient coin balance
    if (user.coins < amount) {
      return res.status(400).json({ success: false, message: "Insufficient coins" });
    }

    // Deduct coins from balance and persist the change in database
    user.coins -= amount;
    await user.save();

    // Log the transaction
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

