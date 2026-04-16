import Tenant from "../Models/Tenant.js";
import Landlord from "../Models/Landlord.js";
import Admin from "../Models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createInternalNotification } from "./NotificationController.js";

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    console.log("Signup request received:", { firstName, lastName, email, role });

    // Choose the appropriate model based on role
    const UserModel = role === "Landlord" ? Landlord : role === "Admin" ? Admin : Tenant;

    console.log("Using model:", role === "Landlord" ? "Landlord" : role === "Admin" ? "Admin" : "Tenant");

    // Check if user already exists in the appropriate collection
    const existingUser = await UserModel.findOne({ email });
    console.log("Existing user check:", existingUser);

    if (existingUser) {
      console.log("User already exists, returning error");
      const errorResponse = { message: "User already exists" };
      console.log("Sending error response:", errorResponse);
      return res.status(400).json(errorResponse);
    }

    // Validate input
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // --- Referral Logic ---
    const { ref } = req.body;
    let initialCoins = 0;

    // 1. Give bonus to new user if referred
    if (ref) {
      initialCoins = 25;

      // 2. Award 50 coins to referrer
      try {
        let referrer = await Tenant.findOne({ referralCode: ref });
        if (!referrer) {
          referrer = await Landlord.findOne({ referralCode: ref });
        }

        if (referrer) {
          referrer.coins = (referrer.coins || 0) + 50;
          await referrer.save();
          console.log(`Awarded 50 coins to referrer: ${referrer.email}`);
        } else {
          console.log(`Referral code ${ref} not found in database.`);
        }
      } catch (refErr) {
        console.error("Error seeking referrer:", refErr);
      }
    }

    // 3. Generate a unique referral code for the new user
    const newRefCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      referralCode: newRefCode,
      coins: initialCoins
    };

    console.log("Creating user with data:", { ...userData, password: "[HASHED]" });

    const user = await UserModel.create(userData);
    console.log("User created successfully:", user);

    // Notify Admin of new registration
    try {
      const admin = await Admin.findOne();
      if (admin) {
        await createInternalNotification({
          recipient: admin._id,
          title: "New User Registration",
          message: `${firstName} ${lastName} has registered as a ${role}.`,
          type: "info"
        });
      }
    } catch (notiError) {
      console.error("Failed to notify admin of new signup:", notiError);
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log("JWT token created");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        coins: user.coins,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user in all collections
    let user = await Tenant.findOne({ email });
    if (!user) {
      user = await Landlord.findOne({ email });
    }
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check all collections
    let user = await Tenant.findOne({ email });
    let role = 'Tenant';
    if (!user) { user = await Landlord.findOne({ email }); role = 'Landlord'; }
    if (!user) { user = await Admin.findOne({ email }); role = 'Admin'; }

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // MOCK EMAIL LOG
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log("\n--- PASSWORD RESET REQUEST ---");
    console.log(`User: ${email} (${role})`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("-------------------------------\n");

    res.status(200).json({
      message: "Password reset link sent! Please check your email (or server console in dev)."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error during forgot password" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check all collections for the token and expiration
    let user = await Tenant.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      user = await Landlord.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now log in." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};
