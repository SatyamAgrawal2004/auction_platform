import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  // ✅ Log for debugging
  console.log("Request body:", req.body);
  console.log("Uploaded files:", req.files);

  // ✅ Validate profile image
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Profile Image Required.", 400));
  }

  const { profileImage } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(profileImage.mimetype)) {
    return next(new ErrorHandler("File format not supported.", 400));
  }

  // ✅ Destructure fields and default optional ones to empty strings
  const {
    userName,
    email,
    password,
    phone,
    address,
    role,
    bankAccountNumber = "",
    bankAccountName = "",
    bankName = "",
    easypaisaAccountNumber = "",
    paypalEmail = "",
  } = req.body;

  // ✅ Validate required fields
  if (!userName || !email || !phone || !password || !address || !role) {
    return next(new ErrorHandler("Please fill all required fields.", 400));
  }

  if (role === "Auctioneer") {
    if (
      !bankAccountName ||
      !bankAccountNumber ||
      !bankName ||
      !easypaisaAccountNumber ||
      !paypalEmail
    ) {
      return next(
        new ErrorHandler("Auctioneer payment details are required.", 400)
      );
    }
  }

  // ✅ Check if user already exists
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered.", 400));
  }

  // ✅ Upload to Cloudinary
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "MERN_AUCTION_PLATFORM_USERS",
      }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return next(
      new ErrorHandler("Failed to upload profile image to Cloudinary.", 500)
    );
  }

  // ✅ Create new user
  const user = await User.create({
    userName,
    email,
    password,
    phone,
    address,
    role,
    profileImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      easypaisa: {
        easypaisaAccountNumber,
      },
      paypal: {
        paypalEmail,
      },
    },
  });

  // ✅ Respond with token
  generateToken(user, "User Registered.", 201, res);
});

// Other exports remain unchanged:
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please fill full form."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  generateToken(user, "Login successfully.", 200, res);
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout Successfully.",
    });
});

export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ moneySpent: { $gt: 0 } });
  const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
  res.status(200).json({
    success: true,
    leaderboard,
  });
});
