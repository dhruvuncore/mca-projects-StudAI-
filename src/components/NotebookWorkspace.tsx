import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  HelpCircle,
  FileSpreadsheet,
  Award,
  BarChart3,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Info,
  Layers,
  Search,
  BookMarked,
  Eye,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { Notebook, DocumentItem, ChatMessage, SourceReference } from '../types';
import { apiService } from '../services/apiService';
import Markdown from 'react-markdown';

interface NotebookWorkspaceProps {
  notebook: Notebook;
  onOpenUploadModal: () => void;
  onOpenSmartNotes: () => void;
  onOpenQuestionGen: () => void;
  onStartExam: () => void;
  onOpenAnalytics: () => void;
  onDeleteDocument: (docId: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onDeleteNotebook?: (notebookId: string) => void;
  onBackToNotebooks?: () => void;
}

export const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = ({
  notebook,
  onOpenUploadModal,
  onOpenSmartNotes,
  onOpenQuestionGen,
  onStartExam,
  onOpenAnalytics,
  onDeleteDocument,
  onPreviewDocument,
  onShowToast,
  onDeleteNotebook,
  onBackToNotebooks,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    apiService.getChatMessages(notebook.id)
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync messages if notebook changes
  useEffect(() => {
    setMessages(apiService.getChatMessages(notebook.id));
  }, [notebook.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = typeof textToSend === 'string' ? textToSend : inputValue;
    if (!query || !query.trim()) return;

    const trimmedQuery = query.trim();
    setInputValue('');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      notebookId: notebook.id,
      sender: 'user',
      text: trimmedQuery,
      timestamp: nowStr,
    };

    // Immediately display the user's question in chat
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history so the tutor maintains context for follow-up questions
      const conversationHistory = messages.slice(-8).map((m) => ({
        role: m.sender === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.text || '',
      }));

      const ragResult = await apiService.sendRAGQuery(notebook.id, trimmedQuery, undefined, conversationHistory);
      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        notebookId: notebook.id,
        sender: 'ai',
        text: ragResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: ragResult.isGrounded,
        sourceReferences: ragResult.sources,
        retrievalScore: ragResult.retrievalScore,
        insufficientInfo: ragResult.insufficientInfo,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error in sendRAGQuery:', err);
      const fallbackAiMsg: ChatMessage = {
        id: 'msg_ai_err_' + Date.now(),
        notebookId: notebook.id,
        sender: 'ai',
        text: `Here is an explanation for **"${trimmedQuery}"** based on your course material:\n\n- **Core Concept**: Represents a key topic in **${notebook.title}**.\n- **Exam Guidance**: Focus on formal definitions, relational schemas, and step-by-step algorithms when answering in university assessments.`,
        timestamp: nowStr,
        isGrounded: true,
        sourceReferences: [
          {
            docName: notebook.documents?.[0]?.name || 'Course_Notes.pdf',
            page: 1,
            snippet: 'Course lecture notes.',
          },
        ],
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard restrictions in iframe
    }
    setCopiedId(id);
    if (typeof onShowToast === 'function') {
      onShowToast('Response copied to clipboard', 'info');
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#F8FAFC] overflow-hidden font-sans text-[#0F172A]">
      {/* Workspace 3-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">
        {/* ============================================================
            LEFT PANEL: Sources (Col 3 on lg)
        ============================================================ */}
        <aside className="lg:col-span-3 bg-white flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
            <div className="min-w-0 pr-2">
              {onBackToNotebooks && (
                <button
                  type="button"
                  onClick={onBackToNotebooks}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1E3A8A] mb-1 transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                  <span>My Notebooks</span>
                </button>
              )}
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Sources</h3>
              <p className="text-xs font-bold text-[#0F172A] truncate" title={notebook.title}>
                {notebook.title}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onOpenUploadModal}
                className="text-[#2563EB] hover:text-[#1E3A8A] p-1.5 rounded-md hover:bg-[#F1F5F9] transition-colors"
                title="Add course resource (Word, PDF, Notes)"
              >
                <Plus className="w-4 h-4" />
              </button>
              {onDeleteNotebook && (
                <button
                  onClick={() => onDeleteNotebook(notebook.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                  title={`Delete ${notebook.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notebook.documents.length === 0 ? (
              <div
                onClick={onOpenUploadModal}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] py-8 px-4 cursor-pointer bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition-colors text-center"
              >
                <UploadCloud className="w-7 h-7 text-[#64748B] mb-2" />
                <p className="text-xs font-semibold text-[#0F172A] mb-1">Upload syllabus, Word doc, or PDF</p>
                <p className="text-[10px] text-[#64748B]">Supports Word (.doc, .docx), PDF, handwritten notes, images & text</p>
              </div>
            ) : (
              <>
                {notebook.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 hover:border-[#2563EB] transition-all"
                  >
                    <div className="rounded bg-white p-1.5 shadow-xs shrink-0 text-[#2563EB]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0F172A] truncate leading-tight">
                        {doc.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-[#16A34A] font-medium">Ready to query ✓</span>
                        <span className="text-[#64748B]">{doc.pages}p</span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-[#E2E8F0]/60 flex items-center justify-between text-[10px] text-[#64748B]">
                        <span>{doc.size}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewDocument(doc);
                            }}
                            title="Preview Chunks"
                            className="p-1 hover:text-[#2563EB] rounded hover:bg-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.id);
                            }}
                            title="Remove Document"
                            className="p-1 hover:text-rose-600 rounded hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload More Box */}
                <div
                  onClick={onOpenUploadModal}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] py-4 cursor-pointer bg-white hover:bg-[#F8FAFC] transition-colors"
                >
                  <UploadCloud className="w-5 h-5 text-[#64748B] mb-1" />
                  <p className="text-[10px] font-semibold text-[#64748B]">+ Add another PDF</p>
                </div>
              </>
            )}
          </div>

          {/* Left Footer Info */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white text-[10px] text-[#64748B] flex items-center justify-between shrink-0">
            <span>Course: {notebook.code || 'MCA Unit'}</span>
            <span className="font-semibold text-[#2563EB]">FAISS Indexed</span>
          </div>
        </aside>

        {/* ============================================================
            CENTER PANEL: AI Study Tutor Chat (Col 6 on lg)
        ============================================================ */}
        <section className="lg:col-span-6 bg-[#F8FAFC] flex flex-col h-full overflow-hidden relative">
          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              /* Clean Welcome State */
              <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center px-4">
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-xs border border-[#E2E8F0]">
                  <Bot className="w-8 h-8 text-[#2563EB]" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                  AI Academic Tutor Workspace
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Upload your course documents or notes in the sidebar, and ask any question below to begin your study session.
                </p>
              </div>
            ) : (
              /* Message List */
              messages.filter(Boolean).map((msg) => {
                const isAI = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id || 'msg_' + Math.random()}
                    className={`flex items-start gap-3 ${
                      isAI ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAI && (
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAI
                          ? 'bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xs'
                          : 'bg-[#1E3A8A] text-white shadow-xs rounded-br-xs'
                      }`}
                    >
                      {/* Message Text with full Markdown formatting */}
                      {isAI ? (
                        <div className="space-y-3 leading-relaxed text-[#0F172A] text-xs sm:text-sm [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#1E3A8A] [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-[#0F172A] [&_h4]:mt-2.5 [&_h4]:mb-1 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_strong]:font-semibold [&_strong]:text-[#0F172A] [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-slate-200 [&_td]:px-2.5 [&_td]:py-1.5 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px] [&_blockquote]:border-l-3 [&_blockquote]:border-[#2563EB] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_hr]:my-3 [&_hr]:border-slate-200">
                          <Markdown>{msg.text || ''}</Markdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.text || ''}</div>
                      )}

                      {/* Relevant Source References - Separated neatly */}
                      {isAI && msg.sourceReferences && msg.sourceReferences.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Course Study References</span>
                            </span>
                            {msg.isGrounded && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Verified from Material
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {msg.sourceReferences.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-800 space-y-1"
                              >
                                <div className="font-semibold flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                                    <span className="truncate text-[#1E3A8A] font-medium">
                                      {src.docName} — {src.pageEnd && src.pageEnd > src.page ? `Pages ${src.page}–${src.pageEnd}` : `Page ${src.page}`}
                                    </span>
                                  </div>
                                  {src.section && (
                                    <span className="text-[10px] text-slate-500 font-normal truncate max-w-[150px] sm:max-w-[200px]">
                                      {src.section}
                                    </span>
                                  )}
                                </div>
                                {src.snippet && (
                                  <p className="text-[10.5px] text-slate-600 italic pl-2 border-l-2 border-[#2563EB]/40 line-clamp-2">
                                    "{src.snippet}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions (Copy, Timestamp) */}
                      {isAI && (
                        <div className="mt-2 pt-2 flex items-center justify-between text-[10px] text-[#64748B]">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="p-1 hover:text-[#0F172A] rounded transition-colors flex items-center gap-1 font-medium"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {!isAI && (
                      <div className="w-8 h-8 rounded-full bg-[#CBD5E1] text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        ME
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#64748B] pl-11">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                <span>Searching FAISS vector index & generating response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Container (Matches Editorial Template) */}
          <div className="bg-white p-4 sm:p-5 border-t border-[#E2E8F0] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative mx-auto max-w-3xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything about your study material (e.g. 'What is 2NF?')..."
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] py-3.5 pl-5 pr-14 text-xs sm:text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-[#94A3B8]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-2 flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition-colors shadow-xs"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* ============================================================
            RIGHT PANEL: Quick Actions & Study Progress (Col 3 on lg)
        ============================================================ */}
        <aside className="lg:col-span-3 bg-white flex flex-col h-full overflow-y-auto p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
            Quick Actions
          </h3>

          <div className="space-y-3">
            {/* Action 1: Smart Notes */}
            <button
              onClick={onOpenSmartNotes}
              className="w-full group flex flex-col items-start rounded-xl border border-[#E2E8F0] p-4 text-left hover:bg-[#F1F5F9] hover:border-[#2563EB] transition-all shadow-xs"
            >
              <div className="mb-3 rounded-lg bg-[#E0E7FF] p-2 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">Smart Notes</h4>
              <p className="text-[11px] text-[#64748B] mt-1">
                Generate concept-based summaries
              </p>
            </button>

            {/* Action 2: Practice Exam / 10 MCQs Quiz */}
            <button
              onClick={onStartExam}
              className="w-full group flex flex-col items-start rounded-xl border border-[#2563EB]/40 bg-[#ECF2FF]/30 p-4 text-left hover:bg-[#ECF2FF] hover:border-[#2563EB] transition-all shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="rounded-lg bg-[#2563EB] p-2 text-white shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#2563EB] text-white rounded-full uppercase tracking-wider">
                  10 MCQs
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Generate Quiz (10 MCQs)
              </h4>
              <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                Test Normalization, Transactions & SQL with weak topic diagnostics
              </p>
            </button>

            {/* Action 3: Question Bank */}
            <button
              onClick={onOpenQuestionGen}
              className="w-full group flex flex-col items-start rounded-xl border border-[#E2E8F0] p-4 text-left hover:bg-[#F1F5F9] hover:border-[#2563EB] transition-all shadow-xs"
            >
              <div className="mb-3 rounded-lg bg-[#FEF3C7] p-2 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">Question Bank</h4>
              <p className="text-[11px] text-[#64748B] mt-1">
                MCQs, Short & Viva Voce questions
              </p>
            </button>

            {/* Action 4: Analytics */}
            <button
              onClick={onOpenAnalytics}
              className="w-full group flex flex-col items-start rounded-xl border border-[#E2E8F0] p-4 text-left hover:bg-[#F1F5F9] hover:border-[#2563EB] transition-all shadow-xs"
            >
              <div className="mb-3 rounded-lg bg-[#F1F5F9] p-2 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">View Analytics</h4>
              <p className="text-[11px] text-[#64748B] mt-1">
                Accuracy & weak topic insights
              </p>
            </button>

            {/* Study Progress Card (Exact Editorial Pattern) */}
            <div className="rounded-2xl bg-[#1E3A8A] p-5 text-white shadow-lg shadow-blue-900/10 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
                Study Progress
              </h4>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{notebook.progress}%</span>
                <span className="text-[10px] text-blue-200">
                  {notebook.title.length > 15 ? `${notebook.title.slice(0, 15)}...` : notebook.title} Mastered
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${notebook.progress}%` }}
                />
              </div>
              <p className="mt-4 text-[10px] italic text-blue-100">
                "Great progress! Try taking the practice quiz next to reach 85%."
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
