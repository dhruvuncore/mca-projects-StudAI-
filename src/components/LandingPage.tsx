import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  FileText,
  MessageSquare,
  HelpCircle,
  Award,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Bot,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo?: () => void;
  onOpenLogin?: () => void;
  onSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onViewDemo,
  onOpenLogin,
  onSignIn,
}) => {
  const [activeMockTab, setActiveMockTab] = useState<'tutor' | 'notes' | 'exam'>('tutor');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">StudyAI</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                MCA Final Project
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-6 lg:px-12 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Student Learning & Exam Assistant • Grounded RAG Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Study smarter with your own <br />
            <span className="text-blue-600">AI study assistant</span>.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload your notes and study material. Generate smart notes, ask questions, practice
            exams, and discover the topics you need to improve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onViewDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-base shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>View Interactive Demo</span>
            </button>
          </div>

          {/* Product Preview / Mockup */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-4 shadow-xl shadow-slate-200/50 text-left">
            {/* Mockup Window Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  StudyAI Workspace — Database Management Systems (MCA-201)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveMockTab('tutor')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeMockTab === 'tutor'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Tutor
                </button>
                <button
                  onClick={() => setActiveMockTab('notes')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeMockTab === 'notes'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Smart Notes
                </button>
                <button
                  onClick={() => setActiveMockTab('exam')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeMockTab === 'exam'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Practice Exam
                </button>
              </div>
            </div>

            {/* Mockup Workspace Interior */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 bg-slate-50/70 rounded-xl p-3 min-h-[320px]">
              {/* Left Mock Sources */}
              <div className="md:col-span-3 bg-white p-3 rounded-lg border border-slate-200 hidden md:block">
                <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Sources (3 PDFs)</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    FAISS Ready
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-blue-50/50 border border-blue-100 text-[11px]">
                    <div className="font-medium text-slate-800 truncate">DBMS Unit 1 — Normalization.pdf</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>28 pages processed</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                    <div className="font-medium text-slate-800 truncate">DBMS Unit 2 — SQL & ACID.pdf</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>36 pages processed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Dynamic Preview */}
              <div className="md:col-span-9 bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                {activeMockTab === 'tutor' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-800 mb-1">
                          AI Study Tutor (Based on DBMS Unit 1)
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          A relation is in <strong>Boyce-Codd Normal Form (BCNF)</strong> if and only if
                          for every non-trivial functional dependency <em>X → Y</em>, <strong>X is strictly a Super Key</strong>.
                          Unlike 3NF, BCNF does not allow exceptions for prime attributes.
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
                          <span>[Source: DBMS Unit 1.pdf, Page 18]</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-500">
                      <span>Ask anything about your uploaded material...</span>
                      <span className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-medium">
                        Ask AI
                      </span>
                    </div>
                  </div>
                )}

                {activeMockTab === 'notes' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-slate-900">Smart Notes — DBMS Unit 1</h4>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                        AI Generated
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      <strong>Executive Summary:</strong> Normalization minimizes operational anomalies (insertion, deletion, update) by decomposing relations while adhering to the Lossless Join Theorem.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded bg-amber-50 border border-amber-200">
                        <span className="font-semibold text-amber-900 block text-[11px]">Exam Focus Topic:</span>
                        <span className="text-amber-800 text-[10px]">Armstrong Axioms and BCNF lossless verification proof (95% exam probability).</span>
                      </div>
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                        <span className="font-semibold text-emerald-900 block text-[11px]">Beginner Analogy:</span>
                        <span className="text-emerald-800 text-[10px]">Separating contacts and addresses so moving house doesn't require 500 row edits.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeMockTab === 'exam' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-slate-900">Question 3 of 10</span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-semibold border border-amber-200">
                        ⏱ 14:12 Remaining
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 text-sm">
                      Under what condition does a 3NF relation fail to satisfy BCNF?
                    </p>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs">
                        A. When there is a partial dependency on a composite key
                      </div>
                      <div className="p-2 rounded-lg border-2 border-blue-600 bg-blue-50 text-blue-900 font-medium text-xs flex items-center justify-between">
                        <span>B. When functional dependency X → Y exists where Y is a prime attribute but X is NOT a super key</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs">
                        C. When the relation contains repeating groups
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>FastAPI Backend-Ready • Grounded RAG Pipeline</span>
                  <button
                    onClick={onViewDemo}
                    className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Open Full Interactive Workspace <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Feature Cards */}
        <section className="py-14 px-6 lg:px-12 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Everything you need to master your syllabus
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Purpose-built for college students to transform dense academic PDFs into actionable knowledge, practice exams, and clear exam scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">1. Smart Notes</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Synthesizes chapters into executive summaries, key concepts, highlighted points, beginner analogies, and high-probability exam topics.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">2. AI Tutor</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Ask questions about any complex derivation, code, or theory. Every answer includes precise citations to your uploaded PDF pages.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">3. Question Generator</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Configure practice questions by type (MCQ, Short, Long, Viva), difficulty, and specific syllabus topic on demand.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">4. Exam Mode</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Take realistic timed mock tests with questions grid, countdown timer, instant scoring, topic weakness diagnosis, and revision advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-6 lg:px-12 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              How it works
            </h2>
            <p className="text-slate-600 text-sm">
              Three simple steps to accelerate your exam preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center relative z-10 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-blue-500/30">
                1
              </div>
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">1. Upload your material</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Drop your syllabus PDFs or lecture notes. Our pipeline extracts text and indexes chunks into a vector database.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center relative z-10 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-blue-500/30">
                2
              </div>
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">2. Ask and learn</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Interact with your AI study tutor, request summaries, and generate structured notes with beginner explanations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center relative z-10 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-blue-500/30">
                3
              </div>
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">3. Practice and improve</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Attempt timed practice exams, identify your weak topics with analytics, and revise focused concepts.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-14 p-8 rounded-2xl bg-blue-900 text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Ready to study for your upcoming exams?</h3>
            <p className="text-blue-200 text-sm max-w-xl mx-auto mb-6">
              Join students using StudyAI to master DBMS, Computer Networks, Operating Systems, and more.
            </p>
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Launch StudyAI Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>
          AI Student Learning & Exam Assistant • Master of Computer Applications (MCA) Project
        </p>
      </footer>
    </div>
  );
};
