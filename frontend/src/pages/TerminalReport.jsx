import { useState, useRef, useEffect } from "react";

const SCHOOL_LOGO = "data:image/jpeg;base64,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";

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

// ─── API helper ───────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  const [students, setStudents]   = useState([]);
  const [form, setForm]           = useState({ studentId: "", term: "Term 1", academicYear: new Date().getFullYear().toString() });
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [headComment, setHeadComment]       = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftInfo, setDraftInfo]   = useState(null);
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
          <img src={SCHOOL_LOGO} alt="School Logo" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${GOLD}` }} />
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
        <div className="no-print" style={{ background: "#fff", borderRadius: 10, border: `1px solid #c8e6c9`, padding: "20px 24px", marginBottom: 24, boxShadow: "0 2px 8px rgba(26,107,46,0.07)" }}>
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

            {/* ── Top gold stripe ── */}
            <div style={{ height: 8, background: `linear-gradient(90deg, ${GREEN}, ${GOLD}, ${GREEN})` }} />

            {/* ── School header ── */}
            <div style={{ padding: "20px 32px 16px", borderBottom: `2px solid ${GOLD}`, display: "flex", alignItems: "center", gap: 20 }}>
              <img src={SCHOOL_LOGO} alt="Logo" style={{ width: 80, height: 80, objectFit: "contain" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: GREEN, textTransform: "uppercase", letterSpacing: 1 }}>
                  Akatsi Senior High Technical School
                </h2>
                <p style={{ margin: "4px 0 2px", fontSize: 12, color: "#555" }}>
                  P.O. Box 88, Akatsi, Volta Region, Ghana &nbsp;|&nbsp; Tel: +233 54 539 2821
                </p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: GOLD, fontStyle: "italic", letterSpacing: 1 }}>
                  "Go Forth and Shine"
                </p>
              </div>
              <div style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ background: GREEN, color: "#fff", borderRadius: 8, padding: "8px 14px", display: "inline-block" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{report.summary.overallGrade}</div>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>Overall</div>
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
                <div style={{ background: LGREEN, borderRadius: 8, padding: "14px 18px", border: `1px solid #c8e6c9` }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid #c8e6c9`, paddingBottom: 6 }}>Student Information</p>
                  {[
                    ["Full Name",   report.student.name],
                    ["Student ID",  report.student.studentId],
                    ["Gender",      report.student.gender ? report.student.gender.charAt(0).toUpperCase() + report.student.gender.slice(1) : "—"],
                    ["Parent/Guardian", report.student.parentName || "—"],
                    ["Contact",     report.student.parentPhone || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#555" }}>{k}:</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: LGOLD, borderRadius: 8, padding: "14px 18px", border: `1px solid #e9d88a` }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#7a5c00", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid #e9d88a`, paddingBottom: 6 }}>Academic Information</p>
                  {[
                    ["Class",         report.class ? `${report.class.name} (${report.class.grade}${report.class.section})` : "—"],
                    ["Class Teacher", report.class?.teacher || "—"],
                    ["Class Size",    report.class?.classSize ?? "—"],
                    ["Position",      report.summary.position ? `${ordinal(report.summary.position)} out of ${report.summary.classSize}` : "—"],
                    ["Average Score", `${report.summary.average}%`],
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
                <div style={{ border: `1px solid #c8e6c9`, borderRadius: 8, padding: "14px 16px", background: LGREEN }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Class Teacher's Comment</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", minHeight: 44, lineHeight: 1.6 }}>
                    {teacherComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 16, borderTop: `1px solid #c8e6c9`, paddingTop: 8 }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Signature: ___________________________</p>
                  </div>
                </div>
                <div style={{ border: `1px solid #e9d88a`, borderRadius: 8, padding: "14px 16px", background: LGOLD }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#7a5c00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Head Teacher's Comment</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#374151", minHeight: 44, lineHeight: 1.6 }}>
                    {headComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 16, borderTop: `1px solid #e9d88a`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Signature: ___________________________</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#888" }}>Date: ____________</p>
                  </div>
                </div>
              </div>

              {/* ── Grading Key ── */}
              <div style={{ background: LGREEN, borderRadius: 8, padding: "12px 18px", border: `1px solid #c8e6c9`, marginBottom: 16 }}>
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

            {/* ── Bottom gold stripe ── */}
            <div style={{ height: 8, background: `linear-gradient(90deg, ${GREEN}, ${GOLD}, ${GREEN})` }} />

          </div>
        )}
      </div>
    </div>
  );
}
