import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { PracticeQuestion, ExamResult } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
  questions: PracticeQuestion[];
  onSubmitExam: (answers: Record<number, number>, timeTakenSeconds: number) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  notebookId,
  notebookTitle,
  questions,
  onSubmitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const totalDuration = 15 * 60; // 15:00
  const [secondsRemaining, setSecondsRemaining] = useState(totalDuration);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleAutoSubmit = () => {
    const timeTaken = totalDuration - secondsRemaining;
    onSubmitExam(answers, Math.max(1, timeTaken));
  };

  const handleFinalSubmit = () => {
    setShowConfirmModal(false);
    const timeTaken = totalDuration - secondsRemaining;
    onSubmitExam(answers, Math.max(1, timeTaken));
  };

  const handleAutoFill8Out10 = () => {
    // Fill answers such that exactly 8 are correct and 2 are incorrect on Normalization
    const demoAnswers: Record<number, number> = {};
    questions.forEach((q, idx) => {
      const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10) || 0;
      // Intentionally pick incorrect options on questions 1 and 2 (Normalization)
      if (idx === 1 || idx === 2) {
        demoAnswers[idx] = (correctIdx + 1) % q.options.length;
      } else {
        demoAnswers[idx] = correctIdx;
      }
    });
    setAnswers(demoAnswers);
  };

  const isLowTime = secondsRemaining <= 120; // 2 minutes

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {notebookTitle} Practice Test
              </h3>
              <p className="text-xs text-slate-500">
                Question <span className="font-semibold text-slate-800">{currentIndex + 1}</span> of{' '}
                <span className="font-semibold text-slate-800">{questions.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo 8/10 Autofill Button */}
            <button
              type="button"
              onClick={handleAutoFill8Out10}
              title="Auto-fill 8 correct answers & 2 Normalization errors for instant diagnostic demonstration"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#1E3A8A] bg-[#ECF2FF] hover:bg-[#DBEAFE] border border-[#2563EB]/30 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden md:inline">Demo:</span> 8/10 Auto-Fill
            </button>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-bold ${
                isLowTime
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              Submit Exam
            </button>

            <button
              onClick={onClose}
              title="Close Test"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col justify-between">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Question Top Tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">
                  Topic: {currentQ.topic}
                </span>
                <span className="text-xs text-slate-400 font-medium">Single Choice MCQ</span>
              </div>

              <button
                onClick={toggleFlag}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  flagged[currentIndex]
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentIndex] ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Question Prompt */}
            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h4>

            {/* MCQ Options */}
            <div className="space-y-3">
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = answers[currentIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm flex items-center gap-3.5 transition-all ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-normal">{opt}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Question Grid */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 rounded-b-2xl space-y-3">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-xs text-slate-500 hidden sm:block font-medium">
              Answered: <span className="font-bold text-blue-700">{answeredCount}</span> / {questions.length}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question Grid: 1 2 3 4 5 6 7 8 9 10 */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Question Navigator
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm border border-slate-300 bg-white" /> Unanswered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Flagged
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[idx] !== undefined;
                const isFlagged = flagged[idx];

                let btnStyles = 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';

                if (isAnswered) {
                  btnStyles = 'bg-blue-600 text-white border-blue-600 font-bold';
                }

                if (isCurrent) {
                  btnStyles += ' ring-2 ring-offset-1 ring-blue-500';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border flex items-center justify-center relative transition-all ${btnStyles}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Submit Practice Exam?</h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> out of{' '}
              <strong>{questions.length}</strong> questions.
              {unansweredCount > 0 && (
                <span className="text-amber-700 block mt-1 font-semibold">
                  ⚠️ You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}!
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
