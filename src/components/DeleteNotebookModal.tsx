import React from 'react';
import { AlertTriangle, Trash2, X, BookOpen, FileText } from 'lucide-react';
import { Notebook } from '../types';

interface DeleteNotebookModalProps {
  isOpen: boolean;
  notebook: Notebook | null;
  onClose: () => void;
  onConfirmDelete: (notebookId: string) => void;
  isDeleting?: boolean;
}

export const DeleteNotebookModal: React.FC<DeleteNotebookModalProps> = ({
  isOpen,
  notebook,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!isOpen || !notebook) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Delete Course Notebook?
            </h3>
            <p className="text-xs text-slate-500">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Notebook Preview Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate">
                {notebook.title}
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
              {notebook.code || 'MCA'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{notebook.documentsCount || notebook.documents?.length || 0} documents</span>
            </span>
            <span>•</span>
            <span>Progress: {notebook.progress}%</span>
          </div>
        </div>

        {/* Warning Details */}
        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          Deleting <strong>"{notebook.title}"</strong> will permanently remove all indexed course materials, AI study chat discussions, and practice quiz history linked to this notebook.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(notebook.id)}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Notebook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
