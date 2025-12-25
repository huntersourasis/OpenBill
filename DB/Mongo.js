import mongoose, { Mongoose } from "mongoose";

const ConnectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MongoURI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(`Error Msg : ${error.details[0].message} `);
    }
}

export default ConnectDB;