import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path : './.env'
})
connectDB().
then(()=>{
    app.on("error",(error)=>{
        console.log("Express error :: ",error)
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is running at port",process.env.PORT)
    })
})
.catch((error)=>{
    console.error("Failed to make connection with the database :: ",error);
})