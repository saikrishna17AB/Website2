import mongoose from "mongoose";
import bcrypt from "bcrypt";
import usermodel from "./Models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);


const hashedPassword = await bcrypt.hash("super123", 10);

await usermodel.create({
  name: "Super Admin",
  email: "superadmin@gmail.com",
  password: hashedPassword,
  isAccountVerified: true,
  role: "superadmin",
  adminRequest: false
});

console.log("Superadmin created!");
process.exit();