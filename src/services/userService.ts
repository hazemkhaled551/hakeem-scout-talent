import api from "../utils/api";

export const getMe = () => api.get("/user/me");

export const getBasicInfo = () => api.get("/user/me/basic_info");

export const updateBasicInfo = (data: any) =>
  api.put("/user/me/basic_info", data);

export const getCompletion = () => api.get("/user/me/completion");

export const getDashboardStats = () => api.get("/user/me/dashboard-stats");

export const getApplicantJobs = () => api.get("/user/me/applicantJob");
