import api from "../utils/api";

/* Create Job */
export const createJob = (data: any) => {
  return api.post("/jobs/createJob", data);
};

/* Get All Jobs */
export const getAllJobs = () => {
  return api.get("/jobs/allJob");
};

/* Get Job By Id */
export const getJobById = (id: string) => {
  return api.get(`/jobs/${id}`);
};

/* Apply To Job */
export const applyJob = (jobId: string, cvId: string, about: string) => {
  return api.post(`/candidate/applyJob/${jobId}/${cvId}`, { about });

};

/* Delete Job */
export const deleteJob = (id: string) => {
  return api.delete(`/jobs/${id}`);
};

/* Update Job */
export const updateJob = (id: string, data: any) => {
  return api.put(`/jobs/${id}`, data);
};

/* Screen CV */
export const screenCV = (jobId: string, userId: string) => {
  return api.get(`/jobs/screenCV/${jobId}/${userId}`);
};

/* Rejected CV */
export const rejectedCV = (jobId: string, userId: string) => {
  return api.get(`/jobs/rejectedCV/${jobId}/${userId}`);
};

/* Hired CV */
export const hiredCV = (jobId: string, userId: string) => {
  return api.get(`/jobs/hiredCV/${jobId}/${userId}`);
};

/* Change Job Status */
export const changeJobStatus = (jobId: string, status: string) => {
  return api.post(`/jobs/${jobId}/status`, { status });
};
