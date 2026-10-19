import React from 'react';
import {
  BookOpen,
  Plus,
  FileText,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Database,
  Network,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Notebook, StudentProfile } from '../types';
import { apiService } from '../services/apiService';

interface DashboardViewProps {
  profile: StudentProfile;
  notebooks: Notebook[];
  onOpenNotebook: (id: string) => void;
  onCreateNotebook: () => void;
  onOpenAnalytics: () => void;
  onStartExam: (notebookId: string) => void;
  onDeleteNotebook?: (id: string) => void;
  onClearAllData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  notebooks,
  onOpenNotebook,
  onCreateNotebook,
  onOpenAnalytics,
  onStartExam,
  onDeleteNotebook,
  onClearAllData,
}) => {
  // Compute top stats dynamically for this student
  const examStats = apiService.getUserExamStats();
  const totalNotebooks = notebooks.length;
  const totalDocuments = notebooks.reduce((acc, nb) => acc + nb.documentsCount, 0);
  const examsCompleted = examStats.examsCompleted;
  const averageScore = examStats.averageScore;

  // Subject icon helper
  const getSubjectIcon = (title: string, iconName?: string) => {
    const t = title.toLowerCase();
    if (t.includes('database') || t.includes('dbms')) {
      return <Database className="w-5 h-5 text-blue-600" />;
    }
    if (t.includes('network') || t.includes('cn')) {
      return <Network className="w-5 h-5 text-sky-600" />;
    }
    if (t.includes('operating') || t.includes('os')) {
      return <Cpu className="w-5 h-5 text-teal-600" />;
    }
    return <BookOpen className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans text-[#0F172A]">
      {/* Top Welcome Banner & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] tracking-tight">
              Good morning, {profile.name.split(' ')[0] || 'Student'} 👋
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#ECF2FF] text-[#2563EB] rounded-full">
              {profile.degree || 'Academic Workspace'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Upload your course documents and lecture notes to begin RAG indexing and study assistance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onCreateNotebook}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Notebook</span>
          </button>
        </div>
      </div>

      {/* Top Statistics Cards (Editorial Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Notebooks */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
              Notebooks
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECF2FF] text-[#2563EB] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{totalNotebooks}</div>
          <p className="text-[11px] text-[#64748B] mt-1">{totalNotebooks} active course notebook{totalNotebooks === 1 ? '' : 's'}</p>
        </div>

        {/* Stat 2: Documents */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
              Uploaded Files
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] text-[#2563EB] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{totalDocuments}</div>
          <p className="text-[11px] text-[#64748B] mt-1">{totalDocuments} indexed source document{totalDocuments === 1 ? '' : 's'}</p>
        </div>

        {/* Stat 3: Exams Completed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
              Exams Taken
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{examsCompleted}</div>
          <p className="text-[11px] text-[#64748B] mt-1">{examsCompleted} completed test session{examsCompleted === 1 ? '' : 's'}</p>
        </div>

        {/* Stat 4: Average Score */}
        <div
          onClick={onOpenAnalytics}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs cursor-pointer hover:border-[#2563EB] transition-colors group"
        >
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{averageScore}</div>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">
            Test accuracy & diagnostics
          </p>
        </div>
      </div>

      {/* Main Section: My Study Notebooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              My Study Notebooks
            </h2>
            <p className="text-xs text-[#64748B]">Select a course notebook to launch the workspace</p>
          </div>
          <button
            onClick={onCreateNotebook}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notebook</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notebooks.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-10 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ECF2FF] text-[#2563EB] flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Welcome to Your Personal Dashboard, {profile.name}!
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-1.5 leading-relaxed">
                Your academic workspace is clean and ready. Add your first semester course to upload lecture notes, syllabus PDFs, and practice questions.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={onCreateNotebook}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create My First Course Notebook</span>
                </button>
              </div>
            </div>
          ) : (
            notebooks.map((nb) => (
              <div
                key={nb.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenNotebook(nb.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenNotebook(nb.id);
                  }
                }}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 group-hover:bg-[#ECF2FF] group-hover:border-[#2563EB]/20 transition-colors">
                      {getSubjectIcon(nb.title, nb.iconName)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] font-mono">
                        {nb.code || 'MCA Course'}
                      </span>
                      {onDeleteNotebook && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotebook(nb.id);
                          }}
                          title={`Delete ${nb.title}`}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-[#0F172A] text-base mb-1 group-hover:text-[#2563EB] transition-colors">
                    {nb.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                    {nb.description}
                  </p>
                </div>

                {/* Meta Info & Actions */}
                <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{nb.documentsCount} documents</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{nb.lastStudied}</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNotebook(nb.id);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1E3A8A] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Let's Learn</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartExam(nb.id);
                      }}
                      title="Quick Test"
                      className="p-2 rounded-lg border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                    {onDeleteNotebook && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotebook(nb.id);
                        }}
                        title="Delete Notebook"
                        className="p-2 rounded-lg border border-[#E2E8F0] hover:border-rose-300 hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
