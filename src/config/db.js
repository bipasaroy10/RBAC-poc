import dns from "dns";
import mongoose from "mongoose";

if (process.env.NODE_ENV === "development") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.log("DNS servers applied for development environment");
}


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;