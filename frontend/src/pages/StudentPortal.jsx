import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, FileText, ClipboardList, Award,
  Megaphone, Building, CreditCard, Activity, Lock, LogOut,
  Search, Bell, Settings, BookOpen, BarChart3, Receipt,
  CalendarCheck, ChevronDown, Download, Eye, Clock
} from 'lucide-react';

const StudentPortal = () => {
  const [regOpen, setRegOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const subjects = [
    { name: 'Mathematics', score: 85, color: 'bg-primary' },
    { name: 'Data Structures', score: 92, color: 'bg-primary' },
    { name: 'Web Development', score: 70, color: 'bg-accent' },
    { name: 'Database Systems', score: 55, color: 'bg-accent' },
    { name: 'Networks', score: 40, color: 'bg-red-500' },
  ];

  const barData = [
    { subject: 'Math', thisT: 85, lastT: 78 },
    { subject: 'DS', thisT: 92, lastT: 85 },
    { subject: 'Web', thisT: 70, lastT: 62 },
    { subject: 'DB', thisT: 55, lastT: 60 },
    { subject: 'Nets', thisT: 78, lastT: 70 },
  ];

  const announcements = [
    { title: 'Exam timetable released', date: 'May 8, 2026', tag: 'Exams', color: 'red' },
    { title: 'Course registration closes', date: 'May 12, 2026', tag: 'Registration', color: 'amber' },
    { title: 'Semester results uploaded', date: 'May 5, 2026', tag: 'Results', color: 'green' },
    { title: 'Convocation ceremony — June 20', date: 'May 3, 2026', tag: 'Event', color: 'green' },
  ];

  const events = [
    { day: '14', month: 'MAY', title: 'Math final exam', sub: 'Hall B · 9:00 AM' },
    { day: '16', month: 'MAY', title: 'Registration deadline', sub: 'Online portal closes' },
    { day: '20', month: 'MAY', title: 'Web Dev project due', sub: 'Submit via portal' },
    { day: '28', month: 'MAY', title: 'End of semester', sub: 'Semester 2 closes' },
  ];

  const tagColors = {
    red: 'bg-red-500/10 text-red-400',
    amber: 'bg-accent/10 text-accent',
    green: 'bg-primary/10 text-primary',
  };

  const dotColors = {
    red: 'bg-red-500',
    amber: 'bg-accent',
    green: 'bg-primary',
  };

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
          badge === 'NEW'
            ? 'bg-accent/20 text-accent'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-dark text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-dark-100 border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm">EduManage</div>
            <div className="text-white/40 text-xs">Student Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-white/25 text-xs font-medium uppercase tracking-widest px-3 pt-2 pb-1">Main Menu</p>

          {navItem('dashboard', <LayoutDashboard size={16} />, 'Dashboard')}
          {navItem('biodata', <User size={16} />, 'Bio Data')}
          {navItem('results', <FileText size={16} />, 'Statement of Results')}

          {/* Registration dropdown */}
          <button
            onClick={() => setRegOpen(!regOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <ClipboardList size={16} />
            <span>Registration</span>
            <ChevronDown size={14} className={`ml-auto transition-transform ${regOpen ? 'rotate-180' : ''}`} />
          </button>
          {regOpen && (
            <div className="ml-7 space-y-0.5">
              {['Course Registration', 'Add / Drop Courses', 'Registration History'].map(item => (
                <button key={item} className="block w-full text-left px-3 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  {item}
                </button>
              ))}
            </div>
          )}

          {navItem('graduation', <Award size={16} />, 'Graduation', 'NEW')}
          {navItem('announcements', <Megaphone size={16} />, 'Announcements', '3')}
          {navItem('accommodation', <Building size={16} />, 'Accommodation')}

          <p className="text-white/25 text-xs font-medium uppercase tracking-widest px-3 pt-4 pb-1">Finance</p>

          {/* Payments dropdown */}
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

        {/* Sign out */}
        <div className="p-3 border-t border-white/5">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-dark-100 border-b border-white/5 flex items-center gap-3 px-5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-heading font-semibold text-white text-sm whitespace-nowrap">Student Portal Dashboard</span>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search courses, results..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-primary transition-colors">
                <Bell size={16} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              KA
            </div>

            {/* Name */}
            <div className="hidden sm:block">
              <div className="text-white text-sm font-medium leading-tight">Kwame Ayisu</div>
              <div className="text-white/40 text-xs">STU/2022/0142</div>
            </div>

            {/* Settings */}
            <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5">

          {/* Welcome card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            <div>
              <h2 className="text-white text-xl font-heading font-bold mb-1">Welcome back, Kwame! 👋</h2>
              <p className="text-white/80 text-sm">You have 3 pending registrations and 2 upcoming exams this week.</p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="bg-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-medium">
                2025/2026 — Semester 2
              </div>
              <div className="text-white/70 text-xs">Computer Science · Level 300</div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { icon: <BookOpen size={20} className="text-primary" />, bg: 'bg-primary/15', label: 'Registered subjects', value: '8', trend: '2 added this semester', up: true },
              { icon: <BarChart3 size={20} className="text-blue-400" />, bg: 'bg-blue-500/15', label: 'Grade average', value: '78%', trend: '+4% from last term', up: true },
              { icon: <Receipt size={20} className="text-red-400" />, bg: 'bg-red-500/15', label: 'Outstanding fees', value: 'GHS 450', trend: 'Due in 14 days', up: false },
              { icon: <CalendarCheck size={20} className="text-accent" />, bg: 'bg-accent/15', label: 'Attendance', value: '91%', trend: 'Above 75% threshold', up: true },
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
                <div className={`text-xs flex items-center gap-1 ${s.up ? 'text-primary' : 'text-red-400'}`}>
                  {s.up ? '↑' : '⚠'} {s.trend}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Middle row */}
          <div className="grid lg:grid-cols-2 gap-4 mb-5">
            {/* Subject progress */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <ClipboardList size={16} className="text-primary" /> Subject registration status
              </h3>
              <div className="space-y-3">
                {subjects.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{s.name}</span>
                      <span className="font-mono">{s.score}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Term performance
              </h3>
              <div className="flex items-end gap-3 h-32">
                {barData.map(d => (
                  <div key={d.subject} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-white text-xs font-mono">{d.thisT}%</span>
                    <div className="flex items-end gap-0.5 w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.thisT}px` }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 bg-primary rounded-t"
                        style={{ maxHeight: '96px' }}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.lastT}px` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="flex-1 bg-primary/30 rounded-t"
                        style={{ maxHeight: '96px' }}
                      />
                    </div>
                    <span className="text-white/40 text-xs">{d.subject}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-3 h-3 rounded-sm bg-primary" /> This term
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-3 h-3 rounded-sm bg-primary/30" /> Last term
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Quick actions */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={16} className="text-primary" /> Quick actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <ClipboardList size={15} className="text-primary" />, label: 'Register' },
                  { icon: <Eye size={15} className="text-primary" />, label: 'Results' },
                  { icon: <CreditCard size={15} className="text-primary" />, label: 'Pay fees' },
                  { icon: <Download size={15} className="text-primary" />, label: 'Transcript' },
                ].map(a => (
                  <button key={a.label} className="flex items-center gap-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white transition-all">
                    {a.icon} {a.label}
                  </button>
                ))}
                <button className="col-span-2 flex items-center gap-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white transition-all">
                  <CalendarCheck size={15} className="text-primary" /> View timetable
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Megaphone size={16} className="text-accent" /> Announcements
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-44">
                {announcements.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[a.color]}`} />
                    <div>
                      <div className="text-white text-sm font-medium">{a.title}</div>
                      <div className="text-white/30 text-xs mb-1">{a.date}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[a.color]}`}>
                        {a.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="glass-card p-5">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={16} className="text-primary" /> Upcoming events
              </h3>
              <div className="space-y-3">
                {events.map((e, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-primary font-bold text-base leading-none">{e.day}</div>
                      <div className="text-primary text-xs">{e.month}</div>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{e.title}</div>
                      <div className="text-white/40 text-xs">{e.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-white/20 text-xs mt-6 pb-2">
            © 2026 EduManage Student Portal
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;