import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: "tonautremail@gmail.com",
  subject: "Test nodemailer",
  text: "Si tu reçois ça, ton config fonctionne !",
}).then(() => {
  console.log("✅ Email envoyé !");
}).catch(err => {
  console.error("❌ Échec d'envoi :", err);
});
