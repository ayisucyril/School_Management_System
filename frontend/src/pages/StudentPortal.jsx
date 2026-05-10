import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, FileText, Megaphone, Building,
  CreditCard, Activity, Lock, LogOut, Search, Bell, Settings,
  BookOpen, BarChart3, Receipt, CalendarCheck, ChevronDown,
  Download, Eye, Clock, Mail, Phone, MapPin, Calendar,
  Users, GraduationCap, BadgeCheck, Star, X
} from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [payOpen, setPayOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student_read_announcements') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    api.get('/announcements').then(r => {
      const data = r.data.announcements || [];
      setAnnouncements(data);
      setUnreadCount(data.filter(a => !readIds.includes(a._id)).length);
    }).catch(() => {});

    api.get('/students').then(r => {
      const students = r.data.students || [];
      const mine = students.find(s =>
        s.userId === user?._id ||
        s.userId?._id === user?._id ||
        s.email === user?.email
      );
      setStudentProfile(mine || null);
    }).catch(() => {});

    api.get('/grades').then(r => setGrades(r.data.grades || [])).catch(() => {});
    api.get('/attendance').then(r => setAttendance(r.data.attendance || [])).catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const markRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('student_read_announcements', JSON.stringify(updated));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    const allIds = announcements.map(a => a._id);
    setReadIds(allIds);
    localStorage.setItem('student_read_announcements', JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const studentName = user?.name || 'Student';
  const studentId = studentProfile?.studentId || '—';
  const className = studentProfile?.classId?.name || '—';
  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  // Filter grades for this student
  const myGrades = grades.filter(g =>
    g.studentId?._id === studentProfile?._id ||
    g.studentId === studentProfile?._id
  );
  const uniqueSubjects = [...new Set(myGrades.map(g => g.subject))];
  const avgScore = myGrades.length > 0
    ? Math.round(myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length)
    : 0;

  // Filter attendance for this student
  const myAttendance = attendance.filter(a =>
    a.studentId?._id === studentProfile?._id ||
    a.studentId === studentProfile?._id
  );
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const attendancePct = myAttendance.length > 0
    ? Math.round((presentDays / myAttendance.length) * 100)
    : 0;

  const subjectScores = uniqueSubjects.map(subject => {
    const sg = myGrades.filter(g => g.subject === subject);
    const avg = Math.round(sg.reduce((s, g) => s + g.score, 0) / sg.length);
    return { name: subject, score: avg, grades: sg };
  });

  const gradeColor = score =>
    score >= 70 ? 'text-primary' :
    score >= 50 ? 'text-accent' : 'text-red-400';

  const gradeBarColor = score =>
    score >= 70 ? 'bg-primary' :
    score >= 50 ? 'bg-accent' : 'bg-red-500';

  const gradeLetter = score => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  const priorityColor = p =>
    p === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
    p === 'medium' ? 'bg-accent/10 text-accent border border-accent/20' :
    'bg-primary/10 text-primary border border-primary/20';

  const navItem = (id, icon, label, badge = null) => (
    <button
      key={id}
      onClick={() => setActiveMenu(id)}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        activeMenu === id
          ? 'bg-primary/15 text-primary'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
          badge === 'NEW' ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  // ── DASHBOARD SECTION ──────────────────────────────────────────
  const DashboardSection = () => (
    <div className="space-y-5">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
      >
        <div>
          <h2 className="text-white text-xl font-heading font-bold mb-1">
            Good {greeting}, {studentName.split(' ')[0]}! 👋
          </h2>
          <p className="text-white/80 text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread announcement${unreadCount !== 1 ? 's' : ''}.`
              : 'Welcome to your student portal.'}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-medium">
            {new Date().getFullYear()} — {className}
          </div>
          <div className="text-white/70 text-xs font-mono">{studentId}</div>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-4xl font-bold">
              {studentName[0]?.toUpperCase()}
            </div>
            <span className="badge-green text-xs capitalize">
              {studentProfile?.status || 'active'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white">{studentName}</h2>
                <p className="text-primary text-sm font-medium mt-0.5">Student</p>
                <p className="text-white/40 text-xs mt-1 font-mono">ID: {studentId}</p>
              </div>
              <div className="glass-green px-3 py-1.5 flex items-center gap-2">
                <GraduationCap size={14} className="text-primary" />
                <span className="text-primary text-xs font-medium">{className}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {[
                { icon: Mail, label: 'Email', value: studentProfile?.email || user?.email || '—' },
                { icon: Phone, label: 'Phone', value: studentProfile?.phone || '—' },
                { icon: MapPin, label: 'Address', value: studentProfile?.address || '—' },
                { icon: Calendar, label: 'Date of Birth', value: studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { icon: Users, label: 'Gender', value: studentProfile?.gender || '—' },
                { icon: BadgeCheck, label: 'Class', value: className },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={14} className="text-primary/60 flex-shrink-0" />
                  <span className="text-white/40 text-xs w-24 flex-shrink-0">{label}:</span>
                  <span className="text-white/80 text-xs truncate capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen size={20} className="text-primary" />, bg: 'bg-primary/15', label: 'Subjects', value: uniqueSubjects.length || '—', trend: 'Registered subjects', up: true },
          { icon: <BarChart3 size={20} className="text-blue-400" />, bg: 'bg-blue-500/15', label: 'Grade Average', value: myGrades.length > 0 ? `${avgScore}%` : '—', trend: `${gradeLetter(avgScore)} grade`, up: avgScore >= 50 },
          { icon: <Receipt size={20} className="text-red-400" />, bg: 'bg-red-500/15', label: 'Outstanding Fees', value: 'GHS 0', trend: 'No pending fees', up: true },
          { icon: <CalendarCheck size={20} className="text-accent" />, bg: 'bg-accent/15', label: 'Attendance', value: myAttendance.length > 0 ? `${attendancePct}%` : '—', trend: `${presentDays} of ${myAttendance.length} days`, up: attendancePct >= 75 },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-4"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-white/50 text-xs mb-1">{s.label}</div>
            <div className="text-white text-2xl font-heading font-bold mb-1">{s.value}</div>
            <div className={`text-xs ${s.up ? 'text-primary' : 'text-red-400'}`}>
              {s.up ? '↑' : '⚠'} {s.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions + Announcements */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Eye size={15} className="text-primary" />, label: 'View Results', action: () => setActiveMenu('results') },
              { icon: <FileText size={15} className="text-primary" />, label: 'Bio Data', action: () => setActiveMenu('biodata') },
              { icon: <CreditCard size={15} className="text-primary" />, label: 'Pay Fees', action: () => {} },
              { icon: <Download size={15} className="text-primary" />, label: 'Transcript', action: () => {} },
            ].map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="flex items-center gap-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white transition-all"
              >
                {a.icon} {a.label}
              </button>
            ))}
            <button
              onClick={() => setActiveMenu('announcements')}
              className="col-span-2 flex items-center gap-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white transition-all"
            >
              <Megaphone size={15} className="text-primary" /> View Announcements
            </button>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Megaphone size={16} className="text-accent" /> Recent Announcements
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {announcements.length > 0 ? announcements.slice(0, 4).map(a => (
              <div key={a._id} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  a.priority === 'high' ? 'bg-red-500' :
                  a.priority === 'medium' ? 'bg-accent' : 'bg-primary'
                }`} />
                <div>
                  <div className="text-white text-sm font-medium">{a.title}</div>
                  <div className="text-white/30 text-xs">{new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-white/20 text-sm">No announcements yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── BIO DATA SECTION ───────────────────────────────────────────
  const BioDataSection = () => (
    <div className="space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <User size={22} className="text-primary" /> Bio Data
      </h1>

      <div className="glass-card p-6">
        {/* Avatar + name */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6 pb-6 border-b border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-3xl font-bold flex-shrink-0">
            {studentName[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-white">{studentName}</h2>
            <p className="text-primary text-sm mt-0.5">Student · {className}</p>
            <p className="text-white/40 text-xs mt-1 font-mono">{studentId}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6">
          <p className="text-primary text-xs font-medium uppercase tracking-widest mb-4">Personal Information</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', value: studentProfile?.name || studentName },
              { label: 'Email Address', value: studentProfile?.email || user?.email || '—' },
              { label: 'Phone Number', value: studentProfile?.phone || '—' },
              { label: 'Gender', value: studentProfile?.gender || '—' },
              { label: 'Date of Birth', value: studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { label: 'Home Address', value: studentProfile?.address || '—' },
            ].map(item => (
              <div key={item.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="text-white/40 text-xs mb-1">{item.label}</div>
                <div className="text-white text-sm font-medium capitalize">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Info */}
        <div className="mb-6">
          <p className="text-primary text-xs font-medium uppercase tracking-widest mb-4">Academic Information</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Student ID', value: studentId },
              { label: 'Class / Programme', value: className },
              { label: 'Enrollment Status', value: studentProfile?.status || 'active' },
              { label: 'Enrollment Date', value: studentProfile?.enrollmentDate ? new Date(studentProfile.enrollmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
            ].map(item => (
              <div key={item.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="text-white/40 text-xs mb-1">{item.label}</div>
                <div className="text-white text-sm font-medium capitalize">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Parent / Guardian Info */}
        <div>
          <p className="text-primary text-xs font-medium uppercase tracking-widest mb-4">Parent / Guardian Information</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Parent / Guardian Name', value: studentProfile?.parentName || '—' },
              { label: 'Parent Phone', value: studentProfile?.parentPhone || '—' },
              { label: 'Parent Email', value: studentProfile?.parentEmail || '—' },
            ].map(item => (
              <div key={item.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="text-white/40 text-xs mb-1">{item.label}</div>
                <div className="text-white text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS SECTION ────────────────────────────────────────────
  const ResultsSection = () => {
    const terms = [...new Set(myGrades.map(g => g.term))];

    return (
      <div className="space-y-5">
        <h1 className="section-title flex items-center gap-2">
          <FileText size={22} className="text-primary" /> Statement of Results
        </h1>

        {myGrades.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <BarChart3 size={48} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No results uploaded yet.</p>
            <p className="text-white/20 text-sm mt-1">Your grades will appear here once uploaded by your teacher.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Subjects', value: uniqueSubjects.length },
                { label: 'Overall Average', value: `${avgScore}%` },
                { label: 'Overall Grade', value: gradeLetter(avgScore) },
                { label: 'Total Records', value: myGrades.length },
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className={`text-2xl font-heading font-bold mb-1 ${gradeColor(avgScore)}`}>{s.value}</div>
                  <div className="text-white/40 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Results by term */}
            {terms.length > 0 ? terms.map(term => {
              const termGrades = myGrades.filter(g => g.term === term);
              const termAvg = Math.round(termGrades.reduce((s, g) => s + g.score, 0) / termGrades.length);
              return (
                <div key={term} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/3">
                    <h3 className="font-heading font-semibold text-white">{term}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs">Average:</span>
                      <span className={`font-mono font-bold text-sm ${gradeColor(termAvg)}`}>{termAvg}% — {gradeLetter(termAvg)}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Subject', 'Score', 'Grade', 'Remarks'].map(h => (
                            <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {termGrades.map((g, i) => (
                          <tr key={g._id || i} className="table-row">
                            <td className="py-3 px-4 text-white text-sm font-medium">{g.subject}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold text-sm ${gradeColor(g.score)}`}>{g.score}%</span>
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-20">
                                  <div
                                    className={`h-full rounded-full ${gradeBarColor(g.score)}`}
                                    style={{ width: `${g.score}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-bold font-mono ${gradeColor(g.score)}`}>
                                {gradeLetter(g.score)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white/40 text-xs">{g.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Subject', 'Score', 'Grade', 'Term', 'Remarks'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-white/40 text-xs font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myGrades.map((g, i) => (
                        <tr key={g._id || i} className="table-row">
                          <td className="py-3 px-4 text-white text-sm">{g.subject}</td>
                          <td className="py-3 px-4 font-mono font-bold text-sm">{g.score}%</td>
                          <td className={`py-3 px-4 font-bold text-sm ${gradeColor(g.score)}`}>{gradeLetter(g.score)}</td>
                          <td className="py-3 px-4 text-white/40 text-xs">{g.term}</td>
                          <td className="py-3 px-4 text-white/40 text-xs">{g.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ── ANNOUNCEMENTS SECTION ──────────────────────────────────────
  const AnnouncementsSection = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title flex items-center gap-2">
          <Megaphone size={22} className="text-primary" /> Announcements
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-outline text-xs py-1.5">
            Mark all read
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Megaphone size={48} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => {
            const isRead = readIds.includes(a._id);
            return (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => markRead(a._id)}
                className={`glass-card p-5 cursor-pointer hover:border-white/20 transition-all ${!isRead ? 'border-primary/20 bg-primary/3' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!isRead ? 'bg-red-500' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <h3 className={`font-heading font-semibold text-lg ${!isRead ? 'text-white' : 'text-white/70'}`}>
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priorityColor(a.priority)}`}>
                          {a.priority}
                        </span>
                        <span className="text-xs bg-white/5 text-white/40 border border-white/10 px-2.5 py-0.5 rounded-full capitalize">
                          {a.targetAudience}
                        </span>
                        {!isRead && (
                          <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">{a.content}</p>
                    <div className="flex items-center gap-3 text-white/25 text-xs">
                      <Clock size={12} />
                      <span>{new Date(a.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {a.authorName && <><span>·</span><span>By {a.authorName}</span></>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── ACCOMMODATION SECTION ──────────────────────────────────────
  const AccommodationSection = () => (
    <div className="space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <Building size={22} className="text-primary" /> Accommodation
      </h1>
      <div className="glass-card p-10 text-center">
        <Building size={48} className="mx-auto mb-3 text-white/20" />
        <p className="text-white/40">Accommodation module coming soon.</p>
      </div>
    </div>
  );

  // ── ACTIVITY LOGS SECTION ──────────────────────────────────────
  const ActivitySection = () => (
    <div className="space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <Activity size={22} className="text-primary" /> Activity Logs
      </h1>
      <div className="glass-card p-6">
        <div className="space-y-3">
          {[
            { action: 'Logged into student portal', time: 'Just now' },
            { action: 'Viewed statement of results', time: 'Today' },
            { action: 'Read announcement', time: 'Today' },
            { action: 'Updated profile', time: 'Yesterday' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-white/70 text-sm">{log.action}</span>
              </div>
              <span className="text-white/30 text-xs">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESET PASSWORD SECTION ─────────────────────────────────────
  const ResetPasswordSection = () => {
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
      e.preventDefault();
      if (form.newPass !== form.confirm) { toast.error('Passwords do not match'); return; }
      if (form.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      setLoading(true);
      try {
        await api.put('/auth/change-password', { currentPassword: form.current, newPassword: form.newPass });
        toast.success('Password changed successfully!');
        setForm({ current: '', newPass: '', confirm: '' });
      } catch (e) {
        toast.error(e.response?.data?.error || 'Failed to change password');
      } finally { setLoading(false); }
    };

    return (
      <div className="space-y-5">
        <h1 className="section-title flex items-center gap-2">
          <Lock size={22} className="text-primary" /> Reset Password
        </h1>
        <div className="glass-card p-6 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPass' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-white/50 text-xs mb-1.5">{f.label}</label>
                <input
                  type="password"
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  };

  const sections = {
    dashboard: <DashboardSection />,
    biodata: <BioDataSection />,
    results: <ResultsSection />,
    announcements: <AnnouncementsSection />,
    accommodation: <AccommodationSection />,
    activity: <ActivitySection />,
    password: <ResetPasswordSection />,
  };

  return (
    <div className="flex min-h-screen bg-dark text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Fixed Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-dark-100 border-r border-white/5 flex flex-col fixed top-0 left-0 h-screen z-30">
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm">EduManage</div>
            <div className="text-white/40 text-xs">Student Portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-white/25 text-xs font-medium uppercase tracking-widest px-3 pt-2 pb-1">Main Menu</p>
          {navItem('dashboard', <LayoutDashboard size={16} />, 'Dashboard')}
          {navItem('biodata', <User size={16} />, 'Bio Data')}
          {navItem('results', <FileText size={16} />, 'Statement of Results')}
          {navItem('announcements', <Megaphone size={16} />, 'Announcements', unreadCount > 0 ? String(unreadCount) : null)}
          {navItem('accommodation', <Building size={16} />, 'Accommodation')}

          <p className="text-white/25 text-xs font-medium uppercase tracking-widest px-3 pt-4 pb-1">Finance</p>
          <button
            onClick={() => setPayOpen(!payOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <CreditCard size={16} />
            <span>Payments</span>
            <ChevronDown size={14} className={`ml-auto transition-transform ${payOpen ? 'rotate-180' : ''}`} />
          </button>
          {payOpen && (
            <div className="ml-7 space-y-0.5">
              {['Pay Fees', 'Payment History', 'Fee Structure'].map(item => (
                <button key={item} className="block w-full text-left px-3 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  {item}
                </button>
              ))}
            </div>
          )}

          <p className="text-white/25 text-xs font-medium uppercase tracking-widest px-3 pt-4 pb-1">Account</p>
          {navItem('activity', <Activity size={16} />, 'Activity Logs')}
          {navItem('password', <Lock size={16} />, 'Reset Password')}
        </nav>

        {/* User + sign out */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
              {studentName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{studentName}</div>
              <div className="text-white/40 text-xs">Student</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main (offset by sidebar) ── */}
      <div className="flex-1 flex flex-col min-w-0 ml-56">

        {/* Topbar */}
        <header className="h-14 bg-dark-100 border-b border-white/5 flex items-center gap-3 px-5 flex-shrink-0 sticky top-0 z-20">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-heading font-semibold text-white text-sm whitespace-nowrap">
            Student Portal Dashboard
          </span>

          <div className="relative flex-1 max-w-xs ml-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-primary transition-colors"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-10 w-80 bg-dark-100 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <span className="font-heading font-semibold text-white text-sm">
                        Announcements
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">{unreadCount}</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && <button onClick={markAllRead} className="text-primary text-xs hover:underline">Mark all read</button>}
                        <button onClick={() => setNotifOpen(false)} className="text-white/30 hover:text-white"><X size={14} /></button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {announcements.length === 0 ? (
                        <div className="text-center py-8 text-white/20 text-sm">No announcements yet</div>
                      ) : announcements.map(a => (
                        <div
                          key={a._id}
                          onClick={() => { markRead(a._id); setNotifOpen(false); setActiveMenu('announcements'); }}
                          className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!readIds.includes(a._id) ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!readIds.includes(a._id) ? 'bg-red-500' : 'bg-transparent'}`} />
                            <div>
                              <div className={`text-sm font-medium ${!readIds.includes(a._id) ? 'text-white' : 'text-white/50'}`}>{a.title}</div>
                              <div className="text-white/30 text-xs mt-0.5 line-clamp-1">{a.content}</div>
                              <div className="text-white/20 text-xs mt-1">{new Date(a.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {studentName[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-white text-sm font-medium leading-tight">{studentName}</div>
              <div className="text-white/40 text-xs font-mono">{studentId}</div>
            </div>
            <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {sections[activeMenu] || <DashboardSection />}
            </motion.div>
          </AnimatePresence>

          <div className="text-center text-white/20 text-xs mt-8 pb-2">
            © {new Date().getFullYear()} EduManage University Student Portal
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;