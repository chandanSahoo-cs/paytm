import Account from "../models/account.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

//general utitliy
const generateAccessAndRefreshToken = async (_id) => {
  try {
    const user = await User.findById(_id);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate accesstoken");
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

//controllers
//TODO : Check if every detail is present
//TODO : Check if there is a existing user with same phone number
//TODO : Create new user
//TODO : Check if the user is created
//TODO : Create wallet
//TODO : Check if wallet created
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  if ([name, email, phoneNumber, password].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "All fields are necessary");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existedUser) {
    throw new ApiError(400, "Email or phone number already exits");
  }
  const newUser = await User.create({
    name: name.toLowerCase(),
    email,
    phoneNumber,
    password,
  });

  const isUserCreated = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!isUserCreated) {
    throw new ApiError(
      500,
      "Failed to register user. Try again after some time"
    );
  }
  const wallet = await Account.create({
    user: isUserCreated._id,
    walletBalance: Math.floor(Math.random() * (10000 - 1 + 1)) + 1,
  });
  const isWalletCreated = await Account.findById(wallet._id);

  if (!isWalletCreated) {
    throw new ApiError(
      500,
      "Failed to create wallet. Try again after some time"
    );
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: isUserCreated, wallet: isWalletCreated },
        "User has been registered successfully"
      )
    );
});

//TODO : Take user details from req
//TODO : Get the user
//TODO : Check the password
//TODO : generate access and refresh token
//TODO : enter cookies (access and refresh)
const loginUser = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password } = req.body;

  if (!phoneNumber && !email) {
    throw new ApiError(400, "Phone number/email is required");
  }

  const user = await User.findOne({
    $or: [{ phoneNumber }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isPasswordCorrect(password)) {
    throw new ApiError(400, "Password is incorrect");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);

  const loggedinUser = user.toObject();
  delete loggedinUser.password;
  delete loggedinUser.refreshToken;

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedinUser, "Logged in successfully"));
});

//TODO : find and update the user
//TODO : clear cookies
const logoutUser = asyncHandler(async (req, res) => {
  const _id = req.user._id;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const loggedoutUser = updatedUser.toObject();
  delete loggedoutUser.refreshToken;
  delete loggedoutUser.password;

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, loggedoutUser, "Logged out successfully"));
});

//TODO : Get the refresh token
//TODO : Verify the token
//TODO : Generate new tokens
const generateAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("Invalid refresh token");
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is missing or expired");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    decodedToken._id
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, user, "New access token generated"));
});

export { registerUser, loginUser, logoutUser, generateAccessToken };
