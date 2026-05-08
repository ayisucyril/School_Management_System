import { useState, useRef, useEffect } from "react";

// ─── Grade color helper ───────────────────────────────────────────────────────
function gradeColor(grade) {
  if (!grade) return "#6b7280";
  if (grade.startsWith("A")) return "#16a34a";
  if (grade.startsWith("B")) return "#2563eb";
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

// ─── Print styles injected into <head> at runtime ────────────────────────────
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #report-preview, #report-preview * { visibility: visible !important; }
  #report-preview { position: fixed; inset: 0; background: white; padding: 24px; }
  .no-print { display: none !important; }
}
`;

// ─── API helper ───────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function TerminalReport() {
  const token = localStorage.getItem("token");

  const [students, setStudents]   = useState([]);
  const [form, setForm]           = useState({ studentId: "", term: "Term 1", academicYear: new Date().getFullYear().toString() });
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [headComment, setHeadComment]       = useState("");
  const printRef = useRef();

  // Load students on mount
  useEffect(() => {
    apiFetch("/students?status=active", token)
      .then(d => setStudents(d.students || []))
      .catch(() => {});

    // Inject print CSS once
    const style = document.createElement("style");
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  async function handleGenerate() {
    if (!form.studentId) { setError("Please select a student."); return; }
    setError(""); setLoading(true); setReport(null);
    try {
      const params = new URLSearchParams(form).toString();
      const data = await apiFetch(`/reports/terminal?${params}`, token);
      setReport(data.report);
      setTeacherComment("");
      setHeadComment("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const f = form;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#111827", minHeight: "100vh", background: "#f9fafb" }}>

      {/* ── Page header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Terminal Report Card</h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Generate and print end-of-term reports for students</p>
        </div>
        {report && (
          <button className="no-print" onClick={handlePrint} style={{
            background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}>
            🖨 Print / Save PDF
          </button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── Form card ── */}
        <div className="no-print" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "24px", marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Generate report</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            {/* Student select */}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Student</label>
              <select
                value={f.studentId}
                onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" }}
              >
                <option value="">— Select student —</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Term</label>
              <select
                value={f.term}
                onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" }}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Academic year</label>
              <input
                type="text"
                value={f.academicYear}
                onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
                placeholder="e.g. 2025"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                background: loading ? "#9ca3af" : "#111827", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap"
              }}
            >
              {loading ? "Loading…" : "Generate"}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Comments (no-print form, but printed inline on report) ── */}
        {report && (
          <div className="no-print" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comments</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Class teacher's comment</label>
                <textarea
                  rows={3} value={teacherComment}
                  onChange={e => setTeacherComment(e.target.value)}
                  placeholder="Enter comment…"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Head teacher's comment</label>
                <textarea
                  rows={3} value={headComment}
                  onChange={e => setHeadComment(e.target.value)}
                  placeholder="Enter comment…"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══ REPORT PREVIEW (also the print target) ══════════════════════════ */}
        {report && (
          <div id="report-preview" ref={printRef} style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
            overflow: "hidden", fontFamily: "'Segoe UI', system-ui, sans-serif"
          }}>

            {/* Header band */}
            <div style={{ background: "#1e3a5f", color: "#fff", padding: "28px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                    🎓 School Management System
                  </h2>
                  <p style={{ margin: "6px 0 0", fontSize: 15, opacity: 0.8 }}>
                    Terminal Report Card — {report.term} · {report.academicYear}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.15)", borderRadius: 10,
                    padding: "10px 18px", display: "inline-block"
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{report.summary.overallGrade}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Overall grade</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "28px 36px" }}>

              {/* ── Student & Class info ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Student information</p>
                  {[
                    ["Full name",   report.student.name],
                    ["Student ID",  report.student.studentId],
                    ["Gender",      report.student.gender || "—"],
                    ["Parent",      report.student.parentName || "—"],
                    ["Contact",     report.student.parentPhone || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "#64748b" }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Academic information</p>
                  {[
                    ["Class",          report.class ? `${report.class.name} (${report.class.grade}${report.class.section})` : "—"],
                    ["Class teacher",  report.class?.teacher || "—"],
                    ["Class size",     report.class?.classSize ?? "—"],
                    ["Position",       report.summary.position ? `${ordinal(report.summary.position)} out of ${report.summary.classSize}` : "—"],
                    ["Average score",  `${report.summary.average}%`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "#64748b" }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Subject scores table ── */}
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject performance</p>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#1e3a5f", color: "#fff" }}>
                    {["Subject", "Score", "Grade", "Remark", "Teacher"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.subjects.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 500 }}>{s.subject}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 99 }}>
                            <div style={{ width: `${s.score}%`, height: "100%", background: gradeColor(s.grade), borderRadius: 99 }} />
                          </div>
                          <span style={{ fontWeight: 600, minWidth: 36 }}>{s.score}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          background: gradeBg(s.grade), color: gradeColor(s.grade),
                          fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 99
                        }}>{s.grade}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#6b7280" }}>{s.remarks || s.label}</td>
                      <td style={{ padding: "10px 14px", color: "#6b7280" }}>{s.teacher || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f1f5f9", borderTop: "2px solid #e2e8f0" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700 }}>Overall</td>
                    <td style={{ padding: "10px 14px", fontWeight: 700 }}>{report.summary.average}%</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        background: gradeBg(report.summary.overallGrade),
                        color: gradeColor(report.summary.overallGrade),
                        fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 99
                      }}>{report.summary.overallGrade}</span>
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{report.summary.overallLabel}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>

              {/* ── Attendance ── */}
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Attendance summary</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                {[
                  { label: "Days present", value: report.attendance.daysPresent, color: "#16a34a", bg: "#dcfce7" },
                  { label: "Days absent",  value: report.attendance.daysAbsent,  color: "#dc2626", bg: "#fee2e2" },
                  { label: "Days late",    value: report.attendance.daysLate,    color: "#d97706", bg: "#fef3c7" },
                  { label: "Attendance %", value: report.attendance.attendancePct != null ? `${report.attendance.attendancePct}%` : "—", color: "#2563eb", bg: "#dbeafe" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ background: bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value ?? "—"}</div>
                    <div style={{ fontSize: 11, color, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* ── Comments ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Class teacher's comment</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", minHeight: 48 }}>
                    {teacherComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Signature: ___________________________</p>
                  </div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Head teacher's comment</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", minHeight: 48 }}>
                    {headComment || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No comment added.</span>}
                  </p>
                  <div style={{ marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Signature: ___________________________  &nbsp; Date: __________</p>
                  </div>
                </div>
              </div>

              {/* ── Grade key ── */}
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 20px", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grading key</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { range: "90–100", grade: "A+", label: "Outstanding" },
                    { range: "80–89",  grade: "A",  label: "Excellent" },
                    { range: "70–79",  grade: "B+", label: "Very Good" },
                    { range: "60–69",  grade: "B",  label: "Good" },
                    { range: "50–59",  grade: "C",  label: "Average" },
                    { range: "40–49",  grade: "D",  label: "Below Average" },
                    { range: "0–39",   grade: "F",  label: "Fail" },
                  ].map(({ range, grade, label }) => (
                    <div key={grade} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <span style={{
                        background: gradeBg(grade), color: gradeColor(grade),
                        fontWeight: 700, padding: "2px 8px", borderRadius: 99, fontSize: 11
                      }}>{grade}</span>
                      <span style={{ color: "#6b7280" }}>{range} — {label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
                Generated on {new Date(report.generatedAt).toLocaleString()} · School Management System
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
