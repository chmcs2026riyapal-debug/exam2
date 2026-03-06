import mongoose from "mongoose"
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
        console.log("MONGODB CONNECTED SUCCESFULLY")
    } catch (error) {
        console.error("Error connecting to MONGODB", error)
        process.exit(1)
    }
}