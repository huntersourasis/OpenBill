import mongoose from "mongoose";
import bcrypt from "bcrypt";
import readline from "readline";
import { User } from "./Modals/userModal.js";

const MONGO_URI = process.env.MongoURI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

async function create_setup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    let fullname = await ask("Enter fullname (default: OpenBill Admin): ");
    let email = await ask("Enter email (default: admin@gmail.com): ");
    let password = await ask("Enter password (default: sourasis): ");

    fullname = fullname.trim() || "OpenBill Admin";
    email = email.trim() || "admin@gmail.com";
    password = password.trim() || "sourasis";

    const hashed_pass = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists");
      rl.close();
      process.exit(0);
    }

    const doc = new User({
      fullname,
      email,
      password: hashed_pass,
      role: "admin",
      status: true,
    });

    await doc.save();

    console.log("Admin created successfully");
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("Setup failed:", error.message);
    rl.close();
    process.exit(1);
  }
}

create_setup();
