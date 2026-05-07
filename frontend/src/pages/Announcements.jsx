import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Megaphone, Trash2 } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const priorityColor = p => p === 'high' ? 'badge-red' : p === 'medium' ? 'badge-yellow' : 'badge-gray';
const audienceColor = a => a === 'all' ? 'badge-green' : 'badge-gray';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetAudience: 'all', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data.announcements || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/announcements', form);
      setAnnouncements(as => [res.data.announcement, ...as]);
      toast.success('Announcement posted');
      setShowForm(false);
      setForm({ title: '', content: '', targetAudience: 'all', priority: 'medium' });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/announcements/${id}`); setAnnouncements(as => as.filter(a => a._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="section-title">Announcements</h1><p className="text-white/40 text-sm mt-0.5">{announcements.length} announcements</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Post Announcement</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white">New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" className="input-field" required />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} placeholder="Write your announcement here..." className="input-field resize-none" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Target Audience</label>
                  <select value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} className="input-field">
                    {['all', 'students', 'teachers', 'parents'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input-field">
                    {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-accent flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Check size={15} />}
                  Post Announcement
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-white/30">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10">
            <Megaphone size={36} className="mx-auto mb-2 text-white/20" />
            <p className="text-white/30 text-sm">No announcements yet</p>
          </div>
        ) : announcements.map((a, i) => (
          <motion.div key={a._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 hover:border-white/20 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-heading font-semibold text-white">{a.title}</h3>
                  <span className={priorityColor(a.priority)}>{a.priority}</span>
                  <span className={audienceColor(a.targetAudience)}>{a.targetAudience}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-3">{a.content}</p>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>By {a.authorName || 'Admin'}</span>
                  <span>·</span>
                  <span>{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(a._id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
