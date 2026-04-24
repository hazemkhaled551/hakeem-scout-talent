import { createContext, useContext, useState } from "react";
import useSocket from "../hooks/useSocket";

interface SocketContextType {
  notifications: any[];
}

const SocketContext = createContext<SocketContextType>({
  notifications: [],
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useSocket(token, (data) => {
    // هنا بقى بتستقبل النوتيفيكيشن
    setNotifications((prev) => [data, ...prev]);
  });

  return (
    <SocketContext.Provider value={{ notifications }}>
      {children}
    </SocketContext.Provider>
  );
};
