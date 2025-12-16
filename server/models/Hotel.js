import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  city: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  hotelDiscount: {
    percent: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  },
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;