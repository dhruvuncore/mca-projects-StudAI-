import React from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { AnalyticsData } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  onGoToNotebook: (subjectName?: string) => void;
  onTakePracticeExam: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  onGoToNotebook,
  onTakePracticeExam,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Learning Analytics & Exam Insights
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Exam Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time mastery tracking across your MCA syllabus units and practice tests.
          </p>
        </div>

        <button
          onClick={onTakePracticeExam}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>Launch Practice Exam</span>
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exams Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Exams Completed
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {analytics.examsCompleted}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">10-question timed mocks</p>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Score
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {analytics.averageScore}%
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">+6.2% improvement</p>
        </div>

        {/* Questions Answered */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Questions Answered
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {analytics.questionsAnswered}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across DBMS, CN, OS</p>
        </div>

        {/* Study Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Study Progress
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {analytics.studyProgress}%
          </div>
          <p className="text-[11px] text-blue-600 mt-1 font-medium">Semester syllabus covered</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Score Progression Over Time (Col 7 on lg) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Score Progression Over Time
              </h3>
              <p className="text-xs text-slate-500">Historical performance across practice exams</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Target: 85%+
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.scoreHistory}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis
                  domain={[40, 100]}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Topic Accuracy Breakdown (Col 5 on lg) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Topic Accuracy</h3>
              <p className="text-xs text-slate-500">Mastery percentage by syllabus module</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topicAccuracy} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={110}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}% Accuracy`, 'Mastery']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {analytics.topicAccuracy.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.accuracy >= 85
                          ? '#16A34A'
                          : entry.accuracy >= 70
                          ? '#2563EB'
                          : '#E11D48'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics vs Strong Topics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Topics Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Topics Needing Immediate Attention</span>
            </h3>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Low Mastery
            </span>
          </div>

          <div className="space-y-3">
            {analytics.weakTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{item.topic}</span>
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {item.score}% Accuracy
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Recommendation:</strong> {item.recommendation}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Subject: {item.subject}</span>
                  <button
                    onClick={() => onGoToNotebook(item.subject)}
                    className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open {item.subject} Notes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strong Topics Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strong Topics (High Mastery)</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Top 90th Percentile
            </span>
          </div>

          <div className="space-y-3">
            {analytics.strongTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{item.topic}</span>
                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {item.score}% Accuracy
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Solid grasp of core definitions, proof derivations, and standard numerical problems.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Subject: {item.subject}</span>
                  <span className="text-emerald-700 font-medium">✓ Ready for Finals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Personalized Study Recommendation Banner */}
      <div className="p-6 rounded-2xl bg-blue-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-1">
              Personalized AI Study Recommendation
            </h4>
            <p className="text-sm text-blue-50 leading-relaxed max-w-2xl">
              {analytics.studyRecommendation}
            </p>
          </div>
        </div>

        <button
          onClick={onTakePracticeExam}
          className="px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shrink-0 transition-colors shadow-xs"
        >
          Practice Weak Topics Now
        </button>
      </div>
    </div>
  );
};
