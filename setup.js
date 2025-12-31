import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {User} from './Modals/userModal.js';

const MONGO_URI = process.env.MongoURI;

async function create_setup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
        const password = "sourasis";
        const hashed_pass = await bcrypt.hash(password, 10);
        const existing = await User.findOne({ email: "clashersourasis@gmail.com" });
        if (existing) {
            console.log("Admin already exists");
            process.exit(0);
        }
        const doc = new User({
            fullname : "Sourasis Maity",
            email: "clashersourasis@gmail.com",
            password: hashed_pass,
            role: "admin",
            status : true
        });
        await doc.save();
        console.log("Admin created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Setup failed:", error.message);
        process.exit(1);
    }
}
create_setup();
