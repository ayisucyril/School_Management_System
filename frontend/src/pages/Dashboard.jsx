import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, BookOpen, Megaphone, CalendarCheck,
  TrendingUp, Award, Mail, Phone, MapPin, BadgeCheck, BookMarked,
  Clock, Star, Edit2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

// ─── Shared StatCard ──────────────────────────────────────────────────────────
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

// ─── TEACHER DASHBOARD ────────────────────────────────────────────────────────
const TeacherDashboard = ({ user }) => {
  const [profile, setProfile]       = useState(null);
  const [gradeStats, setGradeStats] = useState([]);
  const [myClasses, setMyClasses]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    Promise.all([
      api.get('/teachers').catch(() => ({ data: { teachers: [] } })),
      api.get('/dashboard/stats').catch(() => ({ data: {} })),
      api.get('/classes').catch(() => ({ data: { classes: [] } })),
    ]).then(([teacherRes, dashRes, classRes]) => {
      // Find this teacher's profile
      const found = teacherRes.data.teachers?.find(t => t.userId === user._id || t.email === user.email);
      setProfile(found || null);
      setGradeStats(dashRes.data.gradeStats || []);
      // Filter classes assigned to this teacher
      const assigned = classRes.data.classes?.filter(c => c.teacherId?._id === found?._id || c.teacherId === found?._id);
      setMyClasses(assigned || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';
  const avatarUrl = profile?.avatar ? `${BACKEND}${profile.avatar}` : null;
  const initials  = (profile?.name || user?.name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const infoRows = [
    { icon: Mail,       label: 'Email',          value: profile?.email || user?.email || '—' },
    { icon: Phone,      label: 'Phone',           value: profile?.phone || '—' },
    { icon: MapPin,     label: 'Address',         value: profile?.address || '—' },
    { icon: BookMarked, label: 'Subject',         value: profile?.subject || '—' },
    { icon: Star,       label: 'Qualification',   value: profile?.qualification || '—' },
    { icon: Clock,      label: 'Experience',      value: profile?.experience ? `${profile.experience} year(s)` : '—' },
    { icon: BadgeCheck, label: 'Status',          value: profile?.status || '—' },
    { icon: CalendarCheck, label: 'Joined',       value: profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Greeting ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Good {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass-green px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-sm font-medium">System Active</span>
        </div>
      </motion.div>

      {/* ── Profile card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">

          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/40" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-3xl font-bold">
                  {initials}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-100 ${profile?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              profile?.status === 'active' ? 'bg-green-500/15 text-green-400' :
              profile?.status === 'on-leave' ? 'bg-yellow-500/15 text-yellow-400' :
              'bg-gray-500/15 text-gray-400'
            }`}>
              {profile?.status || 'active'}
            </span>
          </div>

          {/* Name & ID */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white">{profile?.name || user?.name}</h2>
                <p className="text-primary text-sm font-medium mt-0.5">{profile?.subject || 'Teacher'}</p>
                <p className="text-white/40 text-xs mt-1 font-mono">ID: {profile?.teacherId || '—'}</p>
              </div>
              <div className="glass-green px-3 py-1.5 flex items-center gap-2">
                <GraduationCap size={14} className="text-primary" />
                <span className="text-primary text-xs font-medium">Teaching Staff</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mt-4">
              {infoRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={14} className="text-primary/60 flex-shrink-0" />
                  <span className="text-white/40 text-xs w-24 flex-shrink-0">{label}:</span>
                  <span className="text-white/80 text-xs truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen,     label: 'My Classes',      value: myClasses.length,                     color: 'bg-blue-500/15 text-blue-400',   delay: 0.15 },
          { icon: TrendingUp,   label: 'Subjects Taught', value: profile?.subject ? 1 : 0,             color: 'bg-primary/15 text-primary',     delay: 0.2  },
          { icon: Clock,        label: 'Years Experience',value: profile?.experience ?? '—',            color: 'bg-purple-500/15 text-purple-400', delay: 0.25 },
        ].map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* ── My classes + Grade chart ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* My classes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-primary" />
            <h3 className="font-heading font-semibold text-white">My Classes</h3>
          </div>
          <div className="space-y-3">
            {myClasses.length > 0 ? myClasses.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  <p className="text-white/40 text-xs">Grade {c.grade}{c.section} · Room {c.room || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">{c.academicYear}</p>
                  <p className="text-white/40 text-xs">Cap: {c.capacity}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-white/20 text-sm">No classes assigned yet</div>
            )}
          </div>
        </motion.div>

        {/* Grade chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-heading font-semibold text-white">Average Scores by Subject</h3>
          </div>
          {gradeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeStats.map(g => ({ name: g._id, score: Math.round(g.avgScore) }))}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="score" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No grade data yet</div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = ({ user }) => {
  const [stats, setStats]               = useState({ students: 0, teachers: 0, classes: 0, announcements: 0, todayAttendance: 0 });
  const [gradeStats, setGradeStats]     = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats(res.data.stats);
      setGradeStats(res.data.gradeStats || []);
      setAnnouncements(res.data.recentAnnouncements || []);
      setRecentStudents(res.data.recentStudents || []);
    }).catch(() => {});
  }, []);

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  const statCards = [
    { icon: Users,         label: 'Active Students',    value: stats.students,        color: 'bg-primary/15 text-primary',       delay: 0     },
    { icon: GraduationCap, label: 'Active Teachers',    value: stats.teachers,        color: 'bg-accent/15 text-accent',         delay: 0.07  },
    { icon: BookOpen,      label: 'Total Classes',      value: stats.classes,         color: 'bg-blue-500/15 text-blue-400',     delay: 0.14  },
    { icon: CalendarCheck, label: "Today's Attendance", value: stats.todayAttendance, color: 'bg-green-500/15 text-green-400',   delay: 0.21  },
    { icon: Megaphone,     label: 'Announcements',      value: stats.announcements,   color: 'bg-purple-500/15 text-purple-400', delay: 0.28  },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Good {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
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

// ─── ROOT: pick dashboard based on role ──────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'teacher'
    ? <TeacherDashboard user={user} />
    : <AdminDashboard user={user} />;
};

export default Dashboard;
