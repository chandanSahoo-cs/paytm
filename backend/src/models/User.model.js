import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        name : {
            type : String,
            required : [true,"Username is required"],
            trim : true,
        },
        email : {
            type : String,
            required : [true,"Email is requied"],
            trim : true,
        },
        phoneNumber : {
            type : Number,
            required : [true,"Phone Number is requied"],
            maxLength : 10,
            trim : true,
            unique : true,
        },
        password  :{
            type : String,
            required : [true,"Password is required"],
            trim : true,
        },
        refreshToken  :{
            type : String,
        },
    },
    {timestamps : true}
)

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User",userSchema)
export default User;