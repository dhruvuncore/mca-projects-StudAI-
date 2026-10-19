import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ArrowRight,
  Award,
  FileText,
  Clock,
  Trash2,
  Database,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  BookMarked,
  X,
} from 'lucide-react';
import { Notebook } from '../types';

interface NotebooksViewProps {
  notebooks: Notebook[];
  onOpenNotebook: (id: string) => void;
  onCreateNotebook: () => void;
  onStartExam: (notebookId: string) => void;
  onDeleteNotebook?: (id: string) => void;
}

export const NotebooksView: React.FC<NotebooksViewProps> = ({
  notebooks,
  onOpenNotebook,
  onCreateNotebook,
  onStartExam,
  onDeleteNotebook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to map icon names or titles to Lucide icons
  const getSubjectIcon = (title: string, iconName?: string) => {
    const t = (title || '').toLowerCase();
    const i = (iconName || '').toLowerCase();

    if (i.includes('database') || t.includes('dbms') || t.includes('database') || t.includes('sql')) {
      return <Database className="w-5 h-5 text-[#2563EB]" />;
    }
    if (i.includes('cpu') || t.includes('os') || t.includes('operating') || t.includes('architecture')) {
      return <Cpu className="w-5 h-5 text-[#0D9488]" />;
    }
    if (i.includes('terminal') || t.includes('data structure') || t.includes('algorithm') || t.includes('code')) {
      return <Terminal className="w-5 h-5 text-[#7C3AED]" />;
    }
    if (t.includes('network') || t.includes('web') || t.includes('cloud')) {
      return <Layers className="w-5 h-5 text-[#EA580C]" />;
    }
    return <BookMarked className="w-5 h-5 text-[#2563EB]" />;
  };

  const filteredNotebooks = notebooks.filter((nb) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      nb.title.toLowerCase().includes(q) ||
      (nb.description && nb.description.toLowerCase().includes(q)) ||
      (nb.code && nb.code.toLowerCase().includes(q))
    );
  });

  const totalDocuments = notebooks.reduce((acc, curr) => acc + (curr.documentsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECF2FF] text-[#2563EB] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              My Study Notebooks
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECF2FF] text-[#2563EB] border border-[#2563EB]/20">
              {notebooks.length} Course{notebooks.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Browse and open your academic course notebooks, access study resources, or create a new collection.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateNotebook}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Notebook</span>
          </button>
        </div>
      </div>

      {/* Search and Quick Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebooks by course title, code (e.g. MCA-201), or topic..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] px-2 shrink-0">
          <span className="font-semibold text-[#0F172A]">{notebooks.length}</span> notebooks
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">{totalDocuments}</span> indexed documents
        </div>
      </div>

      {/* Notebooks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {notebooks.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ECF2FF] text-[#2563EB] flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
              No study notebooks yet
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-1.5 leading-relaxed">
              Create your first course notebook to upload lecture notes, Word documents, syllabus PDFs, and handwritten notes.
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
        ) : filteredNotebooks.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              No notebooks found matching "{searchQuery}"
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Try a different search term or clear the filter.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#ECF2FF] rounded-lg transition-colors cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          filteredNotebooks.map((nb) => (
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
                  {nb.description || 'Academic course materials, lecture notes, and study collections.'}
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
                    <span>{nb.lastStudied || 'Recently active'}</span>
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
                    title="Quick Practice Test"
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
                      className="p-2 rounded-lg border border-[#E2E8F0] hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
  );
};
