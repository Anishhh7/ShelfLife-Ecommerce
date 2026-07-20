import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./Config/config.env" });
import User from "../Model/userModel.js";

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then((con) => console.log("mongoose connected"));

(async () => {
 await User.create({
  name: "Admin",
  email: "admin@shelflife.com",
  password: "passlogin123",
  role: "admin"
 });

 console.log("SuperAdmin created");
 process.exit();
})();
