// Classes.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, BookOpen } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', grade: '', section: 'A', room: '', capacity: 40, schedule: '', academicYear: new Date().getFullYear().toString(), teacherId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/classes').then(r => setClasses(r.data.classes || [])),
      api.get('/teachers').then(r => setTeachers(r.data.teachers || []))
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm({ name: '', grade: '', section: 'A', room: '', capacity: 40, schedule: '', academicYear: new Date().getFullYear().toString(), teacherId: '' }); setEditingId(null); setShowForm(true); };
  const openEdit = c => { setForm({ ...c, teacherId: c.teacherId?._id || '' }); setEditingId(c._id); setShowForm(true); };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/classes/${editingId}`, form);
        setClasses(cs => cs.map(c => c._id === editingId ? res.data.class : c));
        toast.success('Class updated');
      } else {
        const res = await api.post('/classes', form);
        setClasses(cs => [...cs, res.data.class]);
        toast.success('Class created');
      }
      setShowForm(false);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this class?')) return;
    try { await api.delete(`/classes/${id}`); setClasses(cs => cs.filter(c => c._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="section-title">Classes</h1><p className="text-white/40 text-sm mt-0.5">{classes.length} classes</p></div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Class</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white">{editingId ? 'Edit' : 'Add'} Class</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Class Name *', key: 'name', type: 'text', required: true, placeholder: 'e.g. Form 1A' },
                { label: 'Grade *', key: 'grade', type: 'text', required: true, placeholder: 'e.g. 1, 2, JHS1' },
                { label: 'Section', key: 'section', type: 'text', placeholder: 'A, B, C' },
                { label: 'Room', key: 'room', type: 'text', placeholder: 'Room number' },
                { label: 'Capacity', key: 'capacity', type: 'number' },
                { label: 'Schedule', key: 'schedule', type: 'text', placeholder: 'e.g. Mon-Fri 8am-3pm' },
                { label: 'Academic Year', key: 'academicYear', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-white/50 text-xs mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-field" required={f.required} />
                </div>
              ))}
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Class Teacher</label>
                <select value={form.teacherId || ''} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))} className="input-field">
                  <option value="">No Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} - {t.subject}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                  {editingId ? 'Update' : 'Create'} Class
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-10 text-white/30">Loading...</div>
          : classes.length === 0 ? (
            <div className="col-span-3 text-center py-10">
              <BookOpen size={36} className="mx-auto mb-2 text-white/20" />
              <p className="text-white/30 text-sm">No classes yet</p>
            </div>
          ) : classes.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card p-5 hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <span className="font-display text-primary text-xl">G{c.grade}</span>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 text-white/50 hover:text-accent transition-all"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 className="font-heading font-bold text-white text-lg">{c.name}</h3>
              <p className="text-primary text-sm mb-3">Grade {c.grade} · Section {c.section}</p>
              <div className="space-y-1 text-xs text-white/40">
                <div>📍 Room {c.room || 'TBA'}</div>
                <div>👥 Capacity: {c.capacity}</div>
                <div>👩‍🏫 {c.teacherId?.name || 'No teacher assigned'}</div>
                <div>📅 {c.schedule || 'Schedule TBA'}</div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default Classes;
