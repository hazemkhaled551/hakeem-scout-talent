export const JobType = {
  FULL_TIME: "Full_Time",
  PART_TIME: "Part_Time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
} as const;

export type JobType = (typeof JobType)[keyof typeof JobType];

export const Seniority = {
  FRESH: "Fresh",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
  LEAD: "Lead",
};
export type Seniority = (typeof Seniority)[keyof typeof Seniority];

export const WorkMode = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
} as const;

export type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];
export const JobStatus = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  PAUSED: "Paused",
  CLOSED: "Closed",
  FILLED: "Filled",
  EXPIRED: "Expired",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
export interface Job {
  id: string;
  title: string;
  company: { name: string };
  companyInitial: string;
  location: string;
  seniority: string;
  type: string;
  workMode: string;
  acceptedCount: number;
  applicationsCount: number;
  tags: string[];
  daysAgo: number;
  matchScore: number;
  status: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  requirements: string;
  positions?: number;
  maxApplications?: number;
  deadline?: string;
  companySize: string;
  industry: string;
  growth: string;
  minSalary: number | "";
  maxSalary: number | "";
  applicants: number;
  postedDays: number;
  
}

export interface JobPayload {
  title: string;
  location: string;
  minSalary: number | "";
  maxSalary: number | "";
  type: string;
  seniority: string;
  status: string;
  workMode: string;
  description: string;
  skills: string[];
  responsibilities: string[];
  requirements: string;
  positions?: number;
  maxApplications?: number;
  deadline?: string;
}
