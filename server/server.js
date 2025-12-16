
import express from "express"
import "dotenv/config";
import cors from "cors"
import path from "path";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/booking.Routes.js";
import commentRoutes from './routes/commentRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import favoriteRouter from "./routes/favoriteRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

connectDB()
connectCloudinary()

const app = express()
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use("/api/clerk", clerkWebhooks);
app.get('/', (req, res) => res.send("API is working"))
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/comments', commentRoutes)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRouter);
app.use("/api/image", imageRoutes);

app.get('/api/rooms/optimal-price', async (req, res) => {
    try {
        // Accept both text labels and numeric codes for roomType/city
        const payload = {
            roomType: req.query.roomType || req.query.room_type || '',
            city: req.query.city || req.query.hotelCity || req.query.hotel_city || '',
            roomArea: Number(req.query.roomArea || req.query.room_area || 20),
            maxAdults: Number(req.query.maxAdults || req.query.max_adults || 1),
            maxChildren: Number(req.query.maxChildren || req.query.max_children || 0),
            beds: Number(req.query.beds || 1),
            baths: Number(req.query.baths || 1),
            amenitiesCount: Number(req.query.amenitiesCount || req.query.amenities_count || 0)
        };
        const resp = await axios.post(`${MODEL_SERVICE_URL}/predict`, payload, { timeout: 5000 });
        return res.json(resp.data);
    } catch (err) {
        console.error('Predict error', err.message || err);
        return res.status(500).json({ error: 'Prediction failed', detail: err.message || err.toString() });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));