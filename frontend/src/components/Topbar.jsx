import React, { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  MapPin,
  UserRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

function Topbar({ notificationCount }) {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [location, setLocation] = useState(
    "Detecting location..."
  );

  const [storedUnread, setStoredUnread] = useState(() => {
    const saved = localStorage.getItem("manetUnreadAlerts");
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateUnread = (event) => {
      if (
        typeof event.detail?.unreadCount === "number"
      ) {
        setStoredUnread(event.detail.unreadCount);
      }
    };

    const handleStorage = (event) => {
      if (event.key === "manetUnreadAlerts") {
        setStoredUnread(Number(event.newValue || 0));
      }
    };

    window.addEventListener(
      "manet-alerts-updated",
      updateUnread
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "manet-alerts-updated",
        updateUnread
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );

          if (!response.ok) {
            throw new Error("Location lookup failed");
          }

          const data = await response.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            "Unknown";

          const state = address.state || "";

          setLocation(
            state ? `${city}, ${state}` : city
          );
        } catch {
          setLocation("Location unavailable");
        }
      },
      () => {
        setLocation("Location permission denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  const formattedDate =
    currentDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  const formattedDay =
    currentDate.toLocaleDateString("en-IN", {
      weekday: "long"
    });

  const formattedTime =
    currentDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

  const unreadCount =
    typeof notificationCount === "number"
      ? notificationCount
      : storedUnread;

  return (
    <header className="topbar">
      <div className="topbar-left">

        <div className="topbar-info">
          <div className="topbar-info-icon">
            <CalendarDays size={18} />
          </div>

          <div className="topbar-info-text">
            <span className="topbar-label">
              DATE
            </span>

            <strong>
              {formattedDate}
            </strong>
          </div>
        </div>

        <div className="topbar-divider" />

        <div className="topbar-info">
          <div className="topbar-info-icon">
            <CalendarDays size={18} />
          </div>

          <div className="topbar-info-text">
            <span className="topbar-label">
              DAY
            </span>

            <strong>
              {formattedDay}
            </strong>
          </div>
        </div>

        <div className="topbar-divider" />

        <div className="topbar-info topbar-location">
          <div className="topbar-info-icon">
            <MapPin size={18} />
          </div>

          <div className="topbar-info-text">
            <span className="topbar-label">
              LOCATION
            </span>

            <strong>
              {location}
            </strong>
          </div>
        </div>

        <div className="topbar-time">
          <span className="topbar-live-dot" />
          {formattedTime}
        </div>
      </div>

      <div className="topbar-right">

        <button
          className="topbar-notification"
          type="button"
          onClick={() => navigate("/alerts")}
          title="Network Alerts"
        >
          <Bell size={19} />

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        <div className="topbar-separator" />

        <button
          className="topbar-profile"
          type="button"
          onClick={() => navigate("/profile")}
          title="Profile"
        >
          <div className="profile-avatar">
            <UserRound size={19} />
          </div>

          <div className="profile-details">
            <strong>
              Administrator
            </strong>

            <span>
              Network Operator
            </span>
          </div>

          <ChevronDown
            className="profile-chevron"
            size={17}
          />
        </button>

      </div>
    </header>
  );
}

export default Topbar;