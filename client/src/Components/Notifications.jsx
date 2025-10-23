import React, { useEffect, useState , useContext} from "react";
import { Context } from "../store/Context";

function NotificationPage() {
  const {backend}  = useContext(Context);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${backend}/api/v1/notifications/notifications`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notifications", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="bg-primary text-white p-3 rounded shadow-sm mb-4 d-flex align-items-center justify-content-center">
        <i className="bi bi-bell-fill me-2 fs-3"></i>
        <h3 className="mb-0">Your Notifications</h3>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Fetching latest updates...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center my-5">
          <i className="bi bi-inbox fs-1 text-secondary"></i>
          <p className="mt-3 text-muted fs-5">No notifications to show.</p>
        </div>
      ) : (
        <ul className="list-group shadow-sm">
          {notifications.map((note, index) => (
            <li
              key={index}
              className="list-group-item d-flex align-items-start border-0 border-bottom"
              style={{
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8f9fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Icon */}
              <div className="me-3 text-primary fs-4">
                <i className="bi bi-info-circle-fill"></i>
              </div>

              {/* Notification Content */}
              <div className="flex-grow-1">
                <h6 className="mb-1 fw-bold">{note.title || "📢 Notification"}</h6>
                <p className="mb-1 text-muted small">{note.message}</p>
                <small className="text-secondary">
                  {new Date(note.createdAt).toLocaleString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationPage;














