import express from 'express';
const router = express.Router();

import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/hotels', adminController.getAllHotels);
router.delete('/hotels/:id', adminController.deleteHotel);
router.patch('/hotels/:id/toggle-status', adminController.toggleHotelStatus);

router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

router.get('/hotel-booking-stats', adminController.getHotelBookingStats);

export default router;