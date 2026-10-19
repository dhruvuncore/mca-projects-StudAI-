import React, { useState } from 'react';
import { X, BookOpen, Sparkles, FolderPlus } from 'lucide-react';
import { Notebook } from '../types';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (notebook: { title: string; code?: string; description?: string }) => void;
  onCreateNotebook?: (title: string, description: string, code?: string) => void;
}

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onCreateNotebook,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a notebook title.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedCode = code.trim() || undefined;
    const trimmedDesc = description.trim() || undefined;

    if (typeof onCreate === 'function') {
      onCreate({
        title: trimmedTitle,
        code: trimmedCode,
        description: trimmedDesc,
      });
    } else if (typeof onCreateNotebook === 'function') {
      onCreateNotebook(trimmedTitle, trimmedDesc || '', trimmedCode);
    }

    setTitle('');
    setCode('');
    setDescription('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create a new study notebook</h3>
              <p className="text-xs text-slate-500">
                Organize your study PDFs, tutor chats, and practice exams.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notebook Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., "Database Management System"'
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Subject Code <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='e.g., "MCA-201"'
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key units covered, syllabus objectives, or exam dates..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Create Notebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
