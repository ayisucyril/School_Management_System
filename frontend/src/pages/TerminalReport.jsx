import { useState, useRef, useEffect } from "react";

// ─── Grade color helper ───────────────────────────────────────────────────────
function gradeColor(grade) {
  if (!grade) return "#6b7280";
  if (grade.startsWith("A")) return "#16a34a";
  if (grade.startsWith("B")) return "#1d6fb5";
  if (grade === "C")         return "#7c3aed";
  if (grade === "D")         return "#d97706";
  return "#dc2626";
}

function gradeBg(grade) {
  if (!grade) return "#f3f4f6";
  if (grade.startsWith("A")) return "#dcfce7";
  if (grade.startsWith("B")) return "#dbeafe";
  if (grade === "C")         return "#ede9fe";
  if (grade === "D")         return "#fef3c7";
  return "#fee2e2";
}

function ordinal(n) {
  if (!n) return "—";
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Print styles ─────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #report-preview, #report-preview * { visibility: visible !important; }
  #report-preview { position: fixed; inset: 0; background: white; padding: 16px; }
  .no-print { display: none !important; }
  @page { size: A4; margin: 10mm; }
}
`;

// ─── API base ─────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND = API.replace("/api", "");
const LOGO_URL = `${BACKEND}/uploads/akast.jpg`;

async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    method: options.method || "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: options.body || undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREEN  = "#1a6b2e";
const GOLD   = "#d4a017";
const LGREEN = "#e8f5ec";
const LGOLD  = "#fdf6e3";

// ══════════════════════════════════════════════════════════════════════════════
export default function TerminalReport() {
  const token = localStorage.getItem("school_token");

  const [students, setStudents]             = useState([]);
  const [form, setForm]                     = useState({ studentId: "", term: "Term 1", academicYear: new Date().getFullYear().toString() });
  const [report, setReport]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [headComment, setHeadComment]       = useState("");
  const [draftSaved, setDraftSaved]         = useState(false);
  const [draftInfo, setDraftInfo]           = useState(null);
  const printRef = useRef();

  useEffect(() => {
    apiFetch("/students?status=active", token)
      .then(d => setStudents(d.students || []))
      .catch(() => {});
    const style = document.createElement("style");
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!form.studentId || !form.term || !form.academicYear) return;
    apiFetch(`/reports/terminal/draft?studentId=${form.studentId}&term=${encodeURIComponent(form.term)}&academicYear=${form.academicYear}`, token)
      .then(d => {
        if (d.draft) {
          setTeacherComment(d.draft.teacherComment || "");
          setHeadComment(d.draft.headComment || "");
          setDraftInfo(d.draft);
        } else {
          setDraftInfo(null);
        }
      }).catch(() => {});
  }, [form.studentId, form.term, form.academicYear]);

  async function handleGenerate() {
    if (!form.studentId) { setError("Please select a student."); return; }
    setError(""); setLoading(true); setReport(null);
    try {
      const params = new URLSearchParams(form).toString();
      const data = await apiFetch(`/reports/terminal?${params}`, token);
      setReport(data.report);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleSaveDraft() {
    if (!form.studentId) { setError("Please select a student first."); return; }
    try {
      await apiFetch("/reports/terminal/draft", token, {
        method: "POST",
        body: JSON.stringify({ ...form, teacherComment, headComment }),
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) { setError(e.message); }
  }

  const f = form;

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#1a1a1a", minHeight: "100vh", background: "#f4f7f4" }}>

      {/* ── Page header ── */}
      <div className="no-print" style={{ background: GREEN, color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO_URL} alt="School Logo" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${GOLD}`, objectFit: "cover" }} />
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>Akatsi Senior High Technical School</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>Terminal Report Card Management</p>
          </div>
        </div>
        {report && (
          <button className="no-print" onClick={() => window.print()} style={{
            background: GOLD, color: "#1a1a1a", border: "none", borderRadius: 7,
            padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}>
            🖨 Print / Save PDF
          </button>
        )}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Form card ── */}
        <div className="no-print" style={{ background: "#fff", borderRadius: 10, border: "1px solid #c8e6c9", padding: "20px 24px", marginBottom: 24, boxShadow: "0 2px 8px rgba(26,107,46,0.07)" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Generate Terminal Report</p>

          {draftInfo && (
            <div style={{ marginBottom: 12, background: LGOLD, border: `1px solid ${GOLD}`, borderRadius: 7, padding: "8px 14px", fontSize: 13, color: "#7a5c00" }}>
              📝 Draft saved on {new Date(draftInfo.savedAt).toLocaleString()} — comments restored.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Student</label>
              <select value={f.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #c8e6c9", fontSize: 13, background: "#fff" }}>
                <option value="">— Select student —</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Term</label>
              <select value={f.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #c8e6c9", fontSize: 13, background: "#fff" }}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Academic Year</label>
              <input type="text" value={f.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
                placeholder="e.g. 2025"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #c8e6c9", fontSize: 13 }} />
            </div>
            <button onClick={handleGenerate} disabled={loading} style={{
              background: loading ? "#9ca3af" : GREEN, color: "#fff", border: "none",
              borderRadius: 7, padding: "10px 18px", fontSize: 13, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap"
            }}>{loading ? "Loading…" : "Generate"}</button>
            <button onClick={handleSaveDraft} style={{
              background: draftSaved ? "#16a34a" : LGOLD,
              color: draftSaved ? "#fff" : "#7a5c00",
              border: `1px solid ${GOLD}`, borderRadius: 7, padding: "10px 18px",
              fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
            }}>{draftSaved ? "✅ Saved!" : "💾 Save Draft"}</button>
          </div>

          {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "9px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* ── Comments editor ── */}
        {report && (
          <div className="no-print" style={{ background: "#fff", borderRadius: 10, border: "1px solid #c8e6c9", padding: "18px 24px", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Comments</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Class Teacher's Comment</label>
                <textarea rows={3} value={teacherComment} onChange={e => setTeacherComment(e.target.value)}
                  placeholder="Enter comment…" style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #c8e6c9", fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Head Teacher's Comment</label>
                <textarea rows={3} value={headComment} onChange={e => setHeadComment(e.target.value)}
                  placeholder="Enter comment…" style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #c8e6c9", fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        )}

        {/* ══ REPORT PREVIEW ══════════════════════════════════════════════════ */}
        {report && (
          <div id="report-preview" ref={printRef} style={{
            background: "#fff", borderRadius: 10,
            border: `2px solid ${GREEN}`, overflow: "hidden",
            fontFamily: "'Georgia', serif", fontSize: 13,
          }}>

            {/* ── Top stripe ── */}
            <div style={{ height: 8, background: `linear-gradient(90deg, ${GREEN}, ${GOLD}, ${GREEN})` }} />

            {/* ── School header ── */}
            <div style={{ padding: "20px 32px 16px", borderBottom: `2px solid ${GOLD}`, display: "flex", alignItems: "center", gap: 20 }}>
              <img
                src={LOGO_URL}
                alt="Akatsi SHTS Logo"
                style={{ width: 90, height: 90, objectFit: "contain", flexShrink: 0 }}
                onError={e => { e.target.style.display = "none"; }}
              />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Republic of Ghana</div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: GREEN, textTransform: "uppercase", letterSpacing: 1 }}>
                  Akatsi Senior High Technical School
                </h2>
                <p style={{ margin: "2px 0", fontSize: 12, color: "#555" }}>
                  P.O. Box 88, Akatsi, Volta Region, Ghana
                </p>
                <p style={{ margin: "2px 0", fontSize: 12, color: "#555" }}>
                  Tel: +233 54 539 2821
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: GOLD, fontStyle: "italic", letterSpacing: 1 }}>
                  "Go Forth and Shine"
                </p>
              </div>
              <div style={{ textAlign: "center", minWidth: 80, flexShrink: 0 }}>
                <div style={{ background: GREEN, borderRadius: 8, padding: "10px 16px", display: "inline-block", border: `2px solid ${GOLD}` }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: GOLD }}>{report.summary.overallGrade}</div>
                  <div style={{ fontSize: 10, color: "#fff", marginTop: 2 }}>Overall Grade</div>
                </div>
              </div>
            </div>

            {/* ── Report title band ── */}
            <div style={{ background: GREEN, color: "#fff", padding: "8px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Terminal Report Card</span>
              <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>{report.term} &nbsp;·&nbsp; Academic Year: {report.academicYear}</span>
            </div>

            <div style={{ padding: "20px 32px" }}>

              {/* ── Student & Academic info ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ background: LGREEN, borderRadius: 8, padding: "14px 18px", border: "1px solid #c8e6c9" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #c8e6c9", paddingBottom: 6 }}>Student Information</p>
                  {[
                    ["Full Name",       report.student.name],
                    ["Student ID",      report.student.studentId],
                    ["Gender",          report.student.gender ? report.student.gender.charAt(0).toUpperCase() + report.student.gender.slice(1) : "—"],
                    ["Parent/Guardian", report.student.parentName || "—"],
                    ["Contact",         report.student.parentPhone || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#555" }}>{k}:</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: LGOLD, borderRadius: 8, padding: "14px 18px", border: "1px solid #e9d88a" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#7a5c00", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e9d88a", paddingBottom: 6 }}>Academic Information</p>
                  {[
                    ["Class",          report.class ? `${report.class.name} (${report.class.grade}${report.class.section})` : "—"],
                    ["Class Teacher",  report.class?.teacher || "—"],
                    ["Class Size",     report.class?.classSize ?? "—"],
                    ["Position",       report.summary.position ? `${ordinal(report.summary.position)} out of ${report.summary.classSize}` : "—"],
                    ["Average Score",  `${report.summary.average}%`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#7a5c00" }}>{k}:</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Subject scores table ── */}
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject Performance</p>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: GREEN, color: "#fff" }}>
                    {["Subject", "Score", "Grade", "Remark", "Teacher"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.subjects.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : LGREEN, borderBottom: "1px solid #e2f0e4" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.subject}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 99 }}>
                            <div style={{ width: `${s.score}%`, height: "100%", background: gradeColor(s.grade), borderRadius: 99 }} />
                          </div>
                          <span style={{ fontWeight: 700, minWidth: 36 }}>{s.score}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ background: gradeBg(s.grade), color: gradeColor(s.grade), fontWeight: 700, fontSize: 11, padding: "2px 9px", borderRadius: 99, border: `1px solid ${gradeColor(s.grade)}33` }}>{s.grade}</span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#555" }}>{s.remarks || s.label}</td>
                      <td style={{ padding: "8px 12px", color: "#555" }}>{s.teacher || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: GREEN, color: "#fff" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 700, fontSize: 12 }}>OVERALL</td>
                    <td style={{ padding: "9px 12px", fontWeight: 700, color: GOLD }}>{report.summary.average}%</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ background: GOLD, color: "#1a1a1a", fontWeight: 700, fontSize: 11, padding: "2px 9px", borderRadius: 99 }}>{report.summary.overallGrade}</span>
                    </td>
                    <td style={{ padding: "9px 12px", fontWeight: 600, color: GOLD }}>{report.summary.overallLabel}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>

              {/* ── Attendance ── */}
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Attendance Summary</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Days Present", value: report.attendance.daysPresent, color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
                  { label: "Days Absent",  value: report.attendance.daysAbsent,  color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
                  { label: "Days Late",    value: report.attendance.daysLate,    color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
                  { label: "Attendance %", value: report.attendance.attendancePct != null ? `${report.attendance.attendancePct}%` : "—", color: GREEN, bg: LGREEN, border: "#a7d7b1" },
                ].map(({ label, value, color, bg, border }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value ?? "—"}</div>
                    <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* ── Comments ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ border: "1px solid #c8e6c9", borderRadius: 8, padding: "14px 16px", background: LGREEN }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Class Teacher's Comment</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", minHeight: 44, lineHeight: 1.6 }}>
                    {teacherComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 16, borderTop: "1px solid #c8e6c9", paddingTop: 8 }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Signature: ___________________________</p>
                  </div>
                </div>
                <div style={{ border: "1px solid #e9d88a", borderRadius: 8, padding: "14px 16px", background: LGOLD }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#7a5c00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Head Teacher's Comment</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", minHeight: 44, lineHeight: 1.6 }}>
                    {headComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 16, borderTop: "1px solid #e9d88a", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Signature: ___________________________</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Date: ____________</p>
                  </div>
                </div>
              </div>

              {/* ── Grading Key ── */}
              <div style={{ background: LGREEN, borderRadius: 8, padding: "12px 18px", border: "1px solid #c8e6c9", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Grading Key</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { range: "90–100", grade: "A+", label: "Outstanding" },
                    { range: "80–89",  grade: "A",  label: "Excellent" },
                    { range: "70–79",  grade: "B+", label: "Very Good" },
                    { range: "60–69",  grade: "B",  label: "Good" },
                    { range: "50–59",  grade: "C",  label: "Average" },
                    { range: "40–49",  grade: "D",  label: "Below Average" },
                    { range: "0–39",   grade: "F",  label: "Fail" },
                  ].map(({ range, grade, label }) => (
                    <div key={grade} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                      <span style={{ background: gradeBg(grade), color: gradeColor(grade), fontWeight: 700, padding: "2px 7px", borderRadius: 99, fontSize: 10, border: `1px solid ${gradeColor(grade)}44` }}>{grade}</span>
                      <span style={{ color: "#555" }}>{range} — {label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{ borderTop: `2px solid ${GREEN}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: 10, color: GREEN, fontWeight: 700, fontStyle: "italic" }}>Akatsi Senior High Technical School — "Go Forth and Shine"</p>
              </div>

            </div>

            {/* ── Bottom stripe ── */}
            <div style={{ height: 8, background: `linear-gradient(90deg, ${GREEN}, ${GOLD}, ${GREEN})` }} />

          </div>
        )}
      </div>
    </div>
  );
}
