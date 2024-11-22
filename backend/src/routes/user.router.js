import { Router } from "express";
import { generateAccessToken, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser)

//Secured Routes
userRouter.route("/logout").post(verifyJwt,logoutUser)
userRouter.route("/generateNewAccessToken").post(verifyJwt,generateAccessToken)

export default userRouter