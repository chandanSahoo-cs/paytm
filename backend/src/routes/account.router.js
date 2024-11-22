import { accountDetails, transfer } from "../controllers/account.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import { Router } from "express";

const walletRouter = Router();

//secure routes
walletRouter.route("/getWallet").post(verifyJwt,accountDetails)
walletRouter.route("/transfer").post(verifyJwt,transfer)

export default walletRouter