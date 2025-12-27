import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {User} from './Modals/userModal.js';

const MONGO_URI = "mongodb://127.0.0.1:27017/billing";

async function create_setup() {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        // 2. Hash password
        const password = "sourasis";
        const hashed_pass = await bcrypt.hash(password, 10);

        // 3. Prevent duplicate admin
        const existing = await User.findOne({ email: "clashersourasis@gmail.com" });
        if (existing) {
            console.log("Admin already exists");
            process.exit(0);
        }

        // 4. Create admin
        const doc = new User({
            name : "Sourasis Maity",
            email: "clashersourasis@gmail.com",
            password: hashed_pass,
            role: "admin"
        });

        await doc.save();
        console.log("Admin created successfully");

        // 5. Exit cleanly
        process.exit(0);

    } catch (error) {
        console.error("Setup failed:", error.message);
        process.exit(1);
    }
}

create_setup();
