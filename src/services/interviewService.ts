import api from "../utils/api";
import {
  type CompleteInterviewPayload,
  type ReschedulePayload,
  type CancelInterviewPayload,
  type SendOfferPayload,
  type ScheduleInterviewPayload,
  type RespondToOfferPayload,
} from "../types/interview";

/* ── Schedule  ─────────────────────────────────────────── */

export const getCompanyInterviews = (status?: string) =>
  api.get("/interview/company", {
    params: status ? { status } : {},
  });

export const completeInterview = (
  interviewId: string,
  payload: CompleteInterviewPayload,
) => api.post(`/interview/complete/${interviewId}`, payload);

export const rescheduleInterview = (
  interviewId: string,
  payload: ReschedulePayload,
) => api.patch(`/interview/reschedule/${interviewId}`, payload);

export const cancelInterview = (
  interviewId: string,
  payload: CancelInterviewPayload,
) => api.post(`/interview/cancel/${interviewId}`, payload);


export const getCompanyInterviewStats = () =>
  api.get("/interview/company/stats");


export const getApplicantInterviews = () => api.get("/interview/applicant");


export const getApplicantInterviewStats = () =>
  api.get("/interview/applicant/stats");


export const applicantCancelInterview = (
  interviewId: string,
  reason?: string,
) =>
  api.post(`/interview/cancel/${interviewId}`, {
    reason,
  });


export const scheduleInterview = (
  candidateId: string,
  payload: ScheduleInterviewPayload,
) => api.post(`/candidates/${candidateId}/interview`, payload);


export const scheduleAnotherInterview = scheduleInterview;

// ─────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────


export const sendOffer = (candidateId: string, payload: SendOfferPayload) =>
  api.post(`/candidates/${candidateId}/offer`, payload);


export const getApplicantOffers = () => api.get("/applicant/offers");


export const respondToOffer = (
  offerId: string,
  payload: RespondToOfferPayload,
) => api.patch(`/offers/${offerId}/respond`, payload);
