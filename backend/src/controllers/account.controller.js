import mongoose from "mongoose";
import Account from "../models/account.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/User.model.js";

//TODO : Get user details from the req
//TODO : return account details
const accountDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user);
  if (!user) {
    throw new ApiError(400, "No user found. Please login again");
  }
  const wallet = await Account.findOne({user: user._id});
  console.log(wallet);
  if (!wallet) {
    throw new ApiError(400, "No wallet found. Please create a wallet");
  }
  res.status(200).json(new ApiResponse(200, wallet, "User account details"));
});

//TODO : Start the session
//TODO : Get from,to,amount;
//TODO : find the from & to wallet;
//TODO : Check if any of it is missing
//TODO : Check if there is enough balance in from
//TODO : Begin the transaction
//TODO : Commit the session
const transfer = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to } = req.body;
  const from = req.user._id;

  if (!from) {
    throw new ApiError(400, "Failed to fetch user. Please login again");
  }

  if ([amount, to].some((val) => val?.trim === "")) {
    throw new ApiError(
      400,
      "Failed to make the transaction. Enter the details carefully"
    );
  }

  const walletFrom = await Account.findOne({ user: from }).session(
    session
  );

  if (!walletFrom) {
    throw new ApiError(400, "User wallet not found");
  }

  if (walletFrom.walletBalance < amount) {
    throw new ApiError(411, "Enough not present");
  }

  const userWallet = await Account.findOneAndUpdate(
    { user: from },
    {
      $inc: {
        walletBalance: -amount,
      },
    },
    {
      new: true,
    }
  ).session(session);

  console.log(userWallet);

  const reciepent  = await User.findOne({phoneNumber: to}).session(session);
  const reciepentWallet = await Account.findOneAndUpdate(
    { user: reciepent._id },
    {
      $inc: {
        walletBalance: amount,
      },
    },
    {
      new: true,
    }
  ).session(session);

  console.log(reciepentWallet);
  if (!reciepentWallet) {
    await session.abortTransaction();
    throw new ApiError(411, "Reciepent wallet not found");
  }


  await session.commitTransaction();

  res.status(200).json(new ApiResponse(200, {}, "Transaction successful"));
});

export { accountDetails, transfer };
