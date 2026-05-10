import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Trash2, Copy, Shield, Mail, Phone, BookOpen, User, RefreshCw } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TeacherAccounts = () => {
  const [accounts, setAccounts]                   = useState([]);
  const [allTeachers, setAllTeachers]             = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [showForm, setShowForm]                   = useState(false);
  const [saving, setSaving]                       = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [preview, setPreview]                     = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [resetTarget, setResetTarget]             = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [accRes, teachRes] = await Promise.all([
        api.get('/auth/teachers'),
        api.get('/teachers'),
      ]);
      setAccounts(accRes.data.teachers || []);
      setAllTeachers(teachRes.data.teachers || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  // Teachers who don't have a login account yet
  const accountEmails = new Set(accounts.map(a => a.email));
  const teachersWithoutAccount = allTeachers.filter(t => t.email && !accountEmails.has(t.email));
  const teachersWithoutEmail   = allTeachers.filter(t => !t.email);

  // When admin selects a teacher, preview their profile details
  const handleTeacherSelect = teacherId => {
    setSelectedTeacherId(teacherId);
    if (!teacherId) { setPreview(null); return; }
    const teacher = allTeachers.find(t => t._id === teacherId);
    setPreview(teacher || null);
  };

  const handleCreate = async () => {
    if (!selectedTeacherId) { toast.error('Please select a teacher'); return; }
    setSaving(true);
    try {
      const res = await api.post('/auth/create-teacher', { teacherProfileId: selectedTeacherId });
      setCreatedCredentials(res.data.credentials);
      setSelectedTeacherId('');
      setPreview(null);
      setShowForm(false);
      await fetchAll();
      toast.success('Account created!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create account');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this teacher account? The teacher will no longer be able to log in.')) return;
    try {
      await api.delete(`/auth/teachers/${id}`);
      setAccounts(a => a.filter(t => t._id !== id));
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleResetPassword = async account => {
    setResetTarget(account._id);
    try {
      const res = await api.put(`/auth/teachers/${account._id}/reset-password`);
      setCreatedCredentials(res.data.credentials);
      toast.success('Password reset');
    } catch { toast.error('Failed to reset password'); }
    finally { setResetTarget(null); }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Shield size={24} className="text-primary" /> Teacher Accounts
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Create and manage teacher login access</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setSelectedTeacherId(''); setPreview(null); }}
          className="btn-primary flex items-center gap-2">
          <Users size={16} /> Create Account
        </button>
      </div>

      {/* ── Create Account panel ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-white">Create Teacher Login Account</h3>
              <button onClick={() => { setShowForm(false); setPreview(null); setSelectedTeacherId(''); }}
                className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-white/40 text-xs mb-5">
              Select a teacher — their details will be pulled automatically from their profile.
              Default password will be <span className="font-mono text-white/60">FirstName + last 4 of ID</span> (e.g. <span className="font-mono text-white/60">John0001</span>).
            </p>

            {/* Dropdown */}
            <div className="mb-4">
              <label className="block text-white/50 text-xs mb-1.5">
                Select Teacher
                <span className="ml-2 text-white/30">({teachersWithoutAccount.length} without account)</span>
              </label>
              <select
                value={selectedTeacherId}
                onChange={e => handleTeacherSelect(e.target.value)}
                className="input-field">
                <option value="">— Choose a teacher —</option>
                {teachersWithoutAccount.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.teacherId}) — {t.subject}
                  </option>
                ))}
              </select>
              {teachersWithoutAccount.length === 0 && (
                <p className="text-green-400/70 text-xs mt-1 flex items-center gap-1">
                  <Check size={11} /> All teachers already have accounts
                </p>
              )}
              {teachersWithoutEmail.length > 0 && (
                <p className="text-yellow-400/70 text-xs mt-1">
                  ⚠️ {teachersWithoutEmail.length} teacher{teachersWithoutEmail.length > 1 ? 's' : ''} have no email — go to Teachers page to add their email first.
                </p>
              )}
            </div>

            {/* Preview teacher details */}
            {preview && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-white/3 rounded-xl border border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">
                  Teacher Profile — will be used to create the account
                </p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  {[
                    { icon: User,     label: 'Full Name',    value: preview.name },
                    { icon: Mail,     label: 'Email',        value: preview.email },
                    { icon: Phone,    label: 'Phone',        value: preview.phone || '—' },
                    { icon: BookOpen, label: 'Subject',      value: preview.subject || '—' },
                    { icon: User,     label: 'Teacher ID',   value: preview.teacherId },
                    { icon: User,     label: 'Qualification',value: preview.qualification || '—' },
                    { icon: User,     label: 'Experience',   value: preview.experience ? `${preview.experience} year(s)` : '—' },
                    { icon: User,     label: 'Gender',       value: preview.gender ? preview.gender.charAt(0).toUpperCase() + preview.gender.slice(1) : '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon size={13} className="text-primary/50 flex-shrink-0" />
                      <span className="text-white/40 text-xs w-24 flex-shrink-0">{label}:</span>
                      <span className="text-white/80 text-xs font-medium truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <span className="text-white/30 text-xs">Default password:</span>
                  <span className="font-mono text-primary/80 text-xs bg-primary/10 px-2 py-0.5 rounded">
                    {preview.name?.split(' ')[0]}{preview.teacherId?.slice(-4)}
                  </span>
                  <span className="text-white/20 text-xs">(teacher changes this on first login)</span>
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={!selectedTeacherId || saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedTeacherId && !saving
                    ? 'btn-primary'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                }`}>
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check size={15} />}
                Create Account
              </button>
              <button onClick={() => { setShowForm(false); setPreview(null); setSelectedTeacherId(''); }}
                className="btn-ghost">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Credentials shown after creation or reset ── */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-5 border border-primary/30 bg-primary/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                <h4 className="text-white font-semibold text-sm">Account Ready — Share with Teacher</h4>
              </div>
              <button onClick={() => setCreatedCredentials(null)} className="text-white/30 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Email',              value: createdCredentials.email },
                { label: 'Temporary Password', value: createdCredentials.password },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-white/40 text-xs">{label}</p>
                    <p className="text-white font-mono text-sm font-medium">{value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(value, label)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-white/40 hover:text-primary transition-all ml-3">
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-3">
              ℹ️ Teacher will be prompted to set a new password on first login.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accounts table ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-white text-sm">All Teacher Accounts</h3>
          <span className="text-white/30 text-xs">{accounts.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Teacher', 'Email', 'Subject', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-white/30">Loading...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10">
                  <Users size={36} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No teacher accounts yet</p>
                </td></tr>
              ) : accounts.map((t, i) => (
                <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }} className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {t.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{t.name}</p>
                        <p className="text-white/30 text-xs font-mono">{t.teacherProfile?.teacherId || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-xs">{t.email}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{t.teacherProfile?.subject || '—'}</td>
                  <td className="py-3 px-4">
                    {t.mustChangePassword || t.isFirstLogin ? (
                      <span className="badge-yellow">Pending login</span>
                    ) : (
                      <span className="badge-green">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/40 text-xs">
                    {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetPassword(t)}
                        disabled={resetTarget === t._id}
                        title="Reset password"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-white/40 hover:text-yellow-400 transition-all">
                        {resetTarget === t._id
                          ? <div className="w-3 h-3 border-2 border-white/30 border-t-yellow-400 rounded-full animate-spin" />
                          : <RefreshCw size={13} />}
                      </button>
                      <button onClick={() => handleDelete(t._id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
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

export default TeacherAccounts;