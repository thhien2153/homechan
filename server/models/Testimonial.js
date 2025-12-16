import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    address: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true }
  },
  { timestamps: true }
)

export default mongoose.model('Testimonial', testimonialSchema)