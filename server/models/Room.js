import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    // Optional reference to a Hotel document. If hotel data is embedded, this may be null.
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: false },
    // Owner reference (useful when hotel info is embedded in the room document)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    // Embedded hotel fields (when hotel info is stored in rooms collection)
    hotelName: { type: String },
    hotelAddress: { type: String },
    hotelContact: { type: String },
    hotelCity: { type: String },
    hotelDescription: { type: String },
    hotelImages: [{ type: String }],

    roomNumber: { type: String },
    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },  // giảm giá dạng số (percent)
    // legacy / structured discount object (may contain percent, startDate, endDate)
    discount: { type: mongoose.Schema.Types.Mixed, default: 0 },
    roomArea: { type: Number, required: false }, // diện tích phòng (m2)
    roomImages: [{ type: String }], // ảnh riêng của từng phòng
    amenities: { type: Array, required: true },
    // structured counts for beds and bathrooms
    bedsDetails: { type: Object, default: {} },
    bathroomsDetails: { type: Object, default: {} },
    // Do not store uploaded room images in the Room document anymore
    // images: [{ type: String }],
    // New fields for maximum guests
    maxAdults: { type: Number, default: 0 },
    maxChildren: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;

