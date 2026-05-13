import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, BarChart3, Trash2, ChevronLeft, AlertCircle, Search } from 'lucide-react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Compute letter grade from score (frontend fallback) ──────────────────
const computeGrade = score => {
  const s = Number(score);
  if (s >= 90) return 'A+';
  if (s >= 80) return 'A';
  if (s >= 70) return 'B+';
  if (s >= 60) return 'B';
  if (s >= 50) return 'C';
  if (s >= 40) return 'D';
  return 'F';
};

// ─── Always resolve grade — use stored value or compute from score ─────────
const resolveGrade = g => g.grade || computeGrade(g.score);

const gradeColor = g => {
  if (!g) return 'badge-gray';
  if (g === 'A+' || g === 'A') return 'badge-green';
  if (g === 'B+' || g === 'B') return 'badge-yellow';
  if (g === 'C') return 'text-blue-400 bg-blue-500/15 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium';
  if (g === 'D') return 'text-orange-400 bg-orange-500/15 border border-orange-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium';
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
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
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
              ) : filtered.map((g, i) => {
                const grade = resolveGrade(g);
                return (
                  <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: gradeColorHex(grade) }} />
                        <span className="text-white/80 text-sm font-medium">{g.subject}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${g.score}%`, background: gradeColorHex(grade) }} />
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{g.score}<span className="text-white/30 text-xs">%</span></span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={gradeColor(grade)}>{grade}</span>
                    </td>
                    <td className="py-3 px-4 text-white/50 text-xs">{g.term}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">{g.academicYear}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">{g.remarks || '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => onDelete(g._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Upload Results form ──────────────────────────────────────────────────────
const UploadResults = ({ myClasses, allGrades, term, academicYear, onClose, onSaved }) => {
  const [selectedClassId, setSelectedClassId] = useState(myClasses.length === 1 ? myClasses[0]._id : '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedClass = myClasses.find(c => c._id === selectedClassId);
  const subjects = selectedClass?.subjects || [];

  const classStudents = selectedClass?.students || [];
  const doneStudentIds = new Set(
    allGrades
      .filter(g => g.term === term && g.academicYear === academicYear)
      .map(g => g.studentId?._id || g.studentId)
  );
  const availableStudents = classStudents.filter(s => !doneStudentIds.has(s._id));

  useEffect(() => {
    const init = {};
    const initR = {};
    subjects.forEach(s => { init[s] = ''; initR[s] = ''; });
    setScores(init);
    setRemarks(initR);
    setSelectedStudentId('');
  }, [selectedClassId]);

  useEffect(() => {
    const init = {};
    const initR = {};
    subjects.forEach(s => { init[s] = ''; initR[s] = ''; });
    setScores(init);
    setRemarks(initR);
  }, [selectedStudentId]);

  const allFilled = subjects.length > 0 && subjects.every(s => scores[s] !== '' && scores[s] !== undefined);

  const handleSave = async () => {
    if (!selectedStudentId) { toast.error('Select a student'); return; }
    if (!allFilled) { toast.error('Enter scores for all subjects before saving'); return; }

    for (const s of subjects) {
      const val = Number(scores[s]);
      if (isNaN(val) || val < 0 || val > 100) {
        toast.error(`Score for ${s} must be between 0 and 100`);
        return;
      }
    }

    setSaving(true);
    try {
      const records = subjects.map(s => ({
        studentId: selectedStudentId,
        subject: s,
        score: Number(scores[s]),
        term,
        academicYear,
        classId: selectedClassId,
        remarks: remarks[s] || '',
      }));
      await api.post('/grades/bulk', { records });
      toast.success(`Results uploaded for ${availableStudents.find(s => s._id === selectedStudentId)?.name}`);
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold text-white">Upload Results</h3>
          <p className="text-white/40 text-xs mt-0.5">{term} · {academicYear}</p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-white/50 text-xs mb-1.5">Class *</label>
          {myClasses.length === 1 ? (
            <div className="input-field text-white/70">{myClasses[0].name} — Grade {myClasses[0].grade}</div>
          ) : (
            <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="input-field" required>
              <option value="">— Select Class —</option>
              {myClasses.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}{c.section}</option>)}
            </select>
          )}
        </div>

        <div>
          <label className="block text-white/50 text-xs mb-1.5">
            Student *
            {selectedClassId && (
              <span className="ml-2 text-white/30">
                ({availableStudents.length} remaining · {[...doneStudentIds].filter(id => classStudents.find(s => s._id === id)).length} done)
              </span>
            )}
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="input-field"
            disabled={!selectedClassId}
            required>
            <option value="">— Select Student —</option>
            {availableStudents.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
            ))}
          </select>
          {selectedClassId && availableStudents.length === 0 && (
            <p className="text-green-400/70 text-xs mt-1 flex items-center gap-1">
              <Check size={11} /> All students in this class have results for {term}
            </p>
          )}
        </div>
      </div>

      {selectedStudentId && subjects.length === 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
          <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400/80 text-sm">No subjects assigned to this class. Ask admin to add subjects first.</p>
        </div>
      )}

      {selectedStudentId && subjects.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Subject Scores</p>
            <p className="text-white/30 text-xs">
              {subjects.filter(s => scores[s] !== '').length} / {subjects.length} filled
              {allFilled && <span className="text-green-400 ml-2">✓ All done</span>}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {subjects.map(subject => {
              const val = scores[subject];
              const grade = val !== '' ? computeGrade(val) : null;
              return (
                <div key={subject} className="p-3 bg-white/3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/70 text-xs font-medium">{subject}</label>
                    {grade && <span className={gradeColor(grade)}>{grade}</span>}
                  </div>
                  <input
                    type="number" min="0" max="100"
                    value={val}
                    onChange={e => setScores(p => ({ ...p, [subject]: e.target.value }))}
                    placeholder="0 – 100"
                    className="input-field text-sm py-1.5"
                  />
                  <input
                    type="text"
                    value={remarks[subject] || ''}
                    onChange={e => setRemarks(p => ({ ...p, [subject]: e.target.value }))}
                    placeholder="Remarks (optional)"
                    className="input-field text-xs py-1 mt-1.5 text-white/50"
                  />
                </div>
              );
            })}
          </div>

          {!allFilled && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
              <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-400/80 text-xs">Fill in all subject scores before saving.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !allFilled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                allFilled && !saving
                  ? 'btn-primary'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              }`}>
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={15} />}
              Record Results
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </>
      )}
    </motion.div>
  );
};

