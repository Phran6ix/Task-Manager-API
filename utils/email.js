const nodemailer = require("nodemailer");

const sendEMail = async function (subject, message) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOption = await transport.sendMail({
    from: "hello@gmail.com",
    to: "bar@example.com",
    subject,
    text: message,
  });
};

module.exports = sendEMail;
