import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Check } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = { present: 'badge-green', absent: 'badge-red', late: 'badge-yellow', excused: 'badge-gray' };

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState({});
  const [saving, setSaving] = useState(false);

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

  const startBulkMark = () => {
    const filtered = selectedClass ? students.filter(s => s.classId?._id === selectedClass || s.classId === selectedClass) : students;
    const init = {};
    filtered.forEach(s => init[s._id] = 'present');
    setBulkData(init);
    setBulkMode(true);
  };

  const saveBulkAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(bulkData).map(([studentId, status]) => ({
        studentId, status, date: new Date(date), classId: selectedClass || undefined
      }));
      await api.post('/attendance/bulk', { records });
      toast.success(`Marked attendance for ${records.length} students`);
      setBulkMode(false);
      const res = await api.get('/attendance', { params: { date, classId: selectedClass || undefined } });
      setAttendance(res.data.attendance || []);
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const filteredStudents = selectedClass
    ? students.filter(s => s.classId?._id === selectedClass || s.classId === selectedClass)
    : students;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="section-title">Attendance</h1><p className="text-white/40 text-sm mt-0.5">Track daily attendance</p></div>
        {!bulkMode && (
          <button onClick={startBulkMark} className="btn-primary flex items-center gap-2">
            <CalendarCheck size={16} /> Mark Attendance
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field max-w-40" />
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field max-w-48">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name} - Grade {c.grade}</option>)}
        </select>
      </div>

      {/* Bulk Mark Mode */}
      {bulkMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white">Mark Attendance — {date}</h3>
            <div className="flex gap-2">
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
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{s.name[0]}</div>
                  <span className="text-white text-sm">{s.name}</span>
                </div>
                <select value={bulkData[s._id] || 'present'} onChange={e => setBulkData(b => ({ ...b, [s._id]: e.target.value }))}
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

      {/* Attendance Records */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Class', 'Date', 'Status', 'Remarks'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10">
                  <CalendarCheck size={36} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No attendance records for this date</p>
                </td></tr>
              ) : attendance.map((a, i) => (
                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                  <td className="py-3 px-4 text-white text-sm">{a.studentId?.name || '—'}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{a.classId?.name || '—'}</td>
                  <td className="py-3 px-4 text-white/50 text-xs">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><span className={statusColors[a.status] || 'badge-gray'}>{a.status}</span></td>
                  <td className="py-3 px-4 text-white/40 text-xs">{a.remarks || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
