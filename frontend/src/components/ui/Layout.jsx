import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, BarChart3,
  CalendarCheck, Megaphone, LogOut, Menu, Bell, ChevronRight,
  School, FileText, Shield, X, Clock
} from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/students', icon: Users, label: 'Students', adminOnly: true },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers', adminOnly: true },
  { to: '/classes', icon: BookOpen, label: 'Classes', adminOnly: true },
  { to: '/grades', icon: BarChart3, label: 'Grades' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/announcements', icon: Megaphone, label: 'Announcements', adminOnly: true },
  { to: '/reports/terminal', icon: FileText, label: 'Terminal Report' },
  { to: '/teacher-accounts', icon: Shield, label: 'Teacher Accounts', adminOnly: true },
  { to: '/student-portal', icon: GraduationCap, label: 'Student Portal' },
  { to: '/student-accounts', icon: Users, label: 'Student Accounts', adminOnly: true },
];

const SIDEBAR_W     = 220;
const SIDEBAR_W_COL = 64;

// ── Notification Bell ──────────────────────────────────────────────────────
const NotificationBell = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('read_announcements') || '[]'); }
    catch { return []; }
  });
  const ref = useRef(null);

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data.announcements || []))
      .catch(() => {});
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = announcements.filter(a => !readIds.includes(a._id)).length;

  const markAllRead = () => {
    const allIds = announcements.map(a => a._id);
    setReadIds(allIds);
    localStorage.setItem('read_announcements', JSON.stringify(allIds));
  };

  const markOneRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('read_announcements', JSON.stringify(updated));
  };

  const priorityColor = p =>
    p === 'high'   ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
    p === 'medium' ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20' :
    'text-white/40 bg-white/5 border border-white/10';

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-primary transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-dark-100 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-primary" />
                <span className="font-heading font-semibold text-white text-sm">Announcements</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-primary text-xs hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-white/20 text-sm">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  No announcements yet
                </div>
              ) : announcements.map(a => {
                const isRead = readIds.includes(a._id);
                return (
                  <div
                    key={a._id}
                    onClick={() => markOneRead(a._id)}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!isRead ? 'bg-red-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm font-medium truncate ${!isRead ? 'text-white' : 'text-white/60'}`}>
                            {a.title}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColor(a.priority)}`}>
                            {a.priority}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs line-clamp-2 mb-1">{a.content}</p>
                        <div className="flex items-center gap-1 text-white/25 text-xs">
                          <Clock size={10} />
                          <span>
                            {new Date(a.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {announcements.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/5 text-center">
                <span className="text-white/30 text-xs">{announcements.length} total announcements</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Layout ──────────────────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.role === 'admin');
  const sidebarW = collapsed ? SIDEBAR_W_COL : SIDEBAR_W;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 flex-shrink-0 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <School size={18} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <div className="font-heading font-bold text-white text-sm">EduManage</div>
            <div className="text-white/40 text-xs">School System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed && !mobile ? 'justify-center px-2' : ''}`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5 flex-shrink-0">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-white/40 text-xs capitalize">{user?.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark">

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-dark-100 border-r border-white/5 fixed top-0 left-0 h-screen z-30 overflow-visible"
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ right: '-12px' }}
          className="absolute top-16 w-6 h-6 bg-dark-100 border border-white/20 rounded-full
                     flex items-center justify-center text-white/50 hover:text-primary
                     hover:border-primary/50 transition-all z-50 shadow-md"
        >
          <ChevronRight
            size={12}
            className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-dark-100 border-r border-white/5 z-50 md:hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Main */}
      <motion.div
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col min-h-screen"
      >
        <header className="h-14 bg-dark-100 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </motion.div>

      {/* Mobile Main */}
      <div className="flex flex-col min-h-screen md:hidden">
        <header className="h-14 bg-dark-100 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <School size={16} className="text-primary" />
            <span className="font-heading font-bold text-white text-sm">EduManage</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;