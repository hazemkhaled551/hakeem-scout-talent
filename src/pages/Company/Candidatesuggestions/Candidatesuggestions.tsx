import { useState } from "react";
import { Send, Eye, Star, Zap, ArrowUpDown, Briefcase } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CompanyNavbar from "../../../components/CompanyNavbar";
import "./CandidateSuggestions.css";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
export interface Candidate {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  matchScore: number;
  skills: string[];
  jobId: string;
  postedAgo?: string;
}

/* ════════════════════════════════════════════════════════════
   DUMMY DATA
════════════════════════════════════════════════════════════ */
const DUMMY_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Sara Mostafa",
    role: "Frontend Dev · 4yr",
    skills: ["React", "TypeScript", "CSS"],
    matchScore: 96,
    jobId: "1",
    postedAgo: "2d",
  },
  {
    id: "c2",
    name: "Ahmed Nour",
    role: "UI Engineer · 3yr",
    skills: ["Vue", "Figma", "React"],
    matchScore: 91,
    jobId: "1",
    postedAgo: "1d",
  },
  {
    id: "c3",
    name: "Layla Hassan",
    role: "Sr. React Dev · 6yr",
    skills: ["React", "Redux", "Next.js"],
    matchScore: 89,
    jobId: "1",
    postedAgo: "3d",
  },
  {
    id: "c4",
    name: "Omar Fathy",
    role: "Frontend Engineer · 2yr",
    skills: ["React", "TypeScript"],
    matchScore: 84,
    jobId: "1",
    postedAgo: "5d",
  },
  {
    id: "c5",
    name: "Nadia Samir",
    role: "Web Dev · 5yr",
    skills: ["JavaScript", "React", "Node"],
    matchScore: 81,
    jobId: "1",
    postedAgo: "4d",
  },
  {
    id: "c6",
    name: "Islam Wael",
    role: "Frontend Dev · 3yr",
    skills: ["React", "Next.js", "Tailwind"],
    matchScore: 77,
    jobId: "1",
    postedAgo: "6d",
  },
  {
    id: "c7",
    name: "Menna Farouk",
    role: "React Dev · 1yr",
    skills: ["React", "CSS"],
    matchScore: 68,
    jobId: "1",
    postedAgo: "2d",
  },
  {
    id: "c8",
    name: "Basma Lotfy",
    role: "Frontend · 2yr",
    skills: ["React", "TypeScript"],
    matchScore: 61,
    jobId: "1",
    postedAgo: "1d",
  },
  {
    id: "c9",
    name: "Khaled Adel",
    role: "Node.js Dev · 4yr",
    skills: ["Node.js", "Express", "PostgreSQL"],
    matchScore: 95,
    jobId: "2",
    postedAgo: "1d",
  },
  {
    id: "c10",
    name: "Reem Tarek",
    role: "Backend Engineer · 3yr",
    skills: ["Node.js", "Redis", "MongoDB"],
    matchScore: 90,
    jobId: "2",
    postedAgo: "3d",
  },
  {
    id: "c11",
    name: "Youssef Ali",
    role: "API Engineer · 5yr",
    skills: ["Node.js", "PostgreSQL", "AWS"],
    matchScore: 88,
    jobId: "2",
    postedAgo: "2d",
  },
  {
    id: "c12",
    name: "Dina Kamal",
    role: "Backend Dev · 2yr",
    skills: ["Node.js", "MySQL"],
    matchScore: 79,
    jobId: "2",
    postedAgo: "4d",
  },
  {
    id: "c13",
    name: "Rana Essam",
    role: "Node Engineer · 4yr",
    skills: ["Node.js", "Redis", "Docker"],
    matchScore: 75,
    jobId: "2",
    postedAgo: "5d",
  },
  {
    id: "c14",
    name: "Sherif Nady",
    role: "Backend · 3yr",
    skills: ["PostgreSQL", "Node.js"],
    matchScore: 66,
    jobId: "2",
    postedAgo: "7d",
  },
  {
    id: "c15",
    name: "Adham Reda",
    role: "Backend Dev · 1yr",
    skills: ["Node.js", "Express"],
    matchScore: 58,
    jobId: "2",
    postedAgo: "2d",
  },
  {
    id: "c16",
    name: "Mona Hany",
    role: "UX Designer · 4yr",
    skills: ["Figma", "Prototyping", "Research"],
    matchScore: 93,
    jobId: "3",
    postedAgo: "1d",
  },
  {
    id: "c17",
    name: "Tamer Sayed",
    role: "Product Designer · 3yr",
    skills: ["Figma", "User Research"],
    matchScore: 87,
    jobId: "3",
    postedAgo: "2d",
  },
  {
    id: "c18",
    name: "Heba Ragab",
    role: "UI Designer · 5yr",
    skills: ["Figma", "Sketch", "CSS"],
    matchScore: 83,
    jobId: "3",
    postedAgo: "3d",
  },
  {
    id: "c19",
    name: "Amr Gaber",
    role: "UI/UX · 2yr",
    skills: ["Figma", "Prototyping"],
    matchScore: 72,
    jobId: "3",
    postedAgo: "6d",
  },
  {
    id: "c20",
    name: "Nour Salem",
    role: "Designer · 2yr",
    skills: ["Figma", "Illustrator"],
    matchScore: 63,
    jobId: "3",
    postedAgo: "4d",
  },
];

