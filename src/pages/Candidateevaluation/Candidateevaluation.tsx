import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BrainCircuit, Mail, Phone, MapPin, Calendar,
  Shield, CheckCircle, AlertTriangle, TrendingUp,
  ChevronLeft, LogOut, User, Video, UserCheck,
  Gift, Star, XCircle, ClipboardList, Zap,
} from "lucide-react";
import Modal from "../../components/Modal/Modal";
import "./Candidateevaluation.css";

// ── Interview Service ──────────────────────────────────────────────────────────
import {
  type InterviewType,
} from "../../services/interviewService";

// ── Candidate pipeline services ───────────────────────────────────────────────
import {
  getCandidateScreening,
  rejectCandidate,
  hireCandidate,
  offerCandidate,
  interviewCandidate,
} from "../../services/candidateService";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type CandidateStatus =
  | "Under Review" | "Screening" | "Interview Scheduled"
  | "Offer Sent"   | "Hired"     | "Rejected";

type ActionType =
  | "interview" | "screening" | "offer" | "hired" | "reject" | null;

/* ════════════════════════════════════════════════════════════
   STATIC DATA (replace with API response)
════════════════════════════════════════════════════════════ */
const scoreBreakdown = [
  { label:"Technical Skills", score:96 },
  { label:"Experience Match",  score:94 },
  { label:"Education",         score:95 },
  { label:"Cultural Fit",      score:92 },
];
const strongSkills   = ["React","Node.js","TypeScript","AWS","PostgreSQL","Docker","Git","Agile"];
const partialSkills  = ["Kubernetes","GraphQL"];
const explicitSkills = ["React","Node.js","TypeScript","Python","AWS","Docker"];
const implicitSkills = ["System Design","Team Leadership","Problem Solving","Communication"];
const skillsData = [
  { skill:"React",         candidate:95, required:90 },
  { skill:"Node.js",       candidate:92, required:85 },
  { skill:"TypeScript",    candidate:90, required:80 },
  { skill:"AWS",           candidate:85, required:75 },
  { skill:"System Design", candidate:88, required:80 },
  { skill:"Leadership",    candidate:82, required:70 },
];
const fairnessMetrics = [
  { name:"Gender Bias Check",   status:"Pass" },
  { name:"Age Bias Check",      status:"Pass" },
  { name:"Name Bias Check",     status:"Pass" },
  { name:"Location Bias Check", status:"Pass" },
];

