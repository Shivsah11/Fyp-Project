/**
 * @file UserController.js
 * @description Controller managing user profile details, configuration preferences, and authentication credentials.
 */

import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";
import bcrypt from "bcryptjs";

/**
 * Helper function to retrieve the Mongoose model class depending on the user's role.
 *
 * @param {String} role - The role string (e.g. 'Landlord', 'Admin', 'Tenant').
 * @returns {mongoose.Model} Associated Mongoose Model constructor.
 */
const getModelByRole = (role) => {
  switch (role) {
    case 'Landlord': return Landlord;
    case 'Admin': return Admin;
    case 'Tenant': return Tenant;
    default: return Tenant;
  }
};

/**
 * Fetches the profile data of the logged-in user, excluding their hashed password.
 *
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  console.log(`[USER_CONTROLLER] GET /profile - User: ${req.user?.userId}, Role: ${req.user?.role}`);
  try {
    const { userId, role } = req.user;
    const UserModel = getModelByRole(role);

    // Retrieve user by ID and omit password hash from response
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

/**
 * Updates profile fields (names, phone, address, biography, and profile images) for the authenticated user.
 *
 * @route PUT /api/users/profile
 * @access Private
 */
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

    // Only update profileImage if it's provided in the request payload
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    // Find user and perform update with schema validation
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

/**
 * Updates application display and notification preferences by merging changes.
 *
 * @route PATCH /api/users/preferences
 * @access Private
 */
export const updatePreferences = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const preferences = req.body; // Partial preferences payload
    const UserModel = getModelByRole(role);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences by merging the existing configuration with new updates
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

/**
 * Changes password credentials by validating old password and saving the new hashed password.
 *
 * @route POST /api/users/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    const UserModel = getModelByRole(role);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify correct current password matches database hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Generate new salt, hash new password, and save credentials
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

/**
 * Deletes the authenticated user account from the database.
 *
 * @route DELETE /api/users/account
 * @access Private
 */
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