const PALETTES = [
  { bg: "rgba(79,70,229,.12)", color: "#534AB7" },
  { bg: "rgba(16,185,129,.12)", color: "#065f46" },
  { bg: "rgba(245,158,11,.12)", color: "#92400e" },
  { bg: "rgba(6,182,212,.12)", color: "#0e7490" },
  { bg: "rgba(239,68,68,.10)", color: "#991b1b" },
  { bg: "rgba(139,92,246,.12)", color: "#5b21b6" },
];

/* ════════════════════════════════════════════════════════════
   AVATAR
════════════════════════════════════════════════════════════ */
function Avatar({
  name,
  url,
  index,
}: {
  name: string;
  url?: string;
  index: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const p = PALETTES[index % PALETTES.length];
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div className="cs-avatar" style={{ background: p.bg, color: p.color }}>
      {initials}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SCORE BAR
════════════════════════════════════════════════════════════ */
function ScoreBar({ score }: { score: number }) {
  return (
    <div className="cs-score-wrap">
      <div className="cs-score-num">{score}%</div>
      <div className="cs-score-label">match</div>
      <div className="cs-score-track">
        <div
          className="cs-score-fill"
          style={{ "--w": `${score}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CANDIDATE CARD
════════════════════════════════════════════════════════════ */
function CandidateCard({
  candidate,
  index,
  isTop,
  invited,
  onInvite,
  delay,
}: {
  candidate: Candidate;
  index: number;
  isTop: boolean;
  invited: boolean;
  onInvite: () => void;
  delay: number;
}) {
  return (
    <div
      className={`cs-card ${isTop ? "cs-card--top" : ""} cs-au cs-d${Math.min(delay, 6)}`}
    >
      {/* Top row: avatar + name + score */}
      <div className="d-flex align-items-start gap-2  mb-2">
        <Avatar name={candidate.name} url={candidate.avatarUrl} index={index} />

        <div className="flex-1 min-width-0">
          <div className="cs-name">
            {candidate.name}
            {isTop && (
              <>
                <span className="cs-star-badge">
                  <Star size={9} color="#fff" fill="#fff" />
                </span>
                <span className="cs-top-chip">
                  <Zap size={9} /> Top pick
                </span>
              </>
            )}
          </div>
          <div className="cs-role">{candidate.role}</div>
        </div>

        <ScoreBar score={candidate.matchScore} />
      </div>

      {/* Skills */}
      <div
        className="d-flex flex-wrap gap-1 mb-2"
        style={{ marginTop: ".3rem" }}
      >
        {candidate.skills.map((s) => (
          <span key={s} className="cs-skill">
            {s}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button
          className={`cs-invite-btn ${invited ? "cs-invite-btn--sent" : "cs-invite-btn--default"}`}
          onClick={onInvite}
          disabled={invited}
        >
          <Send size={11} />
          {invited ? "Sent ✓" : "Invite"}
        </button>

        <button className="cs-view-btn">
          <Eye size={11} /> Profile
        </button>

        {candidate.postedAgo && (
          <span className="cs-posted">{candidate.postedAgo} ago</span>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function CandidateSuggestions() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");

  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...DUMMY_CANDIDATES].sort((a, b) =>
    sortAsc ? a.matchScore - b.matchScore : b.matchScore - a.matchScore,
  );

  const topIds = new Set(sorted.slice(0, 3).map((c) => c.id));

  function handleInvite(id: string) {
    setInvitedIds((prev) => new Set([...prev, id]));
  }

  /* split for divider */
  const topCandidates = sorted.filter((c) => topIds.has(c.id));
  const restCandidates = sorted.filter((c) => !topIds.has(c.id));

  return (
    <div className="cs-page">
      <CompanyNavbar />

      <main className="cs-main">
        {/* Hero header */}
        <div className="cs-hero cs-au">
          <h1 className="cs-hero-title">Top Candidate Suggestions</h1>
          <div className="cs-hero-sub">
            <Briefcase size={13} />
            Best AI-matched candidates for
            {jobId ? (
              <span className="cs-hero-job-chip">Job #{jobId}</span>
            ) : (
              <span className="cs-hero-job-chip">All Jobs</span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="cs-toolbar cs-au cs-d1">
          <div>
            <span className="cs-toolbar-label">{sorted.length} Candidates</span>
            <span className="cs-toolbar-meta" style={{ marginLeft: ".6rem" }}>
              {topCandidates.length} top picks · {restCandidates.length} other
              matches
            </span>
          </div>
          <button className="cs-sort-btn" onClick={() => setSortAsc(!sortAsc)}>
            <ArrowUpDown size={13} />
            {sortAsc ? "Lowest match first" : "Highest match first"}
          </button>
        </div>

        {/* Cards */}
        {sorted.length === 0 ? (
          <div className="cs-empty cs-au cs-d2">
            <div className="cs-empty-icon">
              <Briefcase size={22} />
            </div>
            No candidates found for this role.
          </div>
        ) : (
          <>
            {/* Top picks */}
            <div className="d-flex flex-column gap-2 cs-au cs-d2">
              {topCandidates.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  index={i}
                  isTop
                  invited={invitedIds.has(c.id)}
                  onInvite={() => handleInvite(c.id)}
                  delay={i + 2}
                />
              ))}
            </div>

            {/* Divider */}
            {restCandidates.length > 0 && (
              <div className="cs-divider cs-au cs-d4">Other Matches</div>
            )}

            {/* Rest */}
            <div className="d-flex flex-column gap-2 cs-au cs-d4">
              {restCandidates.map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  index={topCandidates.length + i}
                  isTop={false}
                  invited={invitedIds.has(c.id)}
                  onInvite={() => handleInvite(c.id)}
                  delay={Math.min(i + 4, 6)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
