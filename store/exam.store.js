const path = require("path");
const multer = require("multer");

const ExamStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/exams");
  },
  filename: function (req, file, cb) {
    const filename =
      file.originalname.split(".")[0] +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, filename);
  },
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|pdf|docx|doc|ppt|pptx|xls|xlsx|zip/;
    const extTest = fileTypes.test(
      path.extname(file.originalname).toLocaleLowerCase()
    );
    const mimetypeTest = fileTypes.test(file.mimetype);
    if (mimetypeTest && extTest) {
      cb(null, true);
    } else {
      cb("Error: File type not supported");
    }
  },
});
const ExamUpload = multer({ storage: ExamStorage }).single("file");

module.exports = ExamUpload;
