import api from "../utils/api";

/* Get Jobs Applicants */
export const getJobsApplicants = () => {
  return api.get("/candidate/company/jobsApply");
};
export const getJobsApplicantsByJob = (jobId: string) => {
  return api.get(`/candidate/company/applicantion/${jobId}`);
};

export const getJobsApplicationById = (id: string) => {
  return api.get(`/candidate/applicant/jobsApply/${id}`);
};

/* Get Candidate Screening */
export const getCandidateScreening = (id: string) => {
  return api.get(`/candidate/screening/${id}`);
};

/* Reject Candidate */
export const rejectCandidate = (id: string, payload: any) => {
  return api.post(`/candidate/reject/${id}`, payload);
};

/* Hire Candidate */
export const hireCandidate = (id: string, payload: any) => {
  return api.post(`/candidate/hire/${id}`, payload);
};

/* Move Candidate to Interview */
export const interviewCandidate = (id: string, payload: any) => {
  return api.post(`/candidate/interview/${id}`, payload);
};

/* Send Offer to Candidate */
export const offerCandidate = (id: string, payload: any) => {
  return api.post(`/candidate/offer/${id}`, payload);
};
/* Respose To offer */
export const responseToOffer = (id: string | undefined, payload: any) => {
  return api.patch(`/candidate/offer/response/${id}`, payload);
};

/* Get Candidate Pipeline */
export const getCandidateAnalysis = (id: string) => {
  return api.get(`/candidate/company/jobsApply/${id}`);
};
