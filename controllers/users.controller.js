import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.util.js";

const registerController = async (req, res) => {
  try {
    const { profilePicture, fullName, phoneNo, password, gender, birthdate } =
      req.body;

    // Validate required fields
    if (!fullName || !phoneNo || !password || !gender || !birthdate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNo });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    // Create new user
    const user = await User.create({
      profilePicture,
      fullName,
      phoneNo,
      password,
      gender,
      birthdate,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      profilePicture: user.profilePicture,
      fullName: user.fullName,
      phoneNo: user.phoneNo,
      gender: user.gender,
      birthdate: user.birthdate,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { phoneNo, password } = req.body;

    // Validate input
    if (!phoneNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone number and password",
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNo });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      profilePicture: user.profilePicture,
      fullName: user.fullName,
      phoneNo: user.phoneNo,
      gender: user.gender,
      birthdate: user.birthdate,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export { registerController, loginController };
