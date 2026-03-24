import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Files', path: '/files' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300",
          !isOpen && "items-center"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl text-slate-900 truncate"
              >
                FireDash
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isOpen && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all",
            isOpen && "bg-slate-50"
          )}>
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-6 h-6" />
              </div>
            )}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 mt-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all",
              !isOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      <main className={cn(
        "transition-all duration-300 min-h-screen bg-slate-50",
        isOpen ? "lg:pl-[280px]" : "lg:pl-[80px]"
      )}>
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Sidebar;
