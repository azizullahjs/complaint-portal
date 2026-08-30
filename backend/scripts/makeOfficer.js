import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("usage: node scripts/makeOfficer.js someone@example.com");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "officer" },
      { new: true }
    );

    if (!user) {
      console.error(`no user found with email ${email}. sign up with this email first.`);
    } else {
      console.log(`${user.email} is now an officer.`);
    }

    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("could not connect to MongoDB:", err.message);
    process.exit(1);
  });
