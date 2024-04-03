import { connect } from "mongoose";
import EmailProvider from "../model/email_provider";
import { seedEmailProviders } from "../common/seeds";

const connectDB = async () => {
  try {
    const mongoURI: string =
      process.env.MONGO_URI !== undefined ? process.env.MONGO_URI : "";
    await connect(mongoURI);
    console.log("MongoDB Connected...");

    const vendorsCount = await EmailProvider.countDocuments({});
    if (vendorsCount === 0) {
      await EmailProvider.create(seedEmailProviders);
      console.log("Seed data created");
    } else {
      console.log("Data already exists, skipping seed data creation");
    }

  } catch (err) {
    console.error("Unable to connect mongodb");
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
