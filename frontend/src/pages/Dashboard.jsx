import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Megaphone, CalendarCheck, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="stat-card">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-3xl font-bold font-heading text-white mb-1">{value}</div>
    <div className="text-white/40 text-sm">{label}</div>
  </motion.div>
);

const COLORS = ['#16a34a', '#eab308', '#22c55e', '#facc15', '#86efac'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0, todayAttendance: 0 });
  const [gradeStats, setGradeStats] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats(res.data.stats);
      setGradeStats(res.data.gradeStats || []);
      setAnnouncements(res.data.recentAnnouncements || []);
      setRecentStudents(res.data.recentStudents || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, label: 'Active Students', value: stats.students, color: 'bg-primary/15 text-primary', delay: 0 },
    { icon: GraduationCap, label: 'Active Teachers', value: stats.teachers, color: 'bg-accent/15 text-accent', delay: 0.07 },
    { icon: BookOpen, label: 'Total Classes', value: stats.classes, color: 'bg-blue-500/15 text-blue-400', delay: 0.14 },
    { icon: CalendarCheck, label: "Today's Attendance", value: stats.todayAttendance, color: 'bg-green-500/15 text-green-400', delay: 0.21 },
    { icon: Megaphone, label: 'Announcements', value: stats.announcements, color: 'bg-purple-500/15 text-purple-400', delay: 0.28 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass-green px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-sm font-medium">System Active</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts & Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grade Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-heading font-semibold text-white">Average Scores by Subject</h3>
          </div>
          {gradeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeStats.map(g => ({ name: g._id, score: Math.round(g.avgScore) }))}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="score" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No grade data yet</div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-accent" />
            <h3 className="font-heading font-semibold text-white">Recent Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.length > 0 ? announcements.map(a => (
              <div key={a._id} className="p-3 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-white text-sm font-medium line-clamp-1">{a.title}</span>
                  <span className={`flex-shrink-0 ${a.priority === 'high' ? 'badge-red' : a.priority === 'medium' ? 'badge-yellow' : 'badge-gray'}`}>
                    {a.priority}
                  </span>
                </div>
                <p className="text-white/40 text-xs line-clamp-2">{a.content}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-white/20 text-sm">No announcements yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Students */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-primary" />
          <h3 className="font-heading font-semibold text-white">Recently Enrolled Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'ID', 'Class', 'Status', 'Enrolled'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentStudents.length > 0 ? recentStudents.map(s => (
                <tr key={s._id} className="table-row">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {s.name[0]}
                      </div>
                      <span className="text-white text-sm">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-white/50 text-xs font-mono">{s.studentId}</td>
                  <td className="py-2.5 px-3 text-white/50 text-xs">{s.classId?.name || '—'}</td>
                  <td className="py-2.5 px-3">
                    <span className={s.status === 'active' ? 'badge-green' : 'badge-gray'}>{s.status}</span>
                  </td>
                  <td className="py-2.5 px-3 text-white/40 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-8 text-white/20 text-sm">No students enrolled yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
