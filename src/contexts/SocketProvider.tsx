import { useState } from "react";
import { SocketContext } from "./SocketContext";
import useSocket from "../hooks/useSocket";

export const SocketProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useSocket(token, (data) => {
    setNotifications((prev) => [data, ...prev]);
  });

  return (
    <SocketContext.Provider value={{ notifications }}>
      {children}
    </SocketContext.Provider>
  );
};
