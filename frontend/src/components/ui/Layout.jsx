import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, BarChart3,
  CalendarCheck, Megaphone, LogOut, Menu, X, Bell, ChevronRight, School, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/grades', icon: BarChart3, label: 'Grades' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/reports/terminal', icon: FileText, label: 'Terminal Report' },
];

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed && !mobile ? 'justify-center' : ''}`}>
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
      <div className="p-3 border-t border-white/5">
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
    <div className="min-h-screen bg-dark flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-dark-100 border-r border-white/5 flex-shrink-0 relative"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-dark-100 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-all z-10"
        >
          <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-dark-100 border-r border-white/5 z-50 md:hidden">
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-dark-100 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <School size={16} className="text-primary" />
            <span className="font-heading font-bold text-white text-sm">EduManage</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-primary transition-colors">
              <Bell size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
