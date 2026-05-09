import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Users, Trash2, Eye, EyeOff, Copy, Shield } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TeacherAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', subject: '',
    phone: '', qualification: '', experience: 0, gender: 'male', address: ''
  });

  useEffect(() => {
    api.get('/auth/teachers')
      .then(r => setAccounts(r.data.teachers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, password: pass }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/auth/create-teacher', form);
      setAccounts(a => [...a, res.data.user]);
      setCreatedCredentials(res.data.credentials);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', subject: '', phone: '', qualification: '', experience: 0, gender: 'male', address: '' });
      toast.success('Teacher account created!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create account');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this teacher account? This cannot be undone.')) return;
    try {
      await api.delete(`/auth/teachers/${id}`);
      setAccounts(a => a.filter(t => t._id !== id));
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Shield size={24} className="text-primary" /> Teacher Accounts
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Manage teacher login credentials</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Account
        </button>
      </div>

      {/* Created credentials popup */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-green p-5 border border-primary/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-primary" />
                <h3 className="font-heading font-semibold text-white">Account Created Successfully!</h3>
              </div>
              <button onClick={() => setCreatedCredentials(null)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-4">Share these login credentials with the teacher:</p>
            <div className="space-y-2">
              {[
                { label: 'Email', value: createdCredentials.email },
                { label: 'Password', value: createdCredentials.password },
                { label: 'Login URL', value: window.location.origin + '/login' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                  <div>
                    <span className="text-white/40 text-xs">{item.label}: </span>
                    <span className="text-white text-sm font-mono">{item.value}</span>
                  </div>
                  <button onClick={() => copyToClipboard(item.value)}
                    className="text-white/30 hover:text-primary transition-colors ml-3">
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-accent text-xs mt-3">
              ⚠️ The teacher will be prompted to change their password on first login.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white">Create Teacher Account</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Full Name *', key: 'name', type: 'text', required: true },
                { label: 'Email Address *', key: 'email', type: 'email', required: true },
                { label: 'Subject *', key: 'subject', type: 'text', required: true },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'Qualification', key: 'qualification', type: 'text' },
                { label: 'Years of Experience', key: 'experience', type: 'number' },
                { label: 'Address', key: 'address', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-white/50 text-xs mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input-field" required={f.required} />
                </div>
              ))}

              <div>
                <label className="block text-white/50 text-xs mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="input-field">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Password field */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-white/50 text-xs mb-1.5">Login Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Set a temporary password"
                      className="input-field pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button type="button" onClick={generatePassword}
                    className="btn-outline text-xs whitespace-nowrap px-4">
                    Auto Generate
                  </button>
                </div>
                <p className="text-white/30 text-xs mt-1">
                  Teacher will be asked to change this on first login
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check size={15} />}
                  Create Account
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts list */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Teacher', 'Email', 'Role', 'First Login', 'Created', 'Actions'].map(h => (
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
                  transition={{ delay: i * 0.04 }} className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        {t.name[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-xs">{t.email}</td>
                  <td className="py-3 px-4">
                    <span className="badge-green capitalize">{t.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={t.isFirstLogin ? 'badge-yellow' : 'badge-green'}>
                      {t.isFirstLogin ? 'Pending' : 'Logged In'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/40 text-xs">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(t._id)}
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

export default TeacherAccounts;