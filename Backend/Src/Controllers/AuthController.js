import User from "../Models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({ message: "User registered", user });
};
