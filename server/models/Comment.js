import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    media: [
      {
        type: String, // link ảnh hoặc video
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    reply: {
      text: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true, // tự tạo createdAt, updatedAt
  }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
