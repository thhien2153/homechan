import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    username: String,
    fullname: String,
    email: String,
    phone: String,
    address: String,
    avatar: String
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
