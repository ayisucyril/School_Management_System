import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Check, GraduationCap } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const defaultForm = { name: '', email: '', phone: '', subject: '', qualification: '', experience: 0, gender: 'male', address: '', status: 'active' };

const Teachers = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/teachers', { params: { search } }).then(r => setTeachers(r.data.teachers || [])).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  const openCreate = () => { setForm(defaultForm); setEditingId(null); setShowForm(true); };
  const openEdit = t => { setForm(t); setEditingId(t._id); setShowForm(true); };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/teachers/${editingId}`, form);
        setTeachers(ts => ts.map(t => t._id === editingId ? res.data.teacher : t));
        toast.success('Teacher updated');
      } else {
        const res = await api.post('/teachers', form);
        setTeachers(ts => [res.data.teacher, ...ts]);
        toast.success('Teacher added');
      }
      setShowForm(false);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(ts => ts.filter(t => t._id !== id));
      toast.success('Teacher deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Teachers</h1>
          <p className="text-white/40 text-sm mt-0.5">{teachers.length} total teachers</p>
        </div>
        {/* Only admin can add teachers */}
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Teacher
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="input-field pl-10" />
      </div>

      {/* Only admin can see the add/edit form */}
      {isAdmin && (
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-white">{editingId ? 'Edit' : 'Add'} Teacher</h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', required: true },
                  { label: 'Email *', key: 'email', type: 'email', required: true },
                  { label: 'Phone', key: 'phone', type: 'text' },
                  { label: 'Subject *', key: 'subject', type: 'text', required: true },
                  { label: 'Qualification', key: 'qualification', type: 'text' },
                  { label: 'Years Experience', key: 'experience', type: 'number' },
                  { label: 'Address', key: 'address', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-white/50 text-xs mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="input-field" required={f.required} />
                  </div>
                ))}
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="input-field">
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                    {['active', 'inactive', 'on-leave'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                    {editingId ? 'Update' : 'Add'} Teacher
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-10 text-white/30">Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="col-span-4 text-center py-10">
            <GraduationCap size={36} className="mx-auto mb-2 text-white/20" />
            <p className="text-white/30 text-sm">No teachers found</p>
          </div>
        ) : teachers.map((t, i) => (
          <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 hover:border-white/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                {t.name[0]}
              </div>
              <span className={t.status === 'active' ? 'badge-green' : t.status === 'on-leave' ? 'badge-yellow' : 'badge-gray'}>{t.status}</span>
            </div>
            <h3 className="font-heading font-semibold text-white mb-0.5">{t.name}</h3>
            <p className="text-accent text-sm mb-1">{t.subject}</p>
            <p className="text-white/40 text-xs mb-1">{t.email}</p>
            <p className="text-white/30 text-xs">{t.qualification} · {t.experience} yrs exp</p>
            <p className="text-white/25 text-xs font-mono mt-1">{t.teacherId}</p>

            {/* Edit and Delete buttons — admin only */}
            {isAdmin && (
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(t)} className="flex-1 btn-outline text-xs py-1.5">Edit</button>
                <button onClick={() => handleDelete(t._id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-all">Delete</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;