import api from "../../utils/api";

export const getAllJobs = (page: number = 1, limit: number = 10) => {
  return api.get("/admin/jobs", { params: { page, limit } });
};