/* ════════════════════════════════════════════════════════════
   SVG RADAR
════════════════════════════════════════════════════════════ */
interface RadarPoint { skill:string; candidate:number; required:number; }
function RadarChartSVG({ data }: { data: RadarPoint[] }) {
  const SIZE=300, CX=150, CY=150, R=110, LEVELS=4, n=data.length;
  const angle = (i:number) => (Math.PI*2*i)/n - Math.PI/2;
  const pt    = (val:number, i:number) => ({ x:CX+(val/100)*R*Math.cos(angle(i)), y:CY+(val/100)*R*Math.sin(angle(i)) });
  const poly  = (key:"candidate"|"required") => data.map((d,i)=>{ const p=pt(d[key],i); return `${p.x},${p.y}`; }).join(" ");
  const grid  = (pct:number) => data.map((_,i)=>{ const p=pt(pct,i); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width:"100%",maxWidth:320,display:"block",margin:"0 auto 8px" }}>
      {Array.from({length:LEVELS},(_,lvl)=><polygon key={lvl} points={grid(((lvl+1)/LEVELS)*100)} fill="none" stroke="rgba(79,70,229,.12)" strokeWidth="1"/>)}
      {data.map((_,i)=>{ const o=pt(100,i); return <line key={i} x1={CX} y1={CY} x2={o.x} y2={o.y} stroke="rgba(79,70,229,.1)" strokeWidth="1"/>; })}
      <polygon points={poly("required")} fill="rgba(16,185,129,.2)" stroke="rgba(16,185,129,.7)" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points={poly("candidate")} fill="rgba(79,70,229,.25)" stroke="rgba(79,70,229,.9)" strokeWidth="2" strokeLinejoin="round"/>
      {data.map((d,i)=>{ const p=pt(d.candidate,i); return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5"/>; })}
      {data.map((d,i)=>{ const a=angle(i),lR=R+22,x=CX+lR*Math.cos(a),y=CY+lR*Math.sin(a); const anchor=Math.abs(Math.cos(a))<.1?"middle":Math.cos(a)>0?"start":"end"; return <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="11" fontFamily="DM Sans,sans-serif" fill="#64748b">{d.skill}</text>; })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   STATUS BADGE
════════════════════════════════════════════════════════════ */
function statusBadgeClass(s: CandidateStatus) {
  const m: Record<CandidateStatus,string> = {
    "Under Review":"ce-badge--review", "Screening":"ce-badge--screening",
    "Interview Scheduled":"ce-badge--interview", "Offer Sent":"ce-badge--offer",
    "Hired":"ce-badge--hired", "Rejected":"ce-badge--rejected",
  };
  return m[s] ?? "ce-badge--review";
}

const TABS = [
  { id:"overview", label:"Overview", icon:<BrainCircuit size={14}/> },
  { id:"skills",   label:"Skills",   icon:<Zap         size={14}/> },
  { id:"fairness", label:"Fairness", icon:<Shield      size={14}/> },
];

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CandidateEvaluation() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const [scrolled, setScrolled]     = useState(false);
  const [activeTab, setActiveTab]   = useState("overview");
  const [actionType, setActionType] = useState<ActionType>(null);
  const [status, setStatus]         = useState<CandidateStatus>("Under Review");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ── Interview form ──────────────────────────────────────
  const [ivType, setIvType]         = useState<InterviewType>("Technical");
  const [ivDate, setIvDate]         = useState("");
  const [ivLink, setIvLink]         = useState("");

  // ── Offer form ──────────────────────────────────────────
  const [offerSalary, setOfferSalary]       = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerNotes, setOfferNotes]         = useState("");

  // ── Hired form ──────────────────────────────────────────
  const [hireStartDate, setHireStartDate]   = useState("");

  // ── Reject form ─────────────────────────────────────────
  const [rejectReason, setRejectReason]     = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Form validation ─────────────────────────────────────
  const interviewValid = ivType && ivDate;
  const offerValid     = offerSalary && offerStartDate;
  const hireValid      = hireStartDate;
  const rejectValid    = rejectReason;

  // ── Submit handler ──────────────────────────────────────
  async function handleConfirm(newStatus: CandidateStatus) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      switch (actionType) {

        case "screening":
          // POST /candidates/:id/screening — no required body
          await getCandidateScreening(id);
          break;

        case "interview": {
          // POST /candidates/:id/interview
          // → creates interview record → appears in CompanyInterviews + ApplicantInterviews
          const payload = {
            type: ivType,
            scheduledAt:   ivDate,
            meetingLink:   ivLink || undefined,
          };
          await interviewCandidate(id, payload);
          break;
        }

        case "offer":
          // POST /candidates/:id/offer
          await offerCandidate(id, {
            offeredSalary: Number(offerSalary),
            startDate:     offerStartDate,
            notes:         offerNotes || undefined,
          });
          break;

        case "hired":
          // POST /candidates/:id/hire
          await hireCandidate(id, { startDate: hireStartDate });
          break;

        case "reject":
          // POST /candidates/:id/reject
          await rejectCandidate(id, { reason: rejectReason });
          break;
      }

      setStatus(newStatus);
      setActionType(null);
      // reset all form fields
      setIvType("Technical"); setIvDate(""); setIvLink("");
      setOfferSalary(""); setOfferStartDate(""); setOfferNotes("");
      setHireStartDate(""); setRejectReason("");

    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() { setActionType(null); setError(null); }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="ce-page">

      {/* HEADER */}
      <header className={`ce-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="ce-logo">H</div>
              <span className="ce-brand">Hakeem</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="ce-btn ce-btn--ghost" style={{ fontSize:".82rem",border:"1.5px solid var(--border)",borderRadius:10,padding:".4rem .9rem" }}
                onClick={() => navigate("/company")}>
                <ChevronLeft size={14}/> Pipeline
              </button>
              <button className="ce-btn ce-btn--ghost" style={{ fontSize:".82rem",border:"1.5px solid var(--border)",borderRadius:10,padding:".4rem .9rem" }}
                onClick={() => navigate("/")}>
                <LogOut size={14}/> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="ce-main">

        {/* Candidate hero */}
        <div className="ce-hero mb-4 au">
          <div className="d-flex flex-column flex-lg-row align-items-start justify-content-between gap-4">
            <div className="d-flex align-items-start gap-3">
              <div className="ce-avatar">AJ</div>
              <div>
                <h1 className="ce-candidate-name">Alex Johnson</h1>
                <p className="ce-candidate-title">Senior Software Engineer</p>
                <div className="ce-meta-row">
                  <span className="ce-meta-item"><Mail     size={13}/>alex.johnson@email.com</span>
                  <span className="ce-meta-item"><Phone    size={13}/>+1 (555) 987-6543</span>
                  <span className="ce-meta-item"><MapPin   size={13}/>San Francisco, CA</span>
                  <span className="ce-meta-item"><Calendar size={13}/>Applied 2 days ago</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-column align-items-start align-items-lg-end gap-2">
              <div className="ce-score-label">AI Match Score</div>
              <div className="ce-score-num">95%</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="ce-badge ce-badge--excellent">
                  <span className="ce-badge-dot" style={{ background:"var(--success)" }}/>Excellent Match
                </span>
                <span className={`ce-badge ${statusBadgeClass(status)}`}>
                  <span className="ce-badge-dot"/>{status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="row g-4 au d1">

          {/* LEFT: tabs */}
          <div className="col-12 col-lg-8">
            <div className="ce-tabs mb-3">
              {TABS.map((t) => (
                <button key={t.id} className={`ce-tab ${activeTab===t.id?"ce-tab--active":""}`}
                  onClick={() => setActiveTab(t.id)}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="d-flex flex-column gap-3">
                <div className="ce-card">
                  <div className="ce-card-header"><span className="ce-card-title"><BrainCircuit size={15} style={{ color:"var(--primary)" }}/>AI Match Analysis</span></div>
                  <div className="ce-card-body d-flex flex-column gap-3">
                    {scoreBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span style={{ fontSize:".85rem",fontWeight:500 }}>{item.label}</span>
                          <span style={{ fontSize:".83rem",fontWeight:700,color:"var(--primary)" }}>{item.score}%</span>
                        </div>
                        <div className="ce-track"><div className="ce-fill" style={{ "--w":`${item.score}%` } as React.CSSProperties}/></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ce-card">
                  <div className="ce-card-header"><span className="ce-card-title"><ClipboardList size={15}/>Semantic CV Matching</span></div>
                  <div className="ce-card-body d-flex flex-column gap-3">
                    <div className="ce-match-block ce-match-block--green">
                      <div className="ce-match-block-title"><CheckCircle size={15}/> Strong Matches (8/10)</div>
                      <div className="d-flex flex-wrap gap-2">{strongSkills.map((s) => <span key={s} className="ce-skill ce-skill--green">{s}</span>)}</div>
                    </div>
                    <div className="ce-match-block ce-match-block--amber">
                      <div className="ce-match-block-title"><AlertTriangle size={15}/> Partial Matches (2/10)</div>
                      <div className="d-flex flex-wrap gap-2">{partialSkills.map((s) => <span key={s} className="ce-skill ce-skill--amber">{s}</span>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="ce-card">
                <div className="ce-card-header"><span className="ce-card-title"><Zap size={15} style={{ color:"var(--primary)" }}/>Skills Radar</span></div>
                <div className="ce-card-body">
                  <RadarChartSVG data={skillsData}/>
                  <div className="d-flex align-items-center gap-4 justify-content-center mb-3" style={{ fontSize:".78rem",color:"var(--muted)" }}>
                    <span className="d-flex align-items-center gap-1"><span style={{ width:10,height:10,borderRadius:2,background:"rgba(79,70,229,.6)",display:"inline-block" }}/>Candidate</span>
                    <span className="d-flex align-items-center gap-1"><span style={{ width:10,height:10,borderRadius:2,background:"rgba(16,185,129,.45)",display:"inline-block" }}/>Required</span>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <p style={{ fontFamily:"Syne",fontWeight:700,fontSize:".88rem",marginBottom:".6rem" }}>Explicit Skills <span style={{ color:"var(--muted)",fontWeight:400 }}>(from CV)</span></p>
                      <div className="d-flex flex-wrap gap-2">{explicitSkills.map((s) => <span key={s} className="ce-skill ce-skill--primary">{s}</span>)}</div>
                    </div>
                    <div>
                      <p style={{ fontFamily:"Syne",fontWeight:700,fontSize:".88rem",marginBottom:".6rem" }}>Implicit Skills <span style={{ color:"var(--muted)",fontWeight:400 }}>(AI-detected)</span></p>
                      <div className="d-flex flex-wrap gap-2">{implicitSkills.map((s) => <span key={s} className="ce-skill ce-skill--muted">{s}</span>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fairness" && (
              <div className="ce-card">
                <div className="ce-card-header"><span className="ce-card-title"><Shield size={15} style={{ color:"var(--success)" }}/>Bias & Fairness Analysis</span></div>
                <div className="ce-card-body d-flex flex-column gap-3">
                  <div className="ce-notice ce-notice--green d-flex align-items-start gap-2">
                    <CheckCircle size={16} style={{ flexShrink:0,marginTop:1 }}/>
                    <div><strong style={{ display:"block",marginBottom:".2rem" }}>No Bias Detected</strong>Our AI analyzed this evaluation and found no indicators of bias related to protected characteristics.</div>
                  </div>
                  <p style={{ fontFamily:"Syne",fontWeight:700,fontSize:".88rem" }}>Fairness Metrics</p>
                  <div className="d-flex flex-column gap-2">
                    {fairnessMetrics.map((m) => (
                      <div key={m.name} className="ce-fairness-row">
                        <span>{m.name}</span>
                        <span className="ce-fairness-pass"><CheckCircle size={12}/>{m.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ce-notice ce-notice--blue"><strong>Transparency Note: </strong>This candidate was evaluated purely on technical skills, experience relevance, and cultural fit indicators.</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: actions */}
          <div className="col-12 col-lg-4 d-flex flex-column gap-4">
            <div className="ce-card">
              <div className="ce-card-header"><span className="ce-card-title"><TrendingUp size={15}/>Actions</span></div>
              <div className="ce-card-body d-flex flex-column gap-2">
                <button className="ce-action-btn ce-action-btn--warning"  onClick={() => setActionType("screening")}><UserCheck size={15}/> Move to Screening</button>
                <button className="ce-action-btn ce-action-btn--primary"  onClick={() => setActionType("interview")}><Video     size={15}/> Schedule Interview</button>
                <hr className="ce-action-divider"/>
                <button className="ce-action-btn ce-action-btn--success"  onClick={() => setActionType("offer")}><Gift      size={15}/> Send Offer</button>
                <button className="ce-action-btn ce-action-btn--hired"    onClick={() => setActionType("hired")}><Star      size={15}/> Mark as Hired</button>
                <hr className="ce-action-divider"/>
                <button className="ce-action-btn ce-action-btn--danger"   onClick={() => setActionType("reject")}><XCircle   size={15}/> Reject Candidate</button>
              </div>
            </div>

            <div className="ce-card">
              <div className="ce-card-header"><span className="ce-card-title"><User size={15}/>Quick Stats</span></div>
              <div className="ce-card-body d-flex flex-column gap-3">
                {[{ label:"Years of Experience",val:"7 years",sub:"" },{ label:"Previous Companies",val:"4",sub:"" },{ label:"Education",val:"BS CS",sub:"Stanford University" },{ label:"AI Match Score",val:"95%",sub:"Excellent match" }].map((s) => (
                  <div key={s.label}><div className="ce-stat-label">{s.label}</div><div className="ce-stat-val">{s.val}</div>{s.sub&&<div className="ce-stat-sub">{s.sub}</div>}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ══ MODALS ════════════════════════════════════════════ */}

      {/* Error banner — shown inside any open modal */}
      {/* (rendered via the modal body — see each modal's footer) */}

      {/* SCREENING */}
      <Modal open={actionType==="screening"} onClose={closeModal} title="Move to Screening" icon={<UserCheck size={15}/>} size="sm"
        footer={<>
          <button className="ce-btn ce-btn--ghost" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className="ce-btn ce-btn--primary" onClick={() => handleConfirm("Screening")} disabled={loading}>
            <UserCheck size={13}/>{loading ? "Saving…" : "Confirm"}
          </button>
        </>}>
        <div className="ce-notice ce-notice--amber">
          This will move <strong>Alex Johnson</strong> to the Screening stage. The candidate will be notified.
        </div>
        {error && <p style={{ color:"var(--danger)",fontSize:".8rem",marginTop:".6rem" }}>{error}</p>}
      </Modal>

      {/* INTERVIEW */}
      <Modal open={actionType==="interview"} onClose={closeModal} title="Schedule Interview" icon={<Video size={15}/>} size="md"
        footer={<>
          <button className="ce-btn ce-btn--ghost" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className="ce-btn ce-btn--primary" onClick={() => handleConfirm("Interview Scheduled")}
            disabled={!interviewValid || loading} style={{ opacity:interviewValid&&!loading?1:.45 }}>
            <Video size={13}/>{loading ? "Scheduling…" : "Confirm & Notify"}
          </button>
        </>}>
        <div className="row g-3">
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Interview Type</label>
              <select className="ce-select" value={ivType} onChange={(e) => setIvType(e.target.value as InterviewType)}>
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
                <option value="Final">Final Interview</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Date & Time <span style={{ color:"var(--danger)" }}>*</span></label>
              <input className="ce-input" type="datetime-local" value={ivDate} onChange={(e) => setIvDate(e.target.value)}/>
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Meeting Link (optional)</label>
              <input className="ce-input" type="url" placeholder="https://meet.google.com/…" value={ivLink} onChange={(e) => setIvLink(e.target.value)}/>
            </div>
          </div>
        </div>
        {error && <p style={{ color:"var(--danger)",fontSize:".8rem",marginTop:".6rem" }}>{error}</p>}
      </Modal>

      {/* OFFER */}
      <Modal open={actionType==="offer"} onClose={closeModal} title="Send Offer" icon={<Gift size={15}/>} size="md"
        footer={<>
          <button className="ce-btn ce-btn--ghost" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className="ce-btn ce-btn--success" onClick={() => handleConfirm("Offer Sent")}
            disabled={!offerValid||loading} style={{ opacity:offerValid&&!loading?1:.45 }}>
            <Gift size={13}/>{loading?"Sending…":"Send Offer"}
          </button>
        </>}>
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <div className="ce-field">
              <label className="ce-label">Offered Salary <span style={{ color:"var(--danger)" }}>*</span></label>
              <input className="ce-input" type="number" placeholder="e.g. 150000" value={offerSalary} onChange={(e) => setOfferSalary(e.target.value)}/>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="ce-field">
              <label className="ce-label">Start Date <span style={{ color:"var(--danger)" }}>*</span></label>
              <input className="ce-input" type="date" value={offerStartDate} onChange={(e) => setOfferStartDate(e.target.value)}/>
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Offer Notes</label>
              <textarea className="ce-textarea" placeholder="Include benefits, role details…" value={offerNotes} onChange={(e) => setOfferNotes(e.target.value)}/>
            </div>
          </div>
        </div>
        {error && <p style={{ color:"var(--danger)",fontSize:".8rem",marginTop:".6rem" }}>{error}</p>}
      </Modal>

      {/* HIRED */}
      <Modal open={actionType==="hired"} onClose={closeModal} title="Mark as Hired" icon={<Star size={15}/>} size="sm"
        footer={<>
          <button className="ce-btn ce-btn--ghost" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className="ce-btn ce-btn--success" onClick={() => handleConfirm("Hired")}
            disabled={!hireValid||loading} style={{ opacity:hireValid&&!loading?1:.45 }}>
            <Star size={13}/>{loading?"Saving…":"Confirm Hire"}
          </button>
        </>}>
        <div className="ce-notice ce-notice--green">
          You're marking <strong>Alex Johnson</strong> as <strong>Hired</strong>. This will close the application and update the pipeline.
        </div>
        <div className="ce-field mt-3">
          <label className="ce-label">Start Date <span style={{ color:"var(--danger)" }}>*</span></label>
          <input className="ce-input" type="date" value={hireStartDate} onChange={(e) => setHireStartDate(e.target.value)}/>
        </div>
        {error && <p style={{ color:"var(--danger)",fontSize:".8rem",marginTop:".6rem" }}>{error}</p>}
      </Modal>

      {/* REJECT */}
      <Modal open={actionType==="reject"} onClose={closeModal} title="Reject Candidate" icon={<XCircle size={15}/>} size="sm"
        footer={<>
          <button className="ce-btn ce-btn--ghost" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className="ce-btn ce-btn--danger" onClick={() => handleConfirm("Rejected")}
            disabled={!rejectValid||loading} style={{ opacity:rejectValid&&!loading?1:.45 }}>
            <XCircle size={13}/>{loading?"Rejecting…":"Confirm Rejection"}
          </button>
        </>}>
        <div className="d-flex flex-column gap-3">
          <div className="ce-field">
            <label className="ce-label">Reason <span style={{ color:"var(--danger)" }}>*</span></label>
            <select className="ce-select" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="Not enough experience">Not enough experience</option>
              <option value="Skill mismatch">Skill mismatch</option>
              <option value="Culture fit concerns">Culture fit concerns</option>
              <option value="Position filled">Position filled</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="ce-notice ce-notice--amber">The candidate will receive an automated rejection email.</div>
        </div>
        {error && <p style={{ color:"var(--danger)",fontSize:".8rem",marginTop:".6rem" }}>{error}</p>}
      </Modal>

    </div>
  );
}