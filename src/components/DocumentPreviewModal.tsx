import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Cpu, Database, BookOpen, Layers, Loader2, Sparkles } from 'lucide-react';
import { DocumentItem } from '../types';
import { apiService } from '../services/apiService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  document,
  onClose,
}) => {
  const [chunks, setChunks] = useState<any[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState<boolean>(false);
  const [selectedChunkIdx, setSelectedChunkIdx] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !document) return;

    setIsLoadingChunks(true);
    apiService
      .fetchDocumentChunks(document.id)
      .then((data) => {
        setChunks(data);
        setSelectedChunkIdx(0);
      })
      .catch((err) => {
        console.warn('Could not fetch chunks for document:', err);
      })
      .finally(() => {
        setIsLoadingChunks(false);
      });
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const currentChunk = chunks[selectedChunkIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {document.name}
              </h3>
              <p className="text-xs text-slate-500">
                Uploaded {document.uploadDate} • {document.pages} Pages • {document.size}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Status: Fully Ingested & Vector Indexed</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {chunks.length > 0 ? chunks.length : document.extractedChunksCount} Chunks
            </span>
          </div>

          {/* RAG Telemetry / Metrics */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Ingestion Pipeline Telemetry:</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Processing</span>
                <span className="font-semibold text-slate-800">
                  {document.metrics?.totalDurationMs ? `${document.metrics.totalDurationMs}ms` : 'Completed'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Page Count</span>
                <span className="font-semibold text-slate-800">{document.pages} Pages</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Vector Density</span>
                <span className="font-semibold text-slate-800">128-dim dense</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">OCR Scanned</span>
                <span className="font-semibold text-slate-800">
                  {document.metrics?.ocrPagesCount ? `${document.metrics.ocrPagesCount} pages` : '0 (Direct)'}
                </span>
              </div>
            </div>
          </div>

          {/* Chunk Navigator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Indexed Vector Chunks</span>
              </h4>
              {chunks.length > 0 && (
                <div className="flex items-center gap-1">
                  {chunks.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedChunkIdx(idx)}
                      className={`w-6 h-6 rounded-md text-[11px] font-bold transition-colors ${
                        selectedChunkIdx === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoadingChunks ? (
              <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-500">Loading vector chunks from knowledge store...</span>
              </div>
            ) : currentChunk ? (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-800">
                    Chunk #{currentChunk.chunkIndex + 1} • Pages {currentChunk.pageStart}–{currentChunk.pageEnd}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {currentChunk.tokenCount || currentChunk.text?.split(/\s+/).length} tokens ({currentChunk.charCount || currentChunk.text?.length} chars)
                  </span>
                </div>
                {currentChunk.metadata?.headingPath && (
                  <p className="text-[11px] font-semibold text-blue-700">
                    Section: {currentChunk.metadata.headingPath}
                  </p>
                )}
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {currentChunk.text}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <p className="text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200 text-[11px]">
                  {document.previewSnippet ||
                    'Section 1.1: Relational models structure information into formal mathematical relations. Functional dependency X → Y dictates that tuple equality on attribute X enforces tuple equality on attribute Y. Normalization decomposes relations to achieve lossless joins and eliminate update anomalies.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
