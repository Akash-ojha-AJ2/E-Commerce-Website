import {Notification} from "../models/notificationModel.js";


export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};



export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read"
    });
  }
};
