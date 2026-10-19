import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  BookOpen,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  onToggleSidebar?: () => void;
  title?: string;
  subtitle?: string;
  notebookTitle?: string;
  activeNotebookTitle?: string;
  activePage?: string;
  onNavigate?: (page: any) => void;
  onBackToDashboard?: () => void;
  profile?: StudentProfile | null;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onToggleSidebar,
  title,
  subtitle,
  notebookTitle,
  activeNotebookTitle,
  activePage,
  onNavigate,
  onBackToDashboard,
  profile,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobile = onToggleSidebar || onOpenMobileSidebar;
  const currentTitle = activeNotebookTitle || notebookTitle;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (onBackToDashboard) onBackToDashboard();
    else if (onNavigate) onNavigate('dashboard');
  };

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'S';

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-8 shrink-0 z-20">
      {/* Left Side: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {toggleMobile && (
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 -ml-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {currentTitle ? (
          <div className="flex items-center gap-3 min-w-0">
            {handleBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] px-2 py-1 -ml-1 rounded-md hover:bg-[#F1F5F9] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            <span className="text-[#CBD5E1] hidden sm:inline">/</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] truncate">
                {currentTitle} Workspace
              </h2>
              <span className="rounded-full bg-[#ECF2FF] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] shrink-0">
                Active Session
              </span>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight">
              {title || (activePage === 'analytics' ? 'Study Analytics' : activePage === 'settings' ? 'Settings' : 'Student Dashboard')}
            </h2>
            {subtitle && <p className="text-xs text-[#64748B] hidden sm:block">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right Side: Actions + Theme Toggle + Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Quick Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all cursor-pointer border border-[#E2E8F0] flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}

        {/* PROFILE ICON & DROPDOWN (ONLY shown AFTER login when profile exists; NOT before login) */}
        {profile && (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 group cursor-pointer"
              aria-expanded={isProfileOpen}
              aria-label="User profile menu"
            >
              <div
                className="h-8 w-8 rounded-full border-2 border-[#2563EB]/20 bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center shadow-xs group-hover:border-[#2563EB] transition-colors"
                title={profile.name}
              >
                {initials}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-[#0F172A] truncate max-w-[130px]">
                  {profile.name}
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5">MCA Student</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block group-hover:text-[#0F172A] transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="p-3 border-b border-[#F1F5F9]">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{profile.name}</p>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">{profile.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECF2FF] text-[#2563EB]">
                      {profile.degree || 'MCA Master'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">
                      {profile.semester || 'Semester II'}
                    </span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  {onToggleTheme && (
                    <button
                      onClick={() => {
                        onToggleTheme();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Appearance</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </button>
                  )}

                  {onNavigate && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#64748B]" />
                      <span>Account Settings</span>
                    </button>
                  )}
                </div>

                {onLogout && (
                  <div className="pt-1 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
