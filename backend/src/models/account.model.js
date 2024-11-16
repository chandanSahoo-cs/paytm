import mongoose , {Schema} from "mongoose";

const accountSchema = new Schema(
    {
        user : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        walletBalance : {
            type : Number,
            default : 0,
        },
        bankBalance : {
            type : Number,
        },

    },
    {timestamps : true}
)

const Account = mongoose.model("Account",accountSchema)
export default Account