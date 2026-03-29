import api from "../utils/api";

/* Get Company Profile */
export const getCompanyProfile = () => {
  return api.get("/company/me");
};

/* Get Basic Info */
export const getCompanyBasicInfo = () => {
  return api.get("/company/me/basic_info");
};

/* Update Basic Info */
export const updateCompanyBasicInfo = (data: any) => {
  return api.put("/company/me/basic_info", data);
};

/* Update About Company */
export const updateCompanyAbout = (data: any) => {
  return api.post("/company/me/about", data);
};

/* Get Profile Completion */
export const getCompanyCompletion = () => {
  return api.get("/company/me/completion");
};

/* Get Dashboard Stats */
export const getCompanyDashboardStats = () => {
  return api.get("/company/me/dashboard-stats");
};

/* Get Company Jobs */
export const getCompanyJobs = (type: string) => {
  return api.get("/company/me/jobs", { params: { q: type } });
};

/* Get Jobs Applicants */
export const getJobsApplicants = () => {
  return api.get("/company/me/jobsApply");
};
