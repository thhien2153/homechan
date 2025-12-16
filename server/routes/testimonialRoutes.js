import express from 'express'
import Testimonial from '../models/Testimonial.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all testimonials - Lấy kèm thông tin hotel và room
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('hotelId', 'name city address')
      .populate('roomId', 'roomType pricePerNight')
      .sort({ createdAt: -1 })
    res.json(testimonials)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy testimonials.' })
  }
})

// POST create testimonial - Bảo vệ route này
router.post('/', protect, async (req, res) => {
  try {
    const { name, image, address, review, rating, hotelId, roomId, checkInDate, checkOutDate } = req.body

    if (!name || !address || !review || !rating || !hotelId || !roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' })
    }

    const newTestimonial = new Testimonial({
      name,
      image,
      address,
      review,
      rating,
      hotelId,
      roomId,
      checkInDate,
      checkOutDate
    })

    const saved = await newTestimonial.save()

    // Populate thông tin hotel và room trước khi trả về
    const populatedTestimonial = await Testimonial.findById(saved._id)
      .populate('hotelId', 'name city address')
      .populate('roomId', 'roomType pricePerNight')

    res.status(201).json(populatedTestimonial)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo testimonial.' })
  }
})

export default router