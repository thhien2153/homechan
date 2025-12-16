import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities, promoteToOwner, getProfile, updateProfile } from "../controllers/userController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
userRouter.post('/become-owner', protect, promoteToOwner);
userRouter.get('/profile', protect, getProfile);
userRouter.put("/update-profile", protect, upload.single("avatar"), updateProfile);

export default userRouter;