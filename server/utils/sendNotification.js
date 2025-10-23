import { Notification } from "../models/notificationModel.js";

export const sendNotification = async (userId, message) => {
  try {
    const notify = new Notification({ userId, message });
    await notify.save();
  } catch (err) {
    console.error("❌ Failed to save notification:", err);
  }
};
