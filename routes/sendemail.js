const nodemailer = require("nodemailer");

const sendEmail = (user_email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "huzaifaarshadhuzi786@gmail.com",
      pass: "HaierDcInverter*",
    },
  });
  const mailOptions = {
    from: "",
    to: user_email,
    subject: "Verification Code",
    text: `Your verification code is ${code}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
