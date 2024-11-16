import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.router.js";
import walletRouter from "./routes/account.router.js";
const app = express()

app.use(cookieParser())


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({limit:"16kb"}));
app.use("/api/v1/user",userRouter)
app.use("/api/v1/wallet",walletRouter)

export default app;