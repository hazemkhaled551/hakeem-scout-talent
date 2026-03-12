import { useState } from "react";
import api from "../utils/api";
import { AuthContext, type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  /* ================= REGISTER ================= */

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  };

  /* ================= LOGIN ================= */

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });
    console.log(data);
    

    // setUser(data.user);
    setToken(data.data.accessToken);

    // localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.data.accessToken);
  };

  /* ================= RESEND EMAIL VERIFY ================= */

  const resendEmailVerify = async (email: string) => {
    const res = await api.post("/auth/resendEmailVerify", { email });
    return res.data;
  };

  /* ================= VERIFY EMAIL ================= */

  const verifyEmail = async (id: string, token: string) => {
    const res = await api.get(`/auth/verify-email/${id}/${token}`);
    return res.data;
  };

  /* ================= REFRESH TOKEN ================= */

  const refreshToken = async () => {
    const { data } = await api.post("/auth/refreshToken");

    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    await api.post("/auth/logOut");

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /* ================= FORGET PASSWORD ================= */

  const forgetPassword = async (email: string) => {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
  };

  /* ================= RESET PASSWORD ================= */

  const resetPassword = async (
    id: string,
    resetToken: string,
    password: string,
  ) => {
    const res = await api.post(
      `/auth/reset_password/${id}/${resetToken}`,
      { password },
    );

    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        refreshToken,
        resendEmailVerify,
        verifyEmail,
        forgetPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
