import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Check, Users, CreditCard, Camera, Upload } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import StudentIDCard from '../components/ui/StudentIDCard';

const defaultForm = { name: '', email: '', phone: '', gender: 'male', dateOfBirth: '', address: '', parentName: '', parentPhone: '', parentEmail: '', status: 'active' };
const API_BASE = 'http://localhost:5000';

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [idCardStudent, setIdCardStudent] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState(null);

  const fetchStudents = () => {
    api.get('/students', { params: { search } })
      .then(r => setStudents(r.data.students || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search]);
  useEffect(() => { api.get('/classes').then(r => setClasses(r.data.classes || [])).catch(() => {}); }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setAvatarPreview(null);
    setAvatarFile(null);
    setShowForm(true);
  };

  const openEdit = s => {
    setForm({ ...s, classId: s.classId?._id || '', dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '' });
    setEditingId(s._id);
    setAvatarPreview(s.avatar ? `${API_BASE}${s.avatar}` : null);
    setAvatarFile(null);
    setShowForm(true);
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload avatar for existing student directly from table
  const handleQuickUpload = async (studentId) => {
    setUploadTargetId(studentId);
    fileInputRef.current.click();
  };

  const handleQuickAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file || !uploadTargetId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const res = await api.post(`/students/${uploadTargetId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStudents(ss => ss.map(s => s._id === uploadTargetId ? res.data.student : s));
      toast.success('Profile photo updated!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      setUploadTargetId(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      let savedStudent;
      if (editingId) {
        const res = await api.put(`/students/${editingId}`, form);
        savedStudent = res.data.student;
        setStudents(ss => ss.map(s => s._id === editingId ? savedStudent : s));
        toast.success('Student updated');
      } else {
        const res = await api.post('/students', form);
        savedStudent = res.data.student;
        if (form.classId) {
          const cls = classes.find(c => c._id === form.classId);
          if (cls) savedStudent.classId = cls;
        }
        setStudents(ss => [savedStudent, ...ss]);
        toast.success('Student admitted successfully!');
      }

      // Upload avatar if selected
      if (avatarFile && savedStudent._id) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        try {
          const avatarRes = await api.post(`/students/${savedStudent._id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          savedStudent = avatarRes.data.student;
          setStudents(ss => ss.map(s => s._id === savedStudent._id ? savedStudent : s));
        } catch { toast.error('Student saved but photo upload failed'); }
      }

      setShowForm(false);
      if (!editingId) setIdCardStudent(savedStudent);

    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(ss => ss.filter(s => s._id !== id));
      toast.success('Student deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const getAvatarUrl = (avatar) => avatar ? `${API_BASE}${avatar}` : null;

  return (
    <div className="space-y-5">
      {/* Hidden file input for quick upload */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleQuickAvatarChange} />

      {/* ID Card Modal */}
      {idCardStudent && (
        <StudentIDCard student={idCardStudent} onClose={() => setIdCardStudent(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="text-white/40 text-sm mt-0.5">{students.length} total students</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Admit Student
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID..." className="input-field pl-10" />
      </div>

      {/* Form — admin only */}
      {isAdmin && (
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-white">
                  {editingId ? 'Edit Student' : '🎓 Admit New Student'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Profile Photo Upload */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-white/50 text-xs mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-white/5">
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <Camera size={24} className="text-white/20" />
                      }
                    </div>
                    <div>
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-all">
                        <Upload size={14} />
                        {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </label>
                      <p className="text-white/30 text-xs mt-1.5">Max 5MB • JPG, PNG, WebP</p>
                    </div>
                  </div>
                </div>

                {[
                  { label: 'Full Name *', key: 'name', type: 'text', required: true },
                  { label: 'Email *', key: 'email', type: 'email', required: true },
                  { label: 'Phone', key: 'phone', type: 'text' },
                  { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
                  { label: 'Address', key: 'address', type: 'text' },
                  { label: 'Parent Name', key: 'parentName', type: 'text' },
                  { label: 'Parent Phone', key: 'parentPhone', type: 'text' },
                  { label: 'Parent Email', key: 'parentEmail', type: 'email' },
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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Class</label>
                  <select value={form.classId || ''} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} className="input-field">
                    <option value="">No Class</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} - Grade {c.grade}{c.section}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                    {['active', 'inactive', 'graduated', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                    {editingId ? 'Update Student' : 'Admit Student'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'ID', 'Email', 'Class', 'Parent', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-white/30">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <Users size={36} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No students found</p>
                </td></tr>
              ) : students.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar with upload on hover */}
                      <div className="relative group/avatar flex-shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                          {getAvatarUrl(s.avatar)
                            ? <img src={getAvatarUrl(s.avatar)} alt={s.name} className="w-full h-full object-cover" />
                            : s.name[0]
                          }
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleQuickUpload(s._id)}
                            disabled={uploadingAvatar}
                            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity"
                            title="Upload photo">
                            <Camera size={12} className="text-white" />
                          </button>
                        )}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{s.name}</div>
                        <div className="text-white/40 text-xs">{s.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-xs font-mono">{s.studentId}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{s.email}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{s.classId?.name || '—'}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{s.parentName || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={s.status === 'active' ? 'badge-green' : s.status === 'suspended' ? 'badge-red' : 'badge-gray'}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => setIdCardStudent(s)}
                        className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-all"
                        title="View ID Card">
                        <CreditCard size={13} />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 text-white/50 hover:text-accent transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
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

export default Students;
