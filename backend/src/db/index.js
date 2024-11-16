import mongoose, { connect } from "mongoose"

const connectDB = async()=>{
    try {
        if(!process.env.DB_URI){
            console.log("Yahan dikkat hai");
            process.exit(1);
        }
        const connectionInstance = await mongoose.connect("mongodb+srv://chandan:chandan@cluster0.dbfi5.mongodb.net/PaytmClone")
        console.log("DB connection made successfully :: DB_HOST: ",connectionInstance.connection.host)
    } catch (error) {
        console.error("DB connection failed :: ",error)
        process.exit(1);
    }
}


export default connectDB