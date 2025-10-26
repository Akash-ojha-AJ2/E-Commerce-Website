

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






// import nodemailer from "nodemailer";

// export const sendEmail = async ({ email, subject, html }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       host: 'smtp.gmail.com',
//       port: 465, // ✅ 465 try karo (587 block hai)
//       secure: true, // ✅ 465 ke liye true
//       auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD, // Gmail App Password
//       },
//       connectionTimeout: 60000, // 60 seconds
//       greetingTimeout: 60000
//     });

//     const mailOptions = {
//       from: `"ShopKart" <${process.env.SMTP_MAIL}>`,
//       to: email,
//       subject,
//       html,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Email sending failed:", error.message);
//     throw error;
//   }
// };










import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(options);
};



