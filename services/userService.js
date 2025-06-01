const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const OTPStore = new Map();
const sendEmail = require('../helpers/sendEmail');
const generateOtpHtml = require('../emailTemplate/OTPEmail');
const forgetPasswordEmail = require('../emailTemplate/forgotPasswordEmail');

const userService = {
  getAllUsers: async () => {
    try {
      return await User.find();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  findById: async (id) => {
    try {
      return await User.find({ _id: id });
    } catch (error) {
      throw new Error(error.message);
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  signup: async ({ name, email, password, buyer }) => {
    try {
      if (!name || !email || !password ) {
        throw new Error('All fields are required');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword, buyer });
      return await newUser.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  sendResetLink: async (email) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign(
        { user: { id: user._id, name: user.name, email: user.email, buyer:user.buyer }, tokenType: 'reset' },
        process.env.JWT_SECRET || 'secret',
        {
          expiresIn: '1h',
        },
      );

      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

      await sendEmail({ to: email, subject: 'Password Reset', html: forgetPasswordEmail(resetLink) });

    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateSettings: async (userId, { name, password, avatar }) => {
    const updates = {};

    if (name && name.trim() !== '') {
      updates.name = name.trim();
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    return updatedUser;
  },
  findByEmail: async (email) => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  isEmailRegistered: async (email) => {
    try {
      const user = await User.findOne({ email });
      return user ? true : false;
    } catch (err) {
      console.error('Error checking email in database:', err);
      throw new Error('Error checking email');
    }
  },
  sendOTP: async ({ email }) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    OTPStore.set(email, {
      otp,
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: 'Your Email Verification Code',
      html: generateOtpHtml(otp),
    });
  },

  verifyOTP: async (email, otp) => {
    const record = OTPStore.get(email);
    if (!record) throw new Error('No OTP found for this email');
    if (Date.now() > record.expiresAt) {
      OTPStore.delete(email);
      throw new Error('OTP expired');
    }
    if (record.otp !== otp) throw new Error('Invalid OTP');

    OTPStore.delete(email);
    return true;
  },
};

module.exports = userService;
