import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Download,
  Printer,
  History,
  Bot,
  Brain,
  GraduationCap,
  ChevronDown,
  Layers,
  FileText,
  FileCode,
  Image,
  FolderOpen
} from 'lucide-react';
import { MindMapData } from '../types/mindmap';
import { SAMPLE_TEXTBOOK_SNIPPETS } from '../data/sampleMindMaps';

interface HeaderProps {
  currentMindMap: MindMapData;
  onOpenUpload: () => void;
  onOpenTutor: () => void;
  onOpenStudyTools: () => void;
  onOpenHistory: () => void;
  onLoadSample: (index: number) => void;
  onExport: (format: 'png' | 'svg' | 'pdf' | 'json') => void;
  onPrint: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMindMap,
  onOpenUpload,
  onOpenTutor,
  onOpenStudyTools,
  onOpenHistory,
  onLoadSample,
  onExport,
  onPrint,
  isGenerating,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);

  return (
    <header className="no-print h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
      {/* Brand & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
                MindMap AI Pro
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                v2.5
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate max-w-xs">
              {currentMindMap.chapter ? `${currentMindMap.chapter} • ` : ''}
              {currentMindMap.title || 'Interactive AI Learning Workspace'}
            </p>
          </div>
        </div>

        {/* Current Active Map Tag */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 max-w-[200px] truncate">
            <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{currentMindMap.title}</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {currentMindMap.nodes.length} nodes
          </span>
          {currentMindMap.sourcePagesCount > 0 && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {currentMindMap.sourcePagesCount} pages scanned
            </span>
          )}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sample Topics Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSamplesMenu(!showSamplesMenu);
              setShowExportMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Load ready-to-explore textbook samples"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Try Samples</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showSamplesMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Textbook Curriculums
                </p>
              </div>
              {SAMPLE_TEXTBOOK_SNIPPETS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onLoadSample(idx);
                    setShowSamplesMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50/70 transition-colors flex flex-col gap-0.5 group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">
                    {sample.title}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{sample.subject}</span>
                    <span className="text-indigo-500 font-medium">1-Click Map</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Study Tools Modal Trigger */}
        <button
          onClick={onOpenStudyTools}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/60 transition-colors shadow-2xs"
          title="Flashcards, Quizzes, Formulas, and Summaries"
        >
          <GraduationCap className="h-4 w-4 text-indigo-600" />
          <span className="hidden sm:inline">Study Tools</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
        </button>

        {/* AI Tutor Assistant Trigger */}
        <button
          onClick={onOpenTutor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
          title="Open interactive AI tutor"
        >
          <Bot className="h-4 w-4" />
          <span>AI Tutor</span>
        </button>

        {/* New Upload / Scan Button */}
        <button
          onClick={onOpenUpload}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{isGenerating ? 'Processing...' : 'Upload Pages'}</span>
        </button>

        {/* Saved History */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open saved mind maps"
        >
          <FolderOpen className="h-4 w-4" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowSamplesMenu(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Export mind map"
          >
            <Download className="h-4 w-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Export Options
                </p>
              </div>
              <button
                onClick={() => {
                  onExport('png');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Image className="h-4 w-4 text-emerald-600" />
                <span>Export as PNG Image</span>
              </button>
              <button
                onClick={() => {
                  onExport('svg');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileCode className="h-4 w-4 text-indigo-600" />
                <span>Export as SVG Vector</span>
              </button>
              <button
                onClick={() => {
                  onExport('pdf');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-rose-600" />
                <span>Export as PDF Study Brief</span>
              </button>
              <button
                onClick={() => {
                  onExport('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileCode className="h-4 w-4 text-amber-600" />
                <span>Export as JSON Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Print Button */}
        <button
          onClick={onPrint}
          className="hidden md:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Print mind map"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
