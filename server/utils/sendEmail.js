

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
// यह लाइन आपके कोड में सबसे ऊपर (imports के बाद) होनी चाहिए
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * SendGrid का उपयोग करके ईमेल भेजता है।
 * @param {object} options
 * @param {string} options.email - पाने वाले का ईमेल (To)
 * @param {string} options.subject - ईमेल का सब्जेक्ट
 * @param {string} options.html - ईमेल का HTML कंटेंट
 */
export const sendEmail = async ({ email, subject, html }) => {
  try {
    // 3. SendGrid का 'msg' ऑब्जेक्ट बनाएँ
    const msg = {
      to: email, // पाने वाला (आपके फंक्शन आर्ग्युमेंट से)
      
      // 4. भेजने वाला (Sender) - यह SendGrid में वेरिफाइड होना चाहिए
      // SENDER_EMAIL को Render एनवायरनमेंट में 'akashojha078@gmail.com' पर सेट करें
      from: `"ShopKart Support" <${process.env.SENDER_EMAIL}>`,
      
      subject: subject, // सब्जेक्ट (आपके फंक्शन आर्ग्युमेंट से)
      html: html,       // HTML बॉडी (आपके फंक्शन आर्ग्युमेंट से)
      
      // (वैकल्पिक) प्लेन टेक्स्ट, उन ईमेल क्लाइंट्स के लिए जो HTML रेंडर नहीं करते
      text: "This email requires an HTML-compatible email client.",
    };

    // 5. Nodemailer (transporter.sendMail) के बजाय sgMail.send() का उपयोग करें
    await sgMail.send(msg);

    console.log(`✅ Email sent successfully to ${email}`);

  } catch (error) {
    // 6. SendGrid से मिलने वाले डिटेल्ड एरर को लॉग करें
    console.error("❌ Email sending failed:", error.message);

    // यह एरर को डीबग (debug) करने के लिए बहुत जरूरी है
    if (error.response) {
      console.error("SendGrid Error Details:", error.response.body.errors);
    }
  }
};

// --- इसे ऐसे ही कॉल करें जैसे आप पहले करते थे ---

/*
// उदाहरण:
sendEmail({
  email: "user@example.com",
  subject: "Your OTP Code",
  html: "<h1>Your OTP is 123456</h1>"
});
*/
