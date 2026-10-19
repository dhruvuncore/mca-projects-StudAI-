import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamResult } from '../types';

interface ExamResultModalProps {
  isOpen: boolean;
  result: ExamResult | null;
  onClose: () => void;
  onReviewWeakTopics: () => void;
  onRetakeExam: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onReviewWeakTopics,
  onRetakeExam,
}) => {
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (isOpen && result && result.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // graceful ignore
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Exam Complete 🎉</h3>
              <p className="text-xs text-slate-500">{result.notebookTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Score Hero */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Final Examination Score
            </span>
            <div className="flex items-baseline justify-center gap-2 mt-2 mb-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
                {result.correctCount}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400">
                / {result.totalQuestions}
              </span>
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-sm font-extrabold bg-blue-600 text-white shadow-xs">
              {result.percentage}% Accuracy
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time taken: {formatTime(result.timeTakenSeconds)}</span>
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct</span>
              </div>
              <span className="text-2xl font-bold text-emerald-950">{result.correctCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-1">
                <XCircle className="w-4 h-4" />
                <span>Incorrect</span>
              </div>
              <span className="text-2xl font-bold text-rose-950">{result.incorrectCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold mb-1">
                <span>Skipped</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">{result.skippedCount}</span>
            </div>
          </div>

          {/* Prominent Weak Topic Diagnostic Alert */}
          {result.weakTopics.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                    Diagnostic Alert: Weak Topic Identified
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-rose-200 text-rose-900 rounded-full uppercase tracking-wider">
                    Needs Revision
                  </span>
                </div>
                <p className="text-base font-extrabold text-rose-950 mt-1">
                  WEAK TOPIC: {result.weakTopics.join(', ')}
                </p>
                <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                  Your accuracy was lowest in <strong>{result.weakTopics.join(', ')}</strong> (e.g. 2NF Partial Dependencies). We recommend reviewing Section 3.2 in <strong>DBMS.pdf</strong> before retaking the test.
                </p>
              </div>
            </div>
          )}

          {/* Topic Performance Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Topic Performance Breakdown
            </h4>
            <div className="space-y-2.5">
              {result.topicPerformance.map((tp, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-800">{tp.topic}</span>
                    <span
                      className={
                        tp.percentage >= 80
                          ? 'text-emerald-700 font-bold'
                          : tp.percentage < 60
                          ? 'text-rose-700 font-bold'
                          : 'text-amber-700 font-bold'
                      }
                    >
                      {tp.score} / {tp.total} ({tp.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        tp.percentage >= 80
                          ? 'bg-emerald-500'
                          : tp.percentage < 60
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strong vs Weak Topics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Strong Topics */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Strong Topics
              </h5>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.strongTopics.length > 0 ? (
                  result.strongTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{topic}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Attempt more exams to establish strong areas.</li>
                )}
              </ul>
            </div>

            {/* Needs Improvement */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Needs Improvement
              </h5>
              <ul className="space-y-1 text-xs text-slate-700">
                {result.weakTopics.length > 0 ? (
                  result.weakTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">⚠</span>
                      <span>{topic}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-700 font-medium">Zero weak topics identified!</li>
                )}
              </ul>
            </div>
          </div>

          {/* AI Study Recommendation Box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                AI Study Recommendation
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{result.recommendation}</p>
            </div>
          </div>

          {/* Review Answers Toggle */}
          <div>
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>{showReview ? 'Hide Step-by-Step Answer Review' : 'Review All 10 Questions & Answers'}</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Review Cards */}
            {showReview && (
              <div className="mt-4 space-y-3">
                {result.reviewQuestions.map((item, idx) => {
                  const isCorrect = item.isCorrect;
                  const correctIdx = Number(item.question.correctAnswer);
                  const selectedIdx = item.selectedOption;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs ${
                        isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-800">Question {idx + 1}</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect ? '✓ Correct' : selectedIdx === undefined ? 'Skipped' : '✕ Incorrect'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 mb-2">{item.question.question}</p>

                      <div className="space-y-1 mb-2">
                        {item.question.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              oIdx === correctIdx
                                ? 'bg-emerald-100 text-emerald-950 font-bold'
                                : oIdx === selectedIdx
                                ? 'bg-rose-100 text-rose-950 line-through'
                                : 'bg-white text-slate-600'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                            {oIdx === correctIdx && (
                              <span className="text-[10px] uppercase font-bold text-emerald-700">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        <strong>Explanation:</strong> {item.question.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex flex-wrap items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onReviewWeakTopics();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Weak Topics</span>
          </button>

          <button
            onClick={() => {
              onRetakeExam();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Back to Notebook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
