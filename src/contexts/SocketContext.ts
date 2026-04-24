import { createContext, useContext } from "react";

interface SocketContextType {
  notifications: any[];
}

export const SocketContext = createContext<SocketContextType>({
  notifications: [],
});

export const useSocketContext = () => useContext(SocketContext);
