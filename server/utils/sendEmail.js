

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






import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, html }) => {
  try {
    // Render.com par Gmail best work karta hai
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Service explicitly set karo
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD, // Gmail App Password
      },
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000
    });

    // Mail options
    const mailOptions = {
      from: `"ShopKart" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject,
      html,
      text: "Please view this email in HTML format.",
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error; // Error throw karo taki calling function handle kar sake
  }
};
