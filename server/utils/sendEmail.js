

// import nodemailer from "nodemailer";

// export const sendEmail = async ({ email, subject, html }) => {
//   try {
//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       service: process.env.SMTP_SERVICE, // optional if host is provided
//       port: process.env.SMTP_PORT || 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });

//     // Mail options
//     const mailOptions = {
//       from: `"ShopKart" <${process.env.SMTP_MAIL}>`,
//       to: email,
//       subject,
//       html, // ✅ HTML body (styled template)
//       text: "Please view this email in HTML format.", // fallback text
//     };

//     // Send mail
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.messageId);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error.message);
//   }
// };







import { Resend } from "resend";

// यह लाइन फ़ाइल के टॉप पर या config में रखें
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      // Resend आपको एक 'from' ईमेल एड्रेस देगा, जैसे: "onboarding@resend.dev"
      // उसी का इस्तेमाल करें।
      from: "ShopKart <onboarding@resend.dev>",
      to: [email], // यहाँ 'email' आपका यूजर का ईमेल है
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);
      return; // एरर को हैंडल करें
    }

    console.log("✅ Email sent:", data.id);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};