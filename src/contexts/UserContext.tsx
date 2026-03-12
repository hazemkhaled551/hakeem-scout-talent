import { createContext, useContext, useState, useEffect } from "react";
import * as userService from "../services/userService";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    const { data } = await userService.getMe();
    setUser(data.data);
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        await loadUser();
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    fetchUser();
    // loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);