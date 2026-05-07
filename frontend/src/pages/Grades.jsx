import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, BarChart3, Trash2 } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const gradeColor = g => {
  if (!g) return 'badge-gray';
  if (g === 'A+' || g === 'A') return 'badge-green';
  if (g === 'B+' || g === 'B') return 'badge-yellow';
  if (g === 'C') return 'text-blue-400 bg-blue-500/15 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium';
  return 'badge-red';
};

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', subject: '', score: '', term: 'Term 1', academicYear: new Date().getFullYear().toString(), remarks: '' });
  const [saving, setSaving] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/grades', { params: { term: filterTerm || undefined } }).then(r => setGrades(r.data.grades || [])),
      api.get('/students').then(r => setStudents(r.data.students || [])),
      api.get('/teachers').then(r => setTeachers(r.data.teachers || []))
    ]).finally(() => setLoading(false));
  }, [filterTerm]);

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/grades', form);
      setGrades(gs => [res.data.grade, ...gs]);
      toast.success('Grade recorded');
      setShowForm(false);
      setForm({ studentId: '', subject: '', score: '', term: 'Term 1', academicYear: new Date().getFullYear().toString(), remarks: '' });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this grade?')) return;
    try { await api.delete(`/grades/${id}`); setGrades(gs => gs.filter(g => g._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="section-title">Grades</h1><p className="text-white/40 text-sm mt-0.5">{grades.length} records</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Grade</button>
      </div>

      <div className="flex gap-2">
        {['', 'Term 1', 'Term 2', 'Term 3'].map(t => (
          <button key={t} onClick={() => setFilterTerm(t)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${filterTerm === t ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
            {t || 'All Terms'}
          </button>
        ))}
      </div>

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
                <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} className="input-field" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" className="input-field" required />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Score (0-100) *</label>
                <input type="number" min="0" max="100" value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="input-field" required />
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
                <input value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Optional remarks" className="input-field" />
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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Subject', 'Score', 'Grade', 'Term', 'Year', 'Remarks', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-10 text-white/30">Loading...</td></tr>
                : grades.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10">
                    <BarChart3 size={36} className="mx-auto mb-2 text-white/20" />
                    <p className="text-white/30 text-sm">No grades recorded</p>
                  </td></tr>
                ) : grades.map((g, i) => (
                  <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                    <td className="py-3 px-4 text-white text-sm">{g.studentId?.name || '—'}</td>
                    <td className="py-3 px-4 text-white/70 text-sm">{g.subject}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm">{g.score}<span className="text-white/30 text-xs">%</span></div>
                    </td>
                    <td className="py-3 px-4"><span className={gradeColor(g.grade)}>{g.grade}</span></td>
                    <td className="py-3 px-4 text-white/50 text-xs">{g.term}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">{g.academicYear}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">{g.remarks || '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(g._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Grades;
