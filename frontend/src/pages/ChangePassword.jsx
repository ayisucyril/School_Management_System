import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number',     pass: /\d/.test(password) },
    { label: 'Contains a letter',     pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const color = score === 0 ? '#6b7280' : score === 1 ? '#ef4444' : score === 2 ? '#f59e0b' : '#16a34a';
  const label = score === 0 ? '' : score === 1 ? 'Weak' : score === 2 ? 'Fair' : 'Strong';

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= score ? color : '#ffffff15' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${c.pass ? 'bg-green-500/20' : 'bg-white/5'}`}>
                {c.pass && <Check size={8} className="text-green-400" />}
              </div>
              <span className={`text-xs ${c.pass ? 'text-white/50' : 'text-white/20'}`}>{c.label}</span>
            </div>
          ))}
        </div>
        {label && <span className="text-xs font-medium" style={{ color }}>{label}</span>}
      </div>
    </div>
  );
};

const ChangePassword = ({ onDone }) => {
  const { user } = useAuth();
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [saving, setSaving]               = useState(false);

  const isValid = newPassword.length >= 6 && newPassword === confirmPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid) return;
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { newPassword });
      toast.success('Password changed! Welcome aboard 🎉');
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {/* Card */}
        <div className="glass-card p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <KeyRound size={28} className="text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Create Your Password</h1>
            <p className="text-white/40 text-sm">
              Welcome, <span className="text-white/70">{user?.name?.split(' ')[0]}</span>! For your security, please create a new password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-white/50 text-xs mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="input-field pr-10"
                  required
                  autoFocus
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="input-field pr-10"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Check size={11} /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || saving}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                isValid && !saving
                  ? 'btn-primary'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              }`}>
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ShieldCheck size={16} />}
              Set Password & Continue
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-4">
            Your password must be at least 6 characters long.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
