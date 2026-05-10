import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Check, Lock, AlertCircle } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  present: 'badge-green',
  absent:  'badge-red',
  late:    'badge-yellow',
  excused: 'badge-gray'
};

// Check if a given date string is today
const isToday = dateStr => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

// Check if attendance record was marked today (editable)
const isEditableRecord = record => {
  const markedDate = new Date(record.date).toISOString().split('T')[0];
  return isToday(markedDate);
};

const Attendance = () => {
  const [attendance, setAttendance]     = useState([]);
  const [students, setStudents]         = useState([]);
  const [classes, setClasses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [date, setDate]                 = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [bulkMode, setBulkMode]         = useState(false);
  const [bulkData, setBulkData]         = useState({});
  const [saving, setSaving]             = useState(false);
  const [editingId, setEditingId]       = useState(null); // attendance record being corrected
  const [editStatus, setEditStatus]     = useState('');

  useEffect(() => {
    api.get('/attendance', { params: { date, classId: selectedClass || undefined } })
      .then(r => setAttendance(r.data.attendance || [])).catch(() => {});
  }, [date, selectedClass]);

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => setStudents(r.data.students || [])),
      api.get('/classes').then(r => setClasses(r.data.classes || []))
    ]).finally(() => setLoading(false));
  }, []);

  // ── Mark attendance (requires class selected) ──────────────────────────────
  const startBulkMark = () => {
    if (!selectedClass) {
      toast.error('Please select a class before marking attendance.');
      return;
    }
    const filtered = students.filter(s => s.classId?._id === selectedClass || s.classId === selectedClass);
    if (filtered.length === 0) {
      toast.error('No students found in this class.');
      return;
    }
    const init = {};
    filtered.forEach(s => init[s._id] = 'present');
    setBulkData(init);
    setBulkMode(true);
  };

  const saveBulkAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(bulkData).map(([studentId, status]) => ({
        studentId, status, date: new Date(date), classId: selectedClass
      }));
      await api.post('/attendance/bulk', { records });
      toast.success(`Attendance marked for ${records.length} students`);
      setBulkMode(false);
      const res = await api.get('/attendance', { params: { date, classId: selectedClass || undefined } });
      setAttendance(res.data.attendance || []);
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  // ── Correct attendance (same day only) ────────────────────────────────────
  const startEdit = record => {
    setEditingId(record._id);
    setEditStatus(record.status);
  };

  const saveEdit = async record => {
    try {
      await api.put(`/attendance/${record._id}`, { status: editStatus });
      setAttendance(prev => prev.map(a => a._id === record._id ? { ...a, status: editStatus } : a));
      toast.success('Attendance corrected');
      setEditingId(null);
    } catch { toast.error('Failed to update'); }
  };

  const filteredStudents = selectedClass
    ? students.filter(s => s.classId?._id === selectedClass || s.classId === selectedClass)
    : students;

  const todaySelected = isToday(date);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Attendance</h1>
          <p className="text-white/40 text-sm mt-0.5">Track daily attendance</p>
        </div>
        {!bulkMode && (
          <div className="flex items-center gap-3">
            {/* Tooltip hint when no class selected */}
            {!selectedClass && (
              <div className="flex items-center gap-1.5 text-yellow-400/70 text-xs">
                <AlertCircle size={13} />
                <span>Select a class first</span>
              </div>
            )}
            <button
              onClick={startBulkMark}
              disabled={!selectedClass}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedClass
                  ? 'btn-primary'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              }`}
            >
              <CalendarCheck size={16} /> Mark Attendance
            </button>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field max-w-40" />
        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setBulkMode(false); }} className="input-field max-w-48">
          <option value="">— Select Class —</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>)}
        </select>
        {!todaySelected && (
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Lock size={12} />
            <span>Viewing past records — editing not allowed</span>
          </div>
        )}
      </div>

      {/* ── Bulk Mark Mode ── */}
      {bulkMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-white">Mark Attendance</h3>
              <p className="text-white/40 text-xs mt-0.5">
                {classes.find(c => c._id === selectedClass)?.name} · {date} · {filteredStudents.length} students
              </p>
            </div>
            <div className="flex gap-2">
              {/* Quick-set all buttons */}
              <div className="flex gap-1 mr-2">
                {['present', 'absent'].map(s => (
                  <button key={s} type="button"
                    onClick={() => setBulkData(prev => Object.fromEntries(Object.keys(prev).map(id => [id, s])))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      s === 'present' ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    }`}>
                    All {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={saveBulkAttendance} disabled={saving} className="btn-primary flex items-center gap-2 text-xs">
                {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={13} />}
                Save All
              </button>
              <button onClick={() => setBulkMode(false)} className="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStudents.map(s => (
              <div key={s._id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {s.name[0]}
                  </div>
                  <span className="text-white text-sm">{s.name}</span>
                </div>
                <select
                  value={bulkData[s._id] || 'present'}
                  onChange={e => setBulkData(b => ({ ...b, [s._id]: e.target.value }))}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary/50">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Attendance Records ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Class', 'Date', 'Status', 'Remarks', todaySelected ? 'Correct' : ''].map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10">
                  <CalendarCheck size={36} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No attendance records for this date</p>
                  {!selectedClass && <p className="text-white/20 text-xs mt-1">Select a class and mark attendance above</p>}
                </td></tr>
              ) : attendance.map((a, i) => {
                const editable = isEditableRecord(a) && todaySelected;
                const isEditing = editingId === a._id;

                return (
                  <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }} className="table-row">
                    <td className="py-3 px-4 text-white text-sm">{a.studentId?.name || '—'}</td>
                    <td className="py-3 px-4 text-white/50 text-xs">{a.classId?.name || '—'}</td>
                    <td className="py-3 px-4 text-white/50 text-xs">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                          className="text-xs bg-white/5 border border-primary/40 rounded-lg px-2 py-1 text-white focus:outline-none">
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      ) : (
                        <span className={statusColors[a.status] || 'badge-gray'}>{a.status}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/40 text-xs">{a.remarks || '—'}</td>
                    <td className="py-3 px-4">
                      {editable ? (
                        isEditing ? (
                          <div className="flex gap-1.5">
                            <button onClick={() => saveEdit(a)}
                              className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-all">
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-white/40 text-xs hover:text-white transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(a)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-yellow-500/10 text-white/30 hover:text-yellow-400 text-xs transition-all border border-white/5 hover:border-yellow-500/20">
                            Correct
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1 text-white/15 text-xs">
                          <Lock size={10} />
                          <span>Locked</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;