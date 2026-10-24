import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { MindMapCanvas } from './components/MindMapCanvas';
import { CanvasControls } from './components/CanvasControls';
import { UploadModal } from './components/UploadModal';
import { AITutorDrawer } from './components/AITutorDrawer';
import { StudyToolsModal } from './components/StudyToolsModal';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { HistoryModal } from './components/HistoryModal';
import {
  MindMapData,
  MindMapNode,
  MapLayout,
  CanvasTheme,
  UploadedPageItem
} from './types/mindmap';
import {
  INITIAL_FEATURED_MINDMAP,
  SAMPLE_TEXTBOOK_SNIPPETS
} from './data/sampleMindMaps';
import {
  exportToJSON,
  exportToSVG,
  exportToPNG,
  exportToPDF
} from './utils/exportUtils';
import { computeMindMapLayout } from './utils/graphLayout';
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'mindmap_ai_pro_saved_maps';

export default function App() {
  // Saved maps library in LocalStorage
  const [savedMaps, setSavedMaps] = useState<MindMapData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local mindmap storage:', e);
    }
    return [INITIAL_FEATURED_MINDMAP];
  });

  // Current active MindMap
  const [currentMindMap, setCurrentMindMap] = useState<MindMapData>(
    savedMaps[0] || INITIAL_FEATURED_MINDMAP
  );

  // Undo & Redo History stacks
  const [undoStack, setUndoStack] = useState<MindMapData[]>([]);
  const [redoStack, setRedoStack] = useState<MindMapData[]>([]);

  // Canvas Viewport
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 300, y: 220 });
  const [layout, setLayout] = useState<MapLayout>('left-to-right');
  const [theme, setTheme] = useState<CanvasTheme>('indigo');

  // Node selection & inspection
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [inspectedNode, setInspectedNode] = useState<MindMapNode | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Modals & Panels
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isStudyToolsOpen, setIsStudyToolsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Global loading & toast notifications
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist to localStorage whenever savedMaps changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMaps));
    } catch (e) {
      console.warn('Failed to persist to localStorage:', e);
    }
  }, [savedMaps]);

  // Update savedMaps whenever currentMindMap is modified
  const updateCurrentMap = (newMap: MindMapData, recordUndo = true) => {
    if (recordUndo) {
      setUndoStack((prev) => [...prev.slice(-15), currentMindMap]);
      setRedoStack([]);
    }
    setCurrentMindMap(newMap);
    setSavedMaps((prev) => {
      const idx = prev.findIndex((m) => m.id === newMap.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newMap;
        return copy;
      }
      return [newMap, ...prev];
    });
  };

  // Undo / Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentMindMap]);
    setCurrentMindMap(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentMindMap]);
    setCurrentMindMap(next);
  };

  // Search Matches
  const matchedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return currentMindMap.nodes
      .filter((n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || (n.formula && n.formula.toLowerCase().includes(q)))
      .map((n) => n.id);
  }, [searchQuery, currentMindMap.nodes]);

  const currentMatchedId = matchedNodeIds[currentMatchIndex];

  const handleNextMatch = () => {
    if (matchedNodeIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchedNodeIds.length);
  };

  const handlePrevMatch = () => {
    if (matchedNodeIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchedNodeIds.length) % matchedNodeIds.length);
  };

  // Center on current search matched node
  useEffect(() => {
    if (currentMatchedId) {
      const target = currentMindMap.nodes.find((n) => n.id === currentMatchedId);
      if (target) {
        setSelectedNode(target);
      }
    }
  }, [currentMatchedId]);

  // Load predefined sample textbook curriculum
  const handleLoadSample = (index: number) => {
    const sample = SAMPLE_TEXTBOOK_SNIPPETS[index];
    if (!sample) return;

    if (index === 0) {
      updateCurrentMap(INITIAL_FEATURED_MINDMAP);
      showToast(`Loaded ${INITIAL_FEATURED_MINDMAP.title}`, 'success');
      return;
    }

    // Generate from snippet text via backend
    handleGenerateMindMap({
      pages: [],
      pastedText: sample.text,
      title: sample.title,
      detailLevel: 'detailed',
      focusMode: 'comprehensive',
    });
  };

  // Generate new mind map from uploaded pages & notes
  const handleGenerateMindMap = async (data: {
    pages: UploadedPageItem[];
    pastedText: string;
    title: string;
    detailLevel: 'simple' | 'detailed';
    focusMode: 'comprehensive' | 'exam' | 'concept';
    speedMode?: 'turbo' | 'standard';
  }) => {
    setIsGenerating(true);
    setIsUploadOpen(false);
    const pageCount = data.pages.length;
    showToast(`⚡ High-speed AI extraction starting on ${pageCount > 0 ? `${pageCount} page(s)` : 'notes'}...`, 'info');

    try {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: data.pages.map((p) => ({
            name: p.name,
            mimeType: p.mimeType,
            base64: p.base64,
            pageNumber: p.pageNumber,
            extractedText: p.extractedText,
          })),
          pastedText: data.pastedText,
          title: data.title,
          detailLevel: data.detailLevel,
          focusMode: data.focusMode,
          speedMode: data.speedMode || 'turbo',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to generate mind map');
      }

      const newMap: MindMapData = await response.json();
      updateCurrentMap(newMap);
      showToast(`⚡ Fast Mind Map generated: "${newMap.title}" with ${newMap.nodes.length} nodes!`, 'success');
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err?.message || 'Failed to generate mind map. Please retry.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Deepen / Regenerate a specific branch
  const handleRegenerateBranch = async (node: MindMapNode) => {
    showToast(`Deepening branch "${node.title}" with AI...`, 'info');
    try {
      const currentChildren = currentMindMap.nodes.filter((n) => n.parentId === node.id);

      const response = await fetch('/api/mindmap/regenerate-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: node.id,
          branchTitle: node.title,
          branchSummary: node.summary,
          subjectContext: currentMindMap.title,
          currentSubnodes: currentChildren.map((c) => c.title),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deepen branch');
      }

      const result = await response.json();
      const newNodes: MindMapNode[] = result.newNodes || [];

      if (newNodes.length === 0) {
        showToast('This branch is already thoroughly detailed.', 'info');
        return;
      }

      // Add unique IDs and connect edges
      const newEdges = newNodes.map((n) => ({
        id: `e-${node.id}-${n.id}`,
        source: node.id,
        target: n.id,
      }));

      const updatedMap: MindMapData = {
        ...currentMindMap,
        nodes: [...currentMindMap.nodes, ...newNodes],
        edges: [...currentMindMap.edges, ...newEdges],
      };

      updateCurrentMap(updatedMap);
      showToast(`Added ${newNodes.length} new subtopics to "${node.title}"!`, 'success');
    } catch (err: any) {
      console.error('Error deepening branch:', err);
      showToast('Could not deepen branch at this moment.', 'error');
    }
  };

  // Node editing handlers
  const handleSaveNode = (updatedNode: MindMapNode) => {
    const updatedNodes = currentMindMap.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    updateCurrentMap({
      ...currentMindMap,
      nodes: updatedNodes,
    });
    showToast(`Updated "${updatedNode.title}"`, 'success');
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'root') return;
    // Remove node and its children recursively
    const nodesToDelete = new Set<string>([nodeId]);
    let added = true;
    while (added) {
      added = false;
      currentMindMap.nodes.forEach((n) => {
        if (n.parentId && nodesToDelete.has(n.parentId) && !nodesToDelete.has(n.id)) {
          nodesToDelete.add(n.id);
          added = true;
        }
      });
    }

    const remainingNodes = currentMindMap.nodes.filter((n) => !nodesToDelete.has(n.id));
    const remainingEdges = currentMindMap.edges.filter(
      (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
    );

    updateCurrentMap({
      ...currentMindMap,
      nodes: remainingNodes,
      edges: remainingEdges,
    });

    if (selectedNode && nodesToDelete.has(selectedNode.id)) {
      setSelectedNode(null);
    }
    showToast(`Deleted ${nodesToDelete.size} node(s)`, 'info');
  };

  const handleAddChildNode = (parentId: string) => {
    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      parentId,
      title: 'New Subtopic',
      summary: 'Add an academic summary or definition for this concept.',
      type: 'subtopic',
      custom: true,
    };

    const newEdge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
    };

    updateCurrentMap({
      ...currentMindMap,
      nodes: [...currentMindMap.nodes, newNode],
      edges: [...currentMindMap.edges, newEdge],
    });

    setInspectedNode(newNode);
    showToast('Created new subtopic. Edit details.', 'success');
  };

  // Play Text to Speech
  const handlePlayTTS = async (text: string) => {
    try {
      // First try backend Gemini TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.play();
        return;
      }
    } catch (e) {
      console.warn('Backend TTS failed, using Web Speech API fallback', e);
    }

    // Fallback: Browser Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Export handlers
  const handleExport = (format: 'png' | 'svg' | 'pdf' | 'json') => {
    if (format === 'json') {
      exportToJSON(currentMindMap);
      showToast('Exported MindMap JSON file', 'success');
    } else if (format === 'svg') {
      if (svgRef.current) {
        exportToSVG(svgRef.current, currentMindMap.title);
        showToast('Exported SVG vector graphic', 'success');
      }
    } else if (format === 'png') {
      if (svgRef.current) {
        exportToPNG(svgRef.current, currentMindMap.title);
        showToast('Generating high-res PNG image...', 'info');
      }
    } else if (format === 'pdf') {
      const { layoutNodes } = computeMindMapLayout(currentMindMap.nodes, layout, theme);
      exportToPDF(currentMindMap, layoutNodes);
      showToast('Exported comprehensive PDF study guide', 'success');
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden text-slate-900">
      {/* Top Header */}
      <Header
        currentMindMap={currentMindMap}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTutor={() => setIsTutorOpen(true)}
        onOpenStudyTools={() => setIsStudyToolsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLoadSample={handleLoadSample}
        onExport={handleExport}
        onPrint={handlePrint}
        isGenerating={isGenerating}
      />

      {/* Main Workspace Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Canvas HUD Controls (Search, Layouts, Themes, Zoom, Undo/Redo) */}
        <CanvasControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(z * 1.15, 2.5))}
          onZoomOut={() => setZoom((z) => Math.max(z * 0.85, 0.2))}
          onResetZoom={() => setZoom(1.0)}
          onFitToScreen={() => {
            const { bounds } = computeMindMapLayout(currentMindMap.nodes, layout, theme);
            const w = window.innerWidth;
            const h = window.innerHeight - 64;
            const treeW = bounds.maxX - bounds.minX + 240;
            const treeH = bounds.maxY - bounds.minY + 240;
            const scale = Math.min(Math.max(Math.min(w / treeW, h / treeH), 0.35), 1.25);
            setZoom(scale);
            setPan({
              x: w / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
              y: h / 2 - ((bounds.minY + bounds.maxY) / 2) * scale,
            });
          }}
          layout={layout}
          onLayoutChange={(l) => setLayout(l)}
          theme={theme}
          onThemeChange={(t) => setTheme(t)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentMatchIndex(0);
          }}
          matchCount={matchedNodeIds.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAutoLayout={() => {
            // Clears any manual node positions and resets layout
            showToast('Auto-layout applied across all branches', 'info');
          }}
        />

        {/* Interactive Mind Map Canvas */}
        <MindMapCanvas
          nodes={currentMindMap.nodes}
          edges={currentMindMap.edges}
          layout={layout}
          theme={theme}
          selectedNodeId={selectedNode?.id || null}
          onSelectNode={(node) => setSelectedNode(node)}
          onEditNode={(node) => setInspectedNode(node)}
          onDeleteNode={handleDeleteNode}
          onAddChildNode={handleAddChildNode}
          onRegenerateBranch={handleRegenerateBranch}
          onAskTutorAboutNode={(node) => {
            setSelectedNode(node);
            setIsTutorOpen(true);
          }}
          onPlayTTS={handlePlayTTS}
          searchQuery={searchQuery}
          matchedNodeIds={matchedNodeIds}
          currentMatchedId={currentMatchedId}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          svgRef={svgRef}
        />

        {/* AI Tutor Assistant Drawer */}
        <AITutorDrawer
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          mindmap={currentMindMap}
          selectedNode={selectedNode}
          onPlayTTS={handlePlayTTS}
        />
      </main>

      {/* Upload Textbook Pages Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onGenerate={handleGenerateMindMap}
        isGenerating={isGenerating}
      />

      {/* Study Tools Suite Modal (Flashcards, Quizzes, Formulas, Summaries) */}
      <StudyToolsModal
        isOpen={isStudyToolsOpen}
        onClose={() => setIsStudyToolsOpen(false)}
        mindmap={currentMindMap}
        onPlayTTS={handlePlayTTS}
      />

      {/* Node Inspector & Edit Modal */}
      <NodeInspectorModal
        node={inspectedNode}
        isOpen={Boolean(inspectedNode)}
        onClose={() => setInspectedNode(null)}
        onSaveNode={handleSaveNode}
        onDeleteNode={handleDeleteNode}
        onAddChildNode={handleAddChildNode}
        onRegenerateBranch={handleRegenerateBranch}
        onAskTutor={(node) => {
          setSelectedNode(node);
          setInspectedNode(null);
          setIsTutorOpen(true);
        }}
        onPlayTTS={handlePlayTTS}
      />

      {/* Mind Map Library / History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedMaps={savedMaps}
        currentMapId={currentMindMap.id}
        onSelectMap={(map) => {
          updateCurrentMap(map);
          showToast(`Opened "${map.title}"`, 'success');
        }}
        onDeleteMap={(id) => {
          const filtered = savedMaps.filter((m) => m.id !== id);
          setSavedMaps(filtered);
          if (currentMindMap.id === id && filtered.length > 0) {
            setCurrentMindMap(filtered[0]);
          }
          showToast('Removed from library', 'info');
        }}
        onLoadSample={handleLoadSample}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <RotateCw className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Global Generation Loading Overlay with Turbo Speed progress */}
      {isGenerating && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-bold text-lg">
                ⚡
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mb-1.5">
                <span>⚡ Turbo Engine Active</span>
                <span>•</span>
                <span>Low Latency</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Generating Concept Map Fast
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Gemini 3.8 Flash is rapidly structuring pages, definitions, equations, and hierarchy in record time...
              </p>
            </div>

            {/* High-throughput stages */}
            <div className="bg-slate-50 rounded-xl p-3 text-left space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-indigo-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Processing textbook data stream
                </span>
                <span className="font-mono text-[11px] text-slate-400">Fast Mode</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-indigo-600 h-1.5 rounded-full animate-pulse w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
