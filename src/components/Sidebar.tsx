import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  BookMarked,
  Cpu,
  Plus,
  Trash2,
  Sun,
  Moon,
} from 'lucide-react';
import { StudentProfile, Notebook } from '../types';

export type NavItem = 'dashboard' | 'notebooks' | 'recent' | 'analytics' | 'settings' | 'workspace';

interface SidebarProps {
  activeTab?: NavItem | string;
  activePage?: string;
  onSelectTab?: (tab: any) => void;
  onNavigate?: (page: any) => void;
  profile?: StudentProfile | null;
  onLogout?: () => void;
  onOpenNewNotebook?: () => void;
  onCreateNotebook?: () => void;
  isOpenMobile?: boolean;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  notebooks?: Notebook[];
  activeNotebookId?: string;
  onSelectNotebook?: (id: string) => void;
  onDeleteNotebook?: (id: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activePage,
  onSelectTab,
  onNavigate,
  profile,
  onLogout,
  onOpenNewNotebook,
  onCreateNotebook,
  isOpenMobile,
  isOpen,
  onCloseMobile,
  onClose,
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onDeleteNotebook,
  theme = 'light',
  onToggleTheme,
}) => {
  const currentTab = (activePage || activeTab || 'dashboard') as NavItem;
  const handleNav = onNavigate || onSelectTab || (() => {});
  const handleCreate = onCreateNotebook || onOpenNewNotebook || (() => {});
  const handleClose = onClose || onCloseMobile || (() => {});
  const isMobileOpen = isOpen ?? isOpenMobile ?? false;

  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notebooks' as NavItem, label: 'My Notebooks', icon: BookOpen },
    { id: 'recent' as NavItem, label: 'Recent', icon: History },
    { id: 'analytics' as NavItem, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavItem) => {
    handleNav(tab);
    handleClose();
  };

  const studentName = profile?.name || 'John Student';
  const studentEmail = profile?.email || 'mca.project@edu.com';
  const initials =
    profile?.avatar ||
    studentName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'JS';

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] select-none text-[#0F172A]">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#E2E8F0] shrink-0">
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="h-8 w-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 7v14M9 21h6M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1E3A8A]">StudyAI</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F1F5F9] text-[#2563EB] font-semibold'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? 'text-[#2563EB]' : 'text-[#64748B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Course Notebooks List if available */}
        {notebooks && notebooks.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                Active Courses
              </span>
              <button
                onClick={() => {
                  handleCreate();
                  handleClose();
                }}
                className="text-[#2563EB] hover:text-[#1E3A8A] transition-colors p-0.5"
                title="Create Notebook"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {notebooks.slice(0, 6).map((nb) => {
                const isSelected = currentTab === 'workspace' && activeNotebookId === nb.id;
                return (
                  <div
                    key={nb.id}
                    className={`group/course w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-all ${
                      isSelected
                        ? 'bg-[#ECF2FF] text-[#2563EB] font-semibold'
                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectNotebook) onSelectNotebook(nb.id);
                        else handleNav('workspace');
                        handleClose();
                      }}
                      className="flex-1 flex items-center justify-between min-w-0 pr-1 text-left"
                    >
                      <span className="truncate">{nb.title}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-[#F1F5F9] text-[#64748B] shrink-0 ml-1">
                        {nb.code || 'MCA'}
                      </span>
                    </button>
                    {onDeleteNotebook && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotebook(nb.id);
                        }}
                        title={`Delete ${nb.title}`}
                        className="opacity-0 group-hover/course:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </nav>

      {/* User Profile Footer (Only rendered when profile is authenticated) */}
      {profile && (
        <div className="border-t border-[#E2E8F0] p-4 bg-white shrink-0">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="h-9 w-9 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{studentName}</p>
                <p className="truncate text-xs text-[#64748B]">{studentEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (w-[220px]) */}
      <aside className="hidden lg:flex w-[220px] flex-col shrink-0 h-full">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
          />
          <div className="fixed inset-y-0 left-0 w-[240px] max-w-[85vw] bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

