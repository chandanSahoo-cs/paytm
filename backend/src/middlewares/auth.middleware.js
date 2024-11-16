import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError";
import User from "../models/User.model";

const verifyJwt = async(req,_,next)=>{
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!accessToken){
            throw new ApiError(400,"Incorrect access token")
        }
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decodedToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(400,"Incorrect access token")
        }
        req.user = user
        next();
    } catch (error) {
        throw new ApiError(400,"Invalid access token")
    }
}

export default verifyJwt