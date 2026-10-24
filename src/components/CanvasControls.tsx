import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Undo2,
  Redo2,
  Search,
  Palette,
  HelpCircle,
  LayoutGrid,
  GitBranch,
  Compass,
  ArrowDownCircle,
  Workflow,
  Sparkles,
  X
} from 'lucide-react';
import { CanvasTheme, MapLayout } from '../types/mindmap';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  layout: MapLayout;
  onLayoutChange: (layout: MapLayout) => void;
  theme: CanvasTheme;
  onThemeChange: (theme: CanvasTheme) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  layout,
  onLayoutChange,
  theme,
  onThemeChange,
  searchQuery,
  onSearchChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const layouts: { id: MapLayout; name: string; icon: React.ReactNode }[] = [
    { id: 'left-to-right', name: 'Horizontal Tree', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'tree', name: 'Balanced Tree', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'radial', name: 'Radial 360°', icon: <Compass className="h-4 w-4" /> },
    { id: 'top-to-bottom', name: 'Vertical Flow', icon: <ArrowDownCircle className="h-4 w-4" /> },
    { id: 'flowchart', name: 'Process Flow', icon: <Workflow className="h-4 w-4" /> },
  ];

  const themes: { id: CanvasTheme; name: string; color: string }[] = [
    { id: 'indigo', name: 'Cosmic Indigo', color: '#6366f1' },
    { id: 'emerald', name: 'Neon Emerald', color: '#10b981' },
    { id: 'amber', name: 'Warm Amber', color: '#f59e0b' },
    { id: 'slate', name: 'Modern Slate', color: '#475569' },
    { id: 'cyber', name: 'Cyber Neon', color: '#06b6d4' },
  ];

  return (
    <>
      {/* Top Floating Bar: Search, Layout, Themes */}
      <div className="no-print absolute top-3 left-4 right-4 md:right-auto z-30 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Search Bar */}
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 px-2.5 py-1.5 gap-2 w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search concepts, formulas..."
            className="w-full text-xs bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500 font-mono">
              <span>
                {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : '0'}
              </span>
              <button
                onClick={onPrevMatch}
                disabled={matchCount === 0}
                className="hover:text-indigo-600 disabled:opacity-30"
                title="Previous match"
              >
                ▲
              </button>
              <button
                onClick={onNextMatch}
                disabled={matchCount === 0}
                className="hover:text-indigo-600 disabled:opacity-30"
                title="Next match"
              >
                ▼
              </button>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-slate-700 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Layout Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayoutPicker(!showLayoutPicker);
              setShowThemePicker(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Change mind map layout style"
          >
            {layouts.find((l) => l.id === layout)?.icon}
            <span className="capitalize hidden sm:inline">
              {layouts.find((l) => l.id === layout)?.name}
            </span>
          </button>

          {showLayoutPicker && (
            <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Graph Layouts
              </div>
              {layouts.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    onLayoutChange(l.id);
                    setShowLayoutPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-indigo-50/70 transition-colors ${
                    layout === l.id ? 'text-indigo-600 font-bold bg-indigo-50/40' : 'text-slate-700'
                  }`}
                >
                  {l.icon}
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Theme Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemePicker(!showThemePicker);
              setShowLayoutPicker(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Color scheme"
          >
            <Palette className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {showThemePicker && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Branch Themes
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setShowThemePicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    theme === t.id ? 'font-bold text-indigo-600' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <span className="text-[10px] text-indigo-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto Layout Button */}
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          title="Recalculate layout and arrange nodes"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden md:inline">Auto-Layout</span>
        </button>
      </div>

      {/* Bottom Floating Bar: Zoom & History Controls */}
      <div className="no-print absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-1.5 pointer-events-auto">
        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomOut}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={onResetZoom}
          className="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg min-w-[46px] text-center"
          title="Reset to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={onFitToScreen}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Fit mind map to screen (F)"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Keyboard shortcuts"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <span>Canvas Keyboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Pan Canvas</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Drag Background or Space + Drag
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Zoom In / Out</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Scroll Wheel or + / -
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Fit to Screen</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Key: F
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Search Concepts</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Ctrl / Cmd + F
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Undo / Redo</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Ctrl+Z / Ctrl+Y
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Select / Inspect Node</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Click Node Card
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Expand / Collapse Branch</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Click (+/-) Badge
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
