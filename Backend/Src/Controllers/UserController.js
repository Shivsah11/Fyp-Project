import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";
import bcrypt from "bcryptjs";

// Helper to get the correct model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'Landlord': return Landlord;
    case 'Admin': return Admin;
    case 'Tenant': return Tenant;
    default: return Tenant;
  }
};

export const getProfile = async (req, res) => {
  console.log(`[USER_CONTROLLER] GET /profile - User: ${req.user?.userId}, Role: ${req.user?.role}`);
  try {
    const { userId, role } = req.user;
    const UserModel = getModelByRole(role);

    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      console.warn(`[USER_CONTROLLER] User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("[USER_CONTROLLER] GetProfile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  console.log(`[USER_CONTROLLER] PUT /profile - User: ${req.user?.userId}`);
  try {
    const { userId, role } = req.user;
    const { firstName, lastName, phone, address, bio, profileImage } = req.body;
    const UserModel = getModelByRole(role);

    const updateData = {
      firstName,
      lastName,
      phone,
      address,
      bio
    };

    // Only update profileImage if it's provided in the request
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.warn(`[USER_CONTROLLER] Update failed: User not found ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[USER_CONTROLLER] Profile updated for: ${userId}`);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("[USER_CONTROLLER] UpdateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const preferences = req.body; // Expecting the whole preferences object or partial
    const UserModel = getModelByRole(role);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences by merging
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("UpdatePreferences error:", error);
    res.status(500).json({ message: "Server error updating preferences" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    const UserModel = getModelByRole(role);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const UserModel = getModelByRole(role);

    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("DeleteAccount error:", error);
    res.status(500).json({ message: "Server error deleting account" });
  }
};
