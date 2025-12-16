import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Tăng giới hạn lên 100MB cho video
    files: 15, // Tối đa 15 file (ảnh + video)
  },
  fileFilter: (req, file, cb) => {
    // Các định dạng ảnh + video cho phép
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime", // mov
      "video/webm",
      "video/x-msvideo", // avi
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Chỉ cho phép upload file hình ảnh (JPEG, PNG, GIF, WebP) hoặc video (MP4, MOV, AVI, WebM)"
        ),
        false
      );
    }
  },
});

export default upload;
