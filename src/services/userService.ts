import api from "../utils/api";

export const getMe = () => api.get("/applicant");

export const getBasicInfo = () => api.get("/applicant/basic_info");

export const updateBasicInfo = (data: any) =>
  api.patch("/applicant/basic_info", data);

export const deleteUser = () => api.delete("/applicant/detele");

export const getCompletion = () => api.get("/applicant/completion");

export const getDashboardStats = () => api.get("/applicant/dashboard-stats");

export const getApplicantJobs = () => api.get("/candidate/applicant/jobsApply");
