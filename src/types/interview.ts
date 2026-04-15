export type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";
export type InterviewType = "Technical" | "HR" | "Final";

export interface ScheduleInterviewPayload {
  interviewType: InterviewType | string;
  scheduledAt: string;
  meetingLink?: string;
  durationMins?: number;
  interviewerName?: string;
  location?: string;
  notes?: string;
}

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
  
 export type OfferResponse = "accept" | "rejected" | null;

/* Extend the feedback type locally to include offer details */
export interface OfferDetails {
  offeredSalary?: string;
  startDate?: string;
  notes?: string;
}
 export interface NextInterviewDetails {
  type: string;
  scheduledAt?: string;
  meetingLink?: string;
}
export interface ExtendedFeedback {
  publicFeedback: string;
  rating: number;
  nextStep: string;
  submittedAt: string;
  offerResponse?: OfferResponse;
  offer?: OfferDetails;
  nextInterview?: NextInterviewDetails;
}
export type ExtendedInterviewDTO = Omit<InterviewDTO, "feedback"> & {
  feedback?: ExtendedFeedback;
};
