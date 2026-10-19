import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  Printer,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Flame,
  Award,
} from 'lucide-react';
import { SmartNote } from '../types';

interface SmartNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: SmartNote;
  onSaveNote: (note: SmartNote) => void;
  onRegenerate: () => void;
}

export const SmartNotesModal: React.FC<SmartNotesModalProps> = ({
  isOpen,
  onClose,
  note,
  onSaveNote,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const markdownContent = `# ${note.title}
Generated: ${note.generatedAt}

## Chapter Summary
${note.chapterSummary}

## Important Concepts
${note.importantConcepts.map((c) => `* **${c.title}**: ${c.description}`).join('\n')}

## Important Points
${note.importantPoints.map((p) => `- [${p.category}] ${p.point}`).join('\n')}

## Easy Explanation (Beginner Analogy)
${note.easyExplanation.map((e) => `* **${e.concept}**: ${e.analogy}`).join('\n')}

## Exam Focus
${note.examFocus.map((f) => `* [${f.importance}] ${f.topic} - ${f.tip}`).join('\n')}
`;

    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveNote(note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleRegenClick = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      onRegenerate();
      setIsRegenerating(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {note.title}
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded-full">
                  AI Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500">Synthesized from uploaded course PDFs</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Copy markdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleRegenClick}
              disabled={isRegenerating}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Regenerate smart notes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Save to notebook"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved' : 'Save Notes'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 text-sm leading-relaxed">
          {/* Section 1: Chapter Summary */}
          <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Chapter Summary
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">{note.chapterSummary}</p>
          </section>

          {/* Section 2: Important Concepts */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Important Concepts
            </h4>
            <div className="space-y-2.5">
              {note.importantConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-white transition-colors"
                >
                  <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{concept.title}</span>
                  </div>
                  <p className="text-slate-600 text-xs pl-3.5">{concept.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Important Points (Highlighted Cards) */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Important Points & Axioms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {note.importantPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/90 text-xs flex flex-col justify-between"
                >
                  <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] mb-1.5">
                    {pt.category}
                  </span>
                  <p className="text-slate-800 leading-normal">{pt.point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Easy Explanation (Beginner Analogy) */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              Easy Explanation for Beginners
            </h4>
            <div className="space-y-3">
              {note.easyExplanation.map((expl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs"
                >
                  <p className="font-bold text-emerald-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <span>💡 Mental Model: {expl.concept}</span>
                  </p>
                  <p className="text-slate-700 leading-relaxed italic">{expl.analogy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Exam Focus */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Exam Focus & High-Probability Questions
            </h4>
            <div className="space-y-2.5">
              {note.examFocus.map((focus, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">{focus.topic}</div>
                    <div className="text-slate-600 text-[11px]">{focus.tip}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shrink-0 ${
                      focus.importance === 'Critical'
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : focus.importance === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {focus.importance} Priority
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex items-center justify-between text-xs text-slate-500">
          <span>Generated: {note.generatedAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
