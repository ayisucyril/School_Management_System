import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, ChevronDown, Mail, Phone,
  BookOpen, TrendingUp, TrendingDown, Minus, Eye,
  GraduationCap, Calendar, Award, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../context/AuthContext';

// ── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const avatarColors = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
];
const avatarColor = (name = '') =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const gpaColor = gpa =>
  gpa >= 3.5 ? 'text-emerald-400' :
  gpa >= 2.5 ? 'text-primary' :
  gpa >= 1.5 ? 'text-amber-400' : 'text-red-400';

const gpaIcon = gpa =>
  gpa >= 3.5 ? <TrendingUp size={12} /> :
  gpa >= 2.5 ? <Minus size={12} /> : <TrendingDown size={12} />;

const statusStyles = {
  Active:           'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Needs Attention':'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Inactive:         'bg-white/5 text-white/40 border-white/10',
};

// ── Student Detail Modal ─────────────────────────────────────────────────────
const StudentModal = ({ student, onClose }) => {
  if (!student) return null;
  const color = avatarColor(student.name);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="bg-dark-100 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="font-heading font-semibold text-white text-sm">Student Profile</span>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-lg font-bold flex-shrink-0 ${color}`}>
                {getInitials(student.name)}
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">{student.name}</h3>
                <p className="text-white/40 text-xs mt-0.5 font-mono">{student.studentId}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full border ${statusStyles[student.status] || statusStyles['Inactive']}`}>
                  {student.status}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BookOpen,     label: 'Class',     value: student.class },
                { icon: GraduationCap,label: 'Subject',   value: student.subject },
                { icon: Calendar,     label: 'Enrolled',  value: student.enrolledDate || '—' },
                { icon: Award,        label: 'GPA',       value: student.gpa?.toFixed(1) || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-dark/60 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-white/30" />
                    <span className="text-white/30 text-xs">{label}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <p className="text-white/30 text-xs uppercase tracking-wider font-medium">Contact</p>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Mail size={14} className="text-white/30 flex-shrink-0" />
                <span>{student.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Phone size={14} className="text-white/30 flex-shrink-0" />
                <span>{student.phone || '—'}</span>
              </div>
            </div>

            {/* Guardian */}
            {student.guardian && (
              <div className="space-y-1">
                <p className="text-white/30 text-xs uppercase tracking-wider font-medium">Guardian</p>
                <p className="text-white/70 text-sm">{student.guardian}</p>
                {student.guardianPhone && (
                  <p className="text-white/40 text-xs font-mono">{student.guardianPhone}</p>
                )}
              </div>
            )}

            {/* Attendance */}
            {student.attendance != null && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium">Attendance</p>
                  <span className={`text-xs font-medium ${student.attendance >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {student.attendance}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${student.attendance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${student.attendance}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Row ───────────────────────────────────────────────────────────────────────
const StudentRow = ({ student, index, onView }) => {
  const color = avatarColor(student.name);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
    >
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
            {getInitials(student.name)}
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">{student.name}</p>
            <p className="text-white/30 text-xs font-mono leading-tight mt-0.5">{student.studentId}</p>
          </div>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="text-white/70 text-sm">{student.class}</span>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <span className="text-white/70 text-sm">{student.subject}</span>
      </td>

      {/* GPA */}
      <td className="px-4 py-3">
        <div className={`flex items-center gap-1 text-sm font-medium ${gpaColor(student.gpa)}`}>
          {gpaIcon(student.gpa)}
          {student.gpa?.toFixed(1)}
        </div>
      </td>

      {/* Attendance */}
      <td className="px-4 py-3">
        {student.attendance != null ? (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${student.attendance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${student.attendance}%` }}
              />
            </div>
            <span className={`text-xs ${student.attendance >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {student.attendance}%
            </span>
          </div>
        ) : <span className="text-white/20 text-sm">—</span>}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${statusStyles[student.status] || statusStyles['Inactive']}`}>
          {student.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <button
          onClick={() => onView(student)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-white/40 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
        >
          <Eye size={13} />
          View
        </button>
      </td>
    </motion.tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyStudents = () => {
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/teachers/my-students')
      .then(r => setStudents(r.data.students || []))
      .catch(() => setError('Could not load students.'))
      .finally(() => setLoading(false));
  }, []);

  const classes  = [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  const statuses = [...new Set(students.map(s => s.status).filter(Boolean))];

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchClass  = !classFilter  || s.class === classFilter;
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  // Summary stats
  const totalActive   = students.filter(s => s.status === 'Active').length;
  const avgGpa        = students.length
    ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(1)
    : '—';
  const needAttention = students.filter(s => s.status === 'Needs Attention').length;

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">My Students</h1>
          <p className="text-white/40 text-sm mt-0.5">Students assigned to you across all your classes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total students', value: students.length, icon: Users,         color: 'text-primary'       },
          { label: 'Active',          value: totalActive,      icon: GraduationCap, color: 'text-emerald-400'   },
          { label: 'Avg GPA',         value: avgGpa,           icon: Award,         color: 'text-amber-400'     },
          { label: 'Need attention',  value: needAttention,    icon: AlertCircle,   color: 'text-red-400'       },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-100 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-white/40 text-xs">{label}</span>
            </div>
            <p className="text-white font-heading font-bold text-2xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-dark-100 border border-white/5 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 border-b border-white/5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, ID or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {/* Class filter */}
            <div className="relative">
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-7 py-2 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="">All classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-7 py-2 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="">All statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>

          <span className="text-white/20 text-xs hidden sm:block whitespace-nowrap">
            {filtered.length} of {students.length}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/20 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b border-primary mr-3" />
            Loading students…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-white/30 text-sm">
            <AlertCircle size={24} className="text-red-400/50" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-white/20 text-sm">
            <Users size={28} className="opacity-30" />
            {search || classFilter || statusFilter ? 'No students match your filters.' : 'No students assigned yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Student', 'Class', 'Subject', 'GPA', 'Attendance', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <StudentRow key={s._id || s.studentId} student={s} index={i} onView={setSelected} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MyStudents;
