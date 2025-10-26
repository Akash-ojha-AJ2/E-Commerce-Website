

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




// 1. Nodemailer के बजाय @sendgrid/mail को import करें
import sgMail from '@sendgrid/mail';


// 2. Render एनवायरनमेंट से अपनी API Key सेट करें
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 3. अपना ओरिजिनल फंक्शन वैसे ही रखें
export const sendEmail = async ({ email, subject, html }) => {
  try {
    // 4. SendGrid का msg ऑब्जेक्ट बनाएँ
    const msg = {
      to: email, // यह आपके फंक्शन आर्ग्युमेंट से आ रहा है
      from: `"ShopKart" <${process.env.SENDER_EMAIL}>`, // ❗️ जरूरी
      subject: subject, // यह आपके फंक्शन आर्ग्युमेंट से आ रहा है
      html: html, // यह आपके फंक्शन आर्ग्युमेंट से आ रहा है
      text: "Please view this email in HTML format.", // fallback
    };

    // 5. Nodemailer की जगह sgMail.send() का उपयोग करें
    await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid");

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    if (error.response) {
      // SendGrid से मिलने वाले डिटेल्ड एरर को लॉग करें
      console.error(error.response.body);
    }
  }
};