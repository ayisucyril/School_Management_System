import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { api, useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PasswordModal = () => {
  const { showPasswordModal, setShowPasswordModal, user, updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { newPassword });
      const updated = { ...user, isFirstLogin: false, mustChangePassword: false };
      updateUser(updated);
      toast.success('Password changed successfully!');
      setDone(true);
      setTimeout(() => { setShowPasswordModal(false); setDone(false); }, 1500);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const handleKeepPassword = async () => {
    setLoading(true);
    try {
      await api.put('/auth/skip-password-change');
      const updated = { ...user, isFirstLogin: false, mustChangePassword: false };
      updateUser(updated);
      toast.success('Password maintained. Welcome!');
      setShowPasswordModal(false);
    } catch {
      toast.error('Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md glass-card p-8"
          >
            {done ? (
              <div className="text-center py-6">
                <CheckCircle size={56} className="text-primary mx-auto mb-4" />
                <h3 className="font-heading font-bold text-white text-xl">Password Updated!</h3>
                <p className="text-white/50 text-sm mt-1">Redirecting you to dashboard...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <Shield size={28} className="text-primary" />
                  </div>
                  <h2 className="font-heading font-bold text-white text-xl mb-1">
                    Welcome, {user?.name?.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-white/50 text-sm">
                    This is your first login. Would you like to change your password or keep the one provided by your admin?
                  </p>
                </div>

                {/* Password fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="input-field pl-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="input-field pl-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    disabled={loading || !newPassword || !confirmPassword}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Lock size={15} /> Change Password</>
                    }
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleKeepPassword}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Keep Current Password
                  </motion.button>
                </div>

                <p className="text-white/20 text-xs text-center mt-4">
                  You can always change your password later from settings
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;