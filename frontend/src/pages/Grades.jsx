import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, BarChart3, Trash2, ChevronLeft, User } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const gradeColor = g => {
  if (!g) return 'badge-gray';
  if (g === 'A+' || g === 'A') return 'badge-green';
  if (g === 'B+' || g === 'B') return 'badge-yellow';
  if (g === 'C') return 'text-blue-400 bg-blue-500/15 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium';
  return 'badge-red';
};

const gradeColorHex = g => {
  if (!g) return '#6b7280';
  if (g === 'A+' || g === 'A') return '#16a34a';
  if (g === 'B+' || g === 'B') return '#eab308';
  if (g === 'C') return '#3b82f6';
  if (g === 'D') return '#f97316';
  return '#ef4444';
};

// ─── Student detail view ──────────────────────────────────────────────────────
const StudentGrades = ({ student, grades, filterTerm, onBack, onDelete }) => {
  const filtered = filterTerm ? grades.filter(g => g.term === filterTerm) : grades;
  const avg = filtered.length
    ? Math.round(filtered.reduce((s, g) => s + g.score, 0) / filtered.length)
    : null;

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
      {/* Back button + student header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {student.name[0]}
          </div>
          <div>
            <h2 className="text-white font-heading font-semibold text-base">{student.name}</h2>
            <p className="text-white/40 text-xs font-mono">{student.studentId} · {student.classId?.name || '—'}</p>
          </div>
        </div>
        {avg !== null && (
          <div className="ml-auto flex items-center gap-2 glass-green px-3 py-1.5">
            <span className="text-white/50 text-xs">Average:</span>
            <span className="text-primary font-bold text-sm">{avg}%</span>
          </div>
        )}
      </div>

      {/* Grades table for this student */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Subject', 'Score', 'Grade', 'Term', 'Year', 'Remarks', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <BarChart3 size={32} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No grades for {filterTerm || 'any term'}</p>
                </td></tr>
              ) : filtered.map((g, i) => (
                <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }} className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: gradeColorHex(g.grade) }} />
                      <span className="text-white/80 text-sm font-medium">{g.subject}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${g.score}%`, background: gradeColorHex(g.grade) }} />
                      </div>
                      <span className="font-mono font-bold text-white text-sm">{g.score}<span className="text-white/30 text-xs">%</span></span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className={gradeColor(g.grade)}>{g.grade}</span></td>
                  <td className="py-3 px-4 text-white/50 text-xs">{g.term}</td>
                  <td className="py-3 px-4 text-white/40 text-xs">{g.academicYear}</td>
                  <td className="py-3 px-4 text-white/40 text-xs">{g.remarks || '—'}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => onDelete(g._id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Grades component ────────────────────────────────────────────────────
const Grades = () => {
  const [grades, setGrades]       = useState([]);
  const [students, setStudents]   = useState([]);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // student object when drilling in
  const [form, setForm]           = useState({
    studentId: '', subject: '', score: '',
    term: 'Term 1', academicYear: new Date().getFullYear().toString(), remarks: ''
  });
  const [classSubjects, setClassSubjects] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [filterTerm, setFilterTerm] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/grades', { params: { term: filterTerm || undefined } }).then(r => setGrades(r.data.grades || [])),
      api.get('/students').then(r => setStudents(r.data.students || [])),
      api.get('/classes').then(r => setClasses(r.data.classes || [])),
    ]).finally(() => setLoading(false));
  }, [filterTerm]);

  const handleStudentChange = studentId => {
    setForm(p => ({ ...p, studentId, subject: '' }));
    if (!studentId) { setClassSubjects([]); return; }
    const student = students.find(s => s._id === studentId);
    const classId = student?.classId?._id || student?.classId;
    const cls = classes.find(c => c._id === classId);
    setClassSubjects(cls?.subjects || []);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/grades', form);
      setGrades(gs => [res.data.grade, ...gs]);
      toast.success('Grade recorded');
      setShowForm(false);
      setForm({ studentId: '', subject: '', score: '', term: 'Term 1', academicYear: new Date().getFullYear().toString(), remarks: '' });
      setClassSubjects([]);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this grade?')) return;
    try {
      await api.delete(`/grades/${id}`);
      setGrades(gs => gs.filter(g => g._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  // Group grades by student
  const gradesByStudent = grades.reduce((acc, g) => {
    const id = g.studentId?._id || g.studentId;
    if (!id) return acc;
    if (!acc[id]) acc[id] = { student: g.studentId, grades: [] };
    acc[id].grades.push(g);
    return acc;
  }, {});

  const studentRows = Object.values(gradesByStudent);

  // If a student is selected, show their detail view
  if (selectedStudent) {
    const studentGrades = grades.filter(g => {
      const id = g.studentId?._id || g.studentId;
      return id === selectedStudent._id;
    });
    return (
      <div className="space-y-5">
        {/* Term filter stays visible */}
        <div className="flex gap-2">
          {['', 'Term 1', 'Term 2', 'Term 3'].map(t => (
            <button key={t} onClick={() => setFilterTerm(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${filterTerm === t ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
              {t || 'All Terms'}
            </button>
          ))}
        </div>
        <StudentGrades
          student={selectedStudent}
          grades={studentGrades}
          filterTerm={filterTerm}
          onBack={() => setSelectedStudent(null)}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Grades</h1>
          <p className="text-white/40 text-sm mt-0.5">{grades.length} records · {studentRows.length} students</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Grade
        </button>
      </div>

      {/* Term filter */}
      <div className="flex gap-2">
        {['', 'Term 1', 'Term 2', 'Term 3'].map(t => (
          <button key={t} onClick={() => setFilterTerm(t)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${filterTerm === t ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
            {t || 'All Terms'}
          </button>
        ))}
      </div>

      {/* Grade form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white">Record Grade</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Student *</label>
                <select value={form.studentId} onChange={e => handleStudentChange(e.target.value)} className="input-field" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">
                  Subject *
                  {classSubjects.length > 0 && <span className="ml-2 text-primary/60">({classSubjects.length} available)</span>}
                </label>
                {classSubjects.length > 0 ? (
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field" required>
                    <option value="">Select Subject</option>
                    {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder={form.studentId ? "No subjects set — type manually" : "Select a student first"}
                    className="input-field" required />
                )}
                {form.studentId && classSubjects.length === 0 && (
                  <p className="text-white/30 text-xs mt-1">💡 Ask admin to add subjects to this class.</p>
                )}
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Score (0–100) *</label>
                <input type="number" min="0" max="100" value={form.score}
                  onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Term *</label>
                <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} className="input-field">
                  {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Academic Year</label>
                <input value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Remarks</label>
                <input value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Optional" className="input-field" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  Record Grade
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Student list (grouped) ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Class', 'Subjects', 'Average', 'Top Grade', 'Records', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} className="text-center py-10 text-white/30">Loading...</td></tr>
                : studentRows.length === 0
                ? (
                  <tr><td colSpan={7} className="text-center py-10">
                    <BarChart3 size={36} className="mx-auto mb-2 text-white/20" />
                    <p className="text-white/30 text-sm">No grades recorded yet</p>
                  </td></tr>
                )
                : studentRows.map(({ student, grades: sg }, i) => {
                  const avg    = Math.round(sg.reduce((s, g) => s + g.score, 0) / sg.length);
                  const best   = sg.reduce((a, b) => a.score > b.score ? a : b, sg[0]);
                  const unique = [...new Set(sg.map(g => g.subject))];

                  return (
                    <motion.tr key={student?._id || i}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="table-row cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setSelectedStudent(student)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {student?.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium hover:text-primary transition-colors">{student?.name || '—'}</p>
                            <p className="text-white/30 text-xs font-mono">{student?.studentId || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/50 text-xs">{student?.classId?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {unique.slice(0, 3).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-white/5 rounded text-white/40 text-xs">{s}</span>
                          ))}
                          {unique.length > 3 && <span className="text-white/30 text-xs">+{unique.length - 3}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${avg}%` }} />
                          </div>
                          <span className="font-mono font-bold text-white text-sm">{avg}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={gradeColor(best?.grade)}>{best?.grade}</span>
                      </td>
                      <td className="py-3 px-4 text-white/40 text-xs">{sg.length} record{sg.length !== 1 ? 's' : ''}</td>
                      <td className="py-3 px-4">
                        <span className="text-white/20 text-xs hover:text-primary transition-colors">View →</span>
                      </td>
                    </motion.tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Grades;
