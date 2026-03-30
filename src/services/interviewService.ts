import api from "../utils/api"; 



export type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

export type InterviewType = "Technical" | "HR" | "Final" | "Culture Fit";

/* ── Schedule  ─────────────────────────────────────────── */
export interface ScheduleInterviewPayload {
  interviewType: InterviewType | string;
  scheduledAt: string;
  meetingLink?: string;
  durationMins?: number;
  interviewerName?: string;
  location?: string;
  notes?: string;
}

/* ── Complete with feedback ────────────────────────────── */
export interface CompleteInterviewPayload {
  publicFeedback: string;
  internalNote?: string;
  rating: number;
  nextStep: "Offered" | "Reject" | "Another Interview";
}

/* ── Reschedule ────────────────────────────────────────── */
export interface ReschedulePayload {
  scheduledAt: string;
  meetingLink?: string;
}

/* ── Cancel ────────────────────────────────────────────── */
export interface CancelInterviewPayload {
  reason?: string;
}

/* ── Send Offer ────────────────────────────────────────── */
export interface SendOfferPayload {
  offeredSalary: number;
  startDate: string;
  notes?: string;
}

/* ── Schedule Another Interview ────────────────────────── */
export interface ScheduleAnotherPayload {
  interviewType: InterviewType | string;
  scheduledAt: string;
  meetingLink?: string;
}

/* ── Offer DTO ─────────────────────────────────────────── */
export interface OfferDTO {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: { name: string };
  companyInitial: string;
  offeredSalary: number;
  startDate: string;
  notes?: string;
  status: "Pending" | "Accepted" | "Declined";
  sentAt: string;
  respondedAt?: string;
}

/* ── Respond to Offer ──────────────────────────────────── */
export interface RespondToOfferPayload {
  decision: "accept" | "decline";
  note?: string;
}

/* ── Interview DTO ─────────────────────────────────────── */
export interface InterviewDTO {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateInitials: string;
  jobId: string;
  jobTitle: string;
  company: { name: string };
  companyInitial: string;
  interviewType: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  durationMins: number;
  meetingLink?: string;
  location?: string;
  interviewerName: string;
  notes?: string;
  prepTips?: string[];
  feedback?: {
    publicFeedback: string;
    rating: number;
    nextStep: "Offer" | "Reject" | "Another Interview";
    submittedAt: string;
  };
}

/* ── Stats DTOs ────────────────────────────────────────── */
export interface CompanyInterviewStats {
  total: number;
  today: number;
  upcoming: number;
  completed: number;
}

export interface ApplicantInterviewStats {
  upcoming: number;
  completed: number;
  cancelled: number;
  thisWeek: number;
}


export const getCompanyInterviews = (status?: string) =>
  api.get("/interview/company", {
    params: status ? { status } : {},
  });


export const completeInterview = (
  interviewId: string,
  payload: CompleteInterviewPayload,
) => api.post(`/interview/complete/${interviewId}`, payload);

/**
 * PATCH /api/v1/interview/reschedule/{interviewId}
 * تغيير موعد المقابلة
 * Called from: CompanyInterviews (Reschedule modal)
 */
export const rescheduleInterview = (
  interviewId: string,
  payload: ReschedulePayload,
) => api.patch(`/interview/reschedule/${interviewId}`, payload);

/**
 * POST /api/v1/interview/cancel/{interviewId}
 * إلغاء المقابلة من ناحية الـ company
 * Called from: CompanyInterviews (Cancel modal)
 */
export const cancelInterview = (
  interviewId: string,
  payload: CancelInterviewPayload,
) => api.post(`/interview/cancel/${interviewId}`, payload);

/**
 * GET /api/v1/interview/company/stats
 * KPI strip للـ CompanyInterviews (total / today / upcoming / completed)
 * Called from: CompanyInterviews (on mount)
 */
export const getCompanyInterviewStats = () =>
  api.get("/interview/company/stats");

// ─────────────────────────────────────────────────────────────
// APPLICANT
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/interview/applicant
 * جلب كل المقابلات للـ applicant المسجل دخوله
 * Called from: ApplicantInterviews (on mount)
 */
export const getApplicantInterviews = () => api.get("/interview/applicant");

/**
 * GET /api/v1/interview/applicant/stats
 * KPI strip للـ ApplicantInterviews (upcoming / completed / cancelled / thisWeek)
 * Called from: ApplicantInterviews (on mount)
 */
export const getApplicantInterviewStats = () =>
  api.get("/interview/applicant/stats");

/**
 * POST /api/v1/interview/cancel/{interviewId}
 * إلغاء المقابلة من ناحية الـ applicant
 * Called from: ApplicantInterviews ("Can't Attend" modal)
 * نفس الـ endpoint بتاع الـ company بس cancelledBy = "applicant"
 */
export const applicantCancelInterview = (
  interviewId: string,
  reason?: string,
) =>
  api.post(`/interview/cancel/${interviewId}`, {
    reason,
  });

// ─────────────────────────────────────────────────────────────
// SCHEDULE  (من CandidateEvaluation أو بعد Complete)
// ─────────────────────────────────────────────────────────────

/**
 * POST /candidates/:candidateId/interview
 * جدولة مقابلة جديدة
 * Called from:
 *   - CandidateEvaluation (Schedule Interview modal)
 *   - CompanyInterviews (Add modal + nextStep = "Another Interview")
 */
export const scheduleInterview = (
  candidateId: string,
  payload: ScheduleInterviewPayload,
) => api.post(`/candidates/${candidateId}/interview`, payload);

/**
 * نفس scheduleInterview — alias للوضوح لما بيتبعت بعد Complete
 */
export const scheduleAnotherInterview = scheduleInterview;

// ─────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────

/**
 * POST /candidates/:candidateId/offer
 * بعت offer للـ candidate
 * Called from: CompanyInterviews (Complete modal → nextStep = "Offer")
 */
export const sendOffer = (candidateId: string, payload: SendOfferPayload) =>
  api.post(`/candidates/${candidateId}/offer`, payload);

/**
 * GET /applicant/offers
 * جلب كل الـ offers للـ applicant
 * Called from: ApplicantInterviews (Offers tab)
 */
export const getApplicantOffers = () => api.get("/applicant/offers");

/**
 * PATCH /offers/:offerId/respond
 * الـ applicant بيقبل أو يرفض الـ offer
 * Called from: ApplicantInterviews (Accept / Decline modals)
 * Side effects:
 *   → offer.status = "Accepted" | "Declined"
 *   → pipeline: Accept → "Hired" | Decline → "Rejected"
 *   → notification للـ recruiter
 */
export const respondToOffer = (
  offerId: string,
  payload: RespondToOfferPayload,
) => api.patch(`/offers/${offerId}/respond`, payload);