// ─── Main Grades component ────────────────────────────────────────────────────
const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades]             = useState([]);
  const [classes, setClasses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showUpload, setShowUpload]     = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterTerm, setFilterTerm]     = useState('');
  const [filterTerm2, setFilterTerm2]   = useState('Term 1');
  const [filterYear, setFilterYear]     = useState(new Date().getFullYear().toString());
  const [search, setSearch]             = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [gradesRes, studentsRes, classesRes] = await Promise.all([
          api.get('/grades', { params: { term: filterTerm || undefined } }),
          api.get('/students'),
          api.get('/classes'),
        ]);
        setGrades(gradesRes.data.grades || []);

        const allClasses = classesRes.data.classes || [];

        if (user?.role === 'teacher') {
          const tRes = await api.get('/teachers');
          const found = tRes.data.teachers?.find(t => t.email === user.email || t.userId === user._id);

          if (found) {
            const myClassIds = allClasses
              .filter(c => c.teacherId?._id === found._id || c.teacherId === found._id)
              .map(c => c._id);

            const enriched = allClasses
              .filter(c => myClassIds.includes(c._id))
              .map(c => ({
                ...c,
                students: (studentsRes.data.students || []).filter(s =>
                  s.classId?._id === c._id || s.classId === c._id
                )
              }));
            setClasses(enriched);
          }
        } else {
          const enriched = allClasses.map(c => ({
            ...c,
            students: (studentsRes.data.students || []).filter(s =>
              s.classId?._id === c._id || s.classId === c._id
            )
          }));
          setClasses(enriched);
        }
      } catch (e) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [filterTerm, user]);

  const handleDelete = async id => {
    if (!confirm('Delete this grade?')) return;
    try {
      await api.delete(`/grades/${id}`);
      setGrades(gs => gs.filter(g => g._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const handleSaved = async () => {
    const res = await api.get('/grades', { params: { term: filterTerm || undefined } });
    setGrades(res.data.grades || []);
  };

  // Group grades by student
  const gradesByStudent = grades.reduce((acc, g) => {
    const id = g.studentId?._id || g.studentId;
    if (!id) return acc;
    if (!acc[id]) acc[id] = { student: g.studentId, grades: [] };
    acc[id].grades.push(g);
    return acc;
  }, {});

  // Filter student rows by search query — searches name, student ID, and class
  const studentRows = useMemo(() => {
    const rows = Object.values(gradesByStudent);
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(({ student }) =>
      student?.name?.toLowerCase().includes(q) ||
      student?.studentId?.toLowerCase().includes(q) ||
      student?.classId?.name?.toLowerCase().includes(q)
    );
  }, [grades, search]);

  if (selectedStudent) {
    const studentGrades = grades.filter(g => {
      const id = g.studentId?._id || g.studentId;
      return id === selectedStudent._id;
    });
    return (
      <div className="space-y-5">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Grades</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {grades.length} records ·{' '}
            {search.trim()
              ? <><span className="text-white/60">{studentRows.length}</span> of {Object.keys(gradesByStudent).length} students</>
              : <>{studentRows.length} student{studentRows.length !== 1 ? 's' : ''}</>
            }
          </p>
        </div>
        <button onClick={() => setShowUpload(v => !v)} className="btn-primary flex items-center gap-2">
          <Upload size={16} /> Upload Results
        </button>
      </div>

      {/* Term filter + Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {['', 'Term 1', 'Term 2', 'Term 3'].map(t => (
            <button key={t} onClick={() => setFilterTerm(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${filterTerm === t ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
              {t || 'All Terms'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID or class…"
            className="w-full pl-8 pr-8 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Upload form */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex gap-3 items-center">
              <div>
                <label className="text-white/40 text-xs mr-2">Term:</label>
                <select value={filterTerm2} onChange={e => setFilterTerm2(e.target.value)}
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-primary/50">
                  {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs mr-2">Year:</label>
                <input type="text" value={filterYear} onChange={e => setFilterYear(e.target.value)}
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white w-20 focus:outline-none focus:border-primary/50" />
              </div>
            </motion.div>

            <UploadResults
              myClasses={classes}
              allGrades={grades}
              term={filterTerm2}
              academicYear={filterYear}
              onClose={() => setShowUpload(false)}
              onSaved={handleSaved}
            />
          </>
        )}
      </AnimatePresence>

      {/* Student list */}
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
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-white/30">Loading...</td></tr>
              ) : studentRows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <Search size={32} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">
                    {search.trim() ? `No students matching "${search}"` : 'No grades recorded yet'}
                  </p>
                  {search.trim() && (
                    <button onClick={() => setSearch('')}
                      className="mt-2 text-primary/60 hover:text-primary text-xs transition-colors">
                      Clear search
                    </button>
                  )}
                </td></tr>
              ) : studentRows.map(({ student, grades: sg }, i) => {
                const avg       = Math.round(sg.reduce((s, g) => s + g.score, 0) / sg.length);
                const best      = sg.reduce((a, b) => a.score > b.score ? a : b, sg[0]);
                const bestGrade = resolveGrade(best);
                const unique    = [...new Set(sg.map(g => g.subject))];

                // Highlight matched portion of name
                const name = student?.name || '—';
                const q    = search.trim().toLowerCase();
                const idx  = q ? name.toLowerCase().indexOf(q) : -1;

                return (
                  <motion.tr key={student?._id || i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="table-row cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSelectedStudent(student)}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {name[0] || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {idx >= 0 ? (
                              <>
                                {name.slice(0, idx)}
                                <mark className="bg-primary/30 text-primary rounded px-0.5 not-italic">
                                  {name.slice(idx, idx + q.length)}
                                </mark>
                                {name.slice(idx + q.length)}
                              </>
                            ) : name}
                          </p>
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
                    <td className="py-3 px-4"><span className={gradeColor(bestGrade)}>{bestGrade}</span></td>
                    <td className="py-3 px-4 text-white/40 text-xs">{sg.length} record{sg.length !== 1 ? 's' : ''}</td>
                    <td className="py-3 px-4">
                      <span className="text-white/20 text-xs hover:text-primary transition-colors">View →</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Grades;