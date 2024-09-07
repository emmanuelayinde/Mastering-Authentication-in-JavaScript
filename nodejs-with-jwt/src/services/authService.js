// services/authService.js
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwtService = require("./jwtService");
const userModel = require("../models/userModel");

exports.registerUser = async (username, email, password) => {
  if (userModel.findByEmail(email)) {
    throw new Error("User already exists");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = userModel.create({
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    id: Date.now().toString(),
  });

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  };
};

exports.loginUser = async (email, password) => {
  const user = userModel.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  console.log({ user });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const accessToken = jwtService.signAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = jwtService.signRefreshToken({ userId: user.id });

  // In a real app, save refreshToken to database
  return { accessToken, refreshToken };
};

exports.refreshToken = async (refreshToken) => {
  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    const accessToken = jwtService.signAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });
    return { accessToken };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

exports.forgotPassword = async (email) => {
  const user = userModel.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(16).toString("hex");
  const resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now

  // In a real app, save resetToken and resetTokenExpiry to user in database
  user.resetToken = resetToken;
  console.log({ resetToken });
  user.resetTokenExpiry = resetTokenExpiry;

  // In a real app, send email with reset link
  return { message: "Password reset email sent" };
};

exports.resetPassword = async (resetToken, newPassword) => {
  const user = userModel.users.find(
    (user) =>
      user.resetToken === resetToken && user.resetTokenExpiry > Date.now()
  );
  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update user password
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;

  return { message: "Password reset successful" };
};
