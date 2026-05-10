import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Trash2, Copy, GraduationCap, ChevronDown, Mail, Phone, BookOpen, User } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentAccounts = () => {
  const [accounts, setAccounts]               = useState([]);
  const [allStudents, setAllStudents]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [preview, setPreview]                 = useState(null); // admission details preview
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [accRes, stuRes] = await Promise.all([
        api.get('/auth/students'),
        api.get('/students'),
      ]);
      setAccounts(accRes.data.students || []);
      setAllStudents(stuRes.data.students || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  // Students who don't have a login account yet
  const accountEmails = new Set(accounts.map(a => a.email));
  const studentsWithoutAccount = allStudents.filter(s => s.email && !accountEmails.has(s.email));
  const studentsWithoutEmail   = allStudents.filter(s => !s.email);

  // When admin selects a student, preview their admission details
  const handleStudentSelect = studentId => {
    setSelectedStudentId(studentId);
    if (!studentId) { setPreview(null); return; }
    const student = allStudents.find(s => s._id === studentId);
    setPreview(student || null);
  };

  const handleCreate = async () => {
    if (!selectedStudentId) { toast.error('Please select a student'); return; }
    setSaving(true);
    try {
      const res = await api.post('/auth/create-student', { studentId: selectedStudentId });
      setCreatedCredentials(res.data.credentials);
      setSelectedStudentId('');
      setPreview(null);
      setShowForm(false);
      await fetchAll();
      toast.success('Account created!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create account');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this student account? The student will no longer be able to log in.')) return;
    try {
      await api.delete(`/auth/students/${id}`);
      setAccounts(a => a.filter(s => s._id !== id));
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete'); }
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
            <GraduationCap size={24} className="text-primary" /> Student Accounts
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Create portal access for admitted students</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setSelectedStudentId(''); setPreview(null); }}
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
              <h3 className="font-heading font-semibold text-white">Create Student Login Account</h3>
              <button onClick={() => { setShowForm(false); setPreview(null); setSelectedStudentId(''); }}
                className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-white/40 text-xs mb-5">
              Select an admitted student — their details will be pulled automatically from admission records.
              Default password will be <span className="font-mono text-white/60">FirstName + last 4 of ID</span> (e.g. <span className="font-mono text-white/60">Ayisu0001</span>).
            </p>

            {/* Dropdown */}
            <div className="mb-4">
              <label className="block text-white/50 text-xs mb-1.5">
                Select Student
                <span className="ml-2 text-white/30">({studentsWithoutAccount.length} without account)</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={e => handleStudentSelect(e.target.value)}
                className="input-field">
                <option value="">— Choose an admitted student —</option>
                {studentsWithoutAccount.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.studentId}) — {s.classId?.name || 'No class'}
                  </option>
                ))}
              </select>
              {studentsWithoutAccount.length === 0 && (
                <p className="text-green-400/70 text-xs mt-1 flex items-center gap-1">
                  <Check size={11} /> All admitted students already have accounts
                </p>
              )}
              {studentsWithoutEmail.length > 0 && (
                <p className="text-yellow-400/70 text-xs mt-1">
                  ⚠️ {studentsWithoutEmail.length} student{studentsWithoutEmail.length > 1 ? 's' : ''} have no email — go to Students page to add their email first.
                </p>
              )}
            </div>

            {/* Preview admission details */}
            {preview && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-white/3 rounded-xl border border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">
                  Admission Details — will be used to create the account
                </p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  {[
                    { icon: User,     label: 'Full Name',   value: preview.name },
                    { icon: Mail,     label: 'Email',       value: preview.email },
                    { icon: Phone,    label: 'Phone',       value: preview.phone || '—' },
                    { icon: BookOpen, label: 'Class',       value: preview.classId?.name || '—' },
                    { icon: User,     label: 'Student ID',  value: preview.studentId },
                    { icon: User,     label: 'Gender',      value: preview.gender ? preview.gender.charAt(0).toUpperCase() + preview.gender.slice(1) : '—' },
                    { icon: User,     label: 'Parent',      value: preview.parentName || '—' },
                    { icon: Phone,    label: 'Parent Phone',value: preview.parentPhone || '—' },
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
                    {preview.name?.split(' ')[0]}{preview.studentId?.slice(-4)}
                  </span>
                  <span className="text-white/20 text-xs">(student changes this on first login)</span>
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={!selectedStudentId || saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedStudentId && !saving
                    ? 'btn-primary'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                }`}>
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check size={15} />}
                Create Account
              </button>
              <button onClick={() => { setShowForm(false); setPreview(null); setSelectedStudentId(''); }}
                className="btn-ghost">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Credentials shown after creation ── */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-5 border border-primary/30 bg-primary/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                <h4 className="text-white font-semibold text-sm">Account Created — Share with Student</h4>
              </div>
              <button onClick={() => setCreatedCredentials(null)} className="text-white/30 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Email',               value: createdCredentials.email },
                { label: 'Temporary Password',  value: createdCredentials.password },
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
              ℹ️ Student will be prompted to set a new password on first login.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accounts table ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-white text-sm">All Student Accounts</h3>
          <span className="text-white/30 text-xs">{accounts.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Student ID', 'Email', 'Class', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-white/30">Loading...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <Users size={36} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No student accounts yet</p>
                </td></tr>
              ) : accounts.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }} className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-primary text-xs font-mono font-semibold">
                    {s.studentProfile?.studentId || '—'}
                  </td>
                  <td className="py-3 px-4 text-white/50 text-xs">{s.email}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">
                    {s.studentProfile?.classId?.name || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {s.mustChangePassword || s.isFirstLogin ? (
                      <span className="badge-yellow">Pending login</span>
                    ) : (
                      <span className="badge-green">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/40 text-xs">
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(s._id)}
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
    </div>
  );
};

export default StudentAccounts;