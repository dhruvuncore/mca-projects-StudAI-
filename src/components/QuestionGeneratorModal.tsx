import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { PracticeQuestion, QuestionDifficulty, QuestionType } from '../types';
import { sampleQuestions } from '../mockData';

interface QuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookTitle: string;
  onStartExamWithQuestions?: (questions: PracticeQuestion[]) => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  notebookTitle,
  onStartExamWithQuestions,
}) => {
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [count, setCount] = useState<number>(5);
  const [topic, setTopic] = useState<string>('All Topics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<PracticeQuestion[]>([]);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const topicsList = ['All Topics', 'Normalization', 'Transactions', 'SQL', 'Indexing', 'Relational Algebra'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setRevealedMap({});
    setSelectedOptions({});

    setTimeout(() => {
      let pool = [...sampleQuestions];
      if (topic !== 'All Topics') {
        pool = pool.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
      }
      if (pool.length === 0) {
        pool = sampleQuestions;
      }

      // Shuffle and pick desired count
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      // If user selected non-mcq, adapt question display
      const adapted = selected.map((q, idx) => ({
        ...q,
        type: questionType,
        difficulty: difficulty,
      }));

      setGeneratedQuestions(adapted);
      setIsGenerating(false);
    }, 600);
  };

  const toggleReveal = (qId: string) => {
    setRevealedMap((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Generate Practice Questions
              </h3>
              <p className="text-xs text-slate-500">
                Based on: <span className="font-semibold text-blue-600">{notebookTitle}</span>
              </p>
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
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Question Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="mcq">MCQ (Multiple Choice)</option>
                <option value="short">Short Answer (3-5 Marks)</option>
                <option value="long">Long Answer (8-10 Marks)</option>
                <option value="viva">Viva Voce Questions</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Standard Exam)</option>
                <option value="hard">Hard (Complex Proofs)</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      count === num
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate CTA Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Grounded in uploaded syllabus chunks</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Questions...' : 'Generate Questions'}</span>
            </button>
          </div>

          {/* Empty State Before Generation */}
          {generatedQuestions.length === 0 && !isGenerating && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Ready to generate practice questions
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Choose your question type, difficulty, and target topic above, then click{' '}
                <strong>"Generate Questions"</strong>.
              </p>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                Quick Generate 5 MCQs
              </button>
            </div>
          )}

          {/* Generated Question Cards */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Showing {generatedQuestions.length} Generated Questions ({questionType.toUpperCase()})
                </span>
                {questionType === 'mcq' && onStartExamWithQuestions && (
                  <button
                    onClick={() => {
                      onStartExamWithQuestions(generatedQuestions);
                      onClose();
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Take this set as a Timed Practice Exam →
                  </button>
                )}
              </div>

              {generatedQuestions.map((q, idx) => {
                const isRevealed = !!revealedMap[q.id];
                const selectedOpt = selectedOptions[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs"
                  >
                    {/* Card Top Label */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{q.topic}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {difficulty}
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-semibold text-slate-900 mb-3 leading-snug">
                      {q.question}
                    </p>

                    {/* MCQ Options */}
                    {questionType === 'mcq' && q.options && (
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIdx) => {
                          const optionLetter = String.fromCharCode(65 + optIdx);
                          const isSelected = selectedOpt === optIdx;
                          const isCorrectOption = optIdx === q.correctAnswer;

                          let optionStyles =
                            'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700';

                          if (isSelected) {
                            optionStyles = 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium';
                          }

                          if (isRevealed) {
                            if (isCorrectOption) {
                              optionStyles =
                                'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                            } else if (isSelected && !isCorrectOption) {
                              optionStyles =
                                'border-rose-300 bg-rose-50 text-rose-900 line-through';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center gap-3 transition-all ${optionStyles}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-600'
                                }`}
                              >
                                {optionLetter}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isRevealed && isCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Non-MCQ Hint/Prompt */}
                    {questionType !== 'mcq' && (
                      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-3 border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">
                          Expected Model Answer Rubric:
                        </span>
                        <span>
                          Provide formal definition, key invariants, mathematical notation, and draw
                          architectural diagrams for complete university marks.
                        </span>
                      </div>
                    )}

                    {/* Reveal Answer Toggle */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleReveal(q.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide Explanation</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Answer & Explanation</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {questionType === 'mcq' && !isRevealed && selectedOpt !== undefined
                          ? 'Choice selected • Click to verify'
                          : ''}
                      </span>
                    </div>

                    {/* Answer & Explanation Box */}
                    {isRevealed && (
                      <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs animate-in fade-in duration-150">
                        {questionType === 'mcq' && q.correctAnswer !== undefined && (
                          <p className="font-bold text-blue-900 mb-1">
                            Correct Answer: Option {String.fromCharCode(65 + Number(q.correctAnswer))}
                          </p>
                        )}
                        <p className="text-slate-700 leading-relaxed">
                          <strong>Academic Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
