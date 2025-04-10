"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

const socket: Socket = io("http://localhost:3000");

interface NotificationData {
  message: string;
}

export const useSocket = (userId?: string) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      socket.emit("register", userId);
    }

    const handleNotification = (data: NotificationData) => {
      setNotifications((prev) => [...prev, data.message]);
      toast.info(data.message); // 通知をポップアップ表示
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);

  const sendNotificationToUser = (userId: string, message: string) => {
    socket.emit("sendNotificationToUser", { userId, message });
  };

  const sendNotificationToAll = (message: string) => {
    socket.emit("sendNotificationToAll", message);
  };

  return { notifications, sendNotificationToUser, sendNotificationToAll };
};
