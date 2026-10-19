import React, { useState } from 'react';
import {
  History,
  FileText,
  Award,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  Search,
} from 'lucide-react';
import { RecentActivityItem, Notebook } from '../types';

interface RecentActivityViewProps {
  activity: RecentActivityItem[];
  notebooks: Notebook[];
  onOpenNotebook: (id: string) => void;
  onClearRecent?: () => void;
  onStartExam?: (notebookId: string) => void;
}

export const RecentActivityView: React.FC<RecentActivityViewProps> = ({
  activity,
  notebooks,
  onOpenNotebook,
  onClearRecent,
  onStartExam,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'document' | 'exam' | 'note' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find notebook by title or id
  const findTargetNotebook = (item: RecentActivityItem): Notebook | undefined => {
    return (
      notebooks.find((n) => n.title.toLowerCase() === (item.notebookTitle || '').toLowerCase()) ||
      notebooks.find((n) => (item.title || '').toLowerCase().includes(n.title.toLowerCase())) ||
      notebooks[0]
    );
  };

  const filteredItems = activity.filter((item) => {
    if (filterType !== 'all') {
      if (item.type !== filterType) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.notebookTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getItemIcon = (item: RecentActivityItem) => {
    if (item.type === 'exam') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
      );
    }
    if (item.type === 'note') {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }
    if (item.type === 'chat') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recent Study Activity
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A chronological timeline of your indexed lecture notes, practice exams, generated smart summaries, and queries.
          </p>
        </div>

        {onClearRecent && activity.length > 0 && (
          <button
            onClick={onClearRecent}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'document', label: 'Documents & Notes' },
            { id: 'exam', label: 'Practice Exams' },
            { id: 'note', label: 'Smart Notes' },
            { id: 'chat', label: 'Tutor Q&A' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recent activity..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] flex items-center justify-center mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {searchQuery ? 'No matching activities found' : 'No recent activity yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search terms or filter selection.'
                : 'Your study actions—uploading handwritten notes or PDFs, taking practice exams, and generating study notes—will appear here in real-time.'}
            </p>
            {notebooks.length > 0 && (
              <button
                onClick={() => onOpenNotebook(notebooks[0].id)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Open {notebooks[0].title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const targetNotebook = findTargetNotebook(item);

            return (
              <div
                key={item.id}
                onClick={() => targetNotebook && onOpenNotebook(targetNotebook.id)}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-600 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {getItemIcon(item)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors truncate">
                        {item.title}
                      </span>
                      {item.score && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                          {item.score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.subtitle}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>Course: {item.notebookTitle}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (targetNotebook) onOpenNotebook(targetNotebook.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#2563EB] hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
