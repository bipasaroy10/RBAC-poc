import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,     
    },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin","superadmin"],
            default: "user",
        },
    otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    otpVerified: {
            type: Boolean,
            default: false,
        },


},
{ 
    timestamps: true
}
)

const User = mongoose.model("User", userSchema);

export default User;