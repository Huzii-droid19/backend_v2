const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const PORT = process.env.PORT || 5000;
const corsOptions = { credentials: true, origin: process.env.url || "*" };
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", express.static("public"));
app.use("/student", require("./routes/student.route"));
app.use("/admin", require("./routes/admin.route"));
app.use("/teacher", require("./routes/teacher.route"));
app.use("/teacher/class", require("./routes/class.route"));

app.listen(PORT, () => console.log(`Listening to PORT ${PORT}`));
