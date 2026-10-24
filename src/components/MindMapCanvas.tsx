import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MindMapNode,
  MindMapEdge,
  MapLayout,
  CanvasTheme,
  NodeType
} from '../types/mindmap';
import {
  LayoutedNode,
  computeMindMapLayout,
  generateConnectorPath,
  getSubtreeNodeIds,
  getAncestorNodeIds,
  NODE_WIDTH,
  NODE_HEIGHT,
  ROOT_WIDTH,
  ROOT_HEIGHT
} from '../utils/graphLayout';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  MessageSquare,
  AlertTriangle,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Calculator,
  BookMarked,
  Lightbulb,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layout: MapLayout;
  theme: CanvasTheme;
  selectedNodeId: string | null;
  onSelectNode: (node: MindMapNode | null) => void;
  onEditNode: (node: MindMapNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddChildNode: (parentId: string) => void;
  onRegenerateBranch: (node: MindMapNode) => void;
  onAskTutorAboutNode: (node: MindMapNode) => void;
  onPlayTTS: (text: string) => void;
  searchQuery: string;
  matchedNodeIds: string[];
  currentMatchedId?: string;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  edges,
  layout,
  theme,
  selectedNodeId,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onAddChildNode,
  onRegenerateBranch,
  onAskTutorAboutNode,
  onPlayTTS,
  searchQuery,
  matchedNodeIds,
  currentMatchedId,
  zoom,
  setZoom,
  pan,
  setPan,
  svgRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Collapsed state map: nodeId -> boolean
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  // Custom node dragged positions
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

  // Hovered node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Compute layouted nodes and edges
  const { layoutNodes, visibleEdges, bounds } = computeMindMapLayout(
    nodes,
    layout,
    theme,
    collapsedMap,
    customPositions
  );

  const nodeMap = new Map<string, LayoutedNode>(layoutNodes.map((n) => [n.id, n]));

  // Selected branch highlighting (ancestors + descendants)
  const activeBranchSet = React.useMemo(() => {
    if (!selectedNodeId && !hoveredNodeId) return null;
    const targetId = selectedNodeId || hoveredNodeId;
    if (!targetId) return null;

    const ancestors = getAncestorNodeIds(targetId, nodes);
    const descendants = getSubtreeNodeIds(targetId, nodes);
    const combined = new Set<string>([...ancestors, ...descendants, targetId]);
    return combined;
  }, [selectedNodeId, hoveredNodeId, nodes]);

  // Fit to screen helper
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || layoutNodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 120;
    const treeW = bounds.maxX - bounds.minX + padding * 2;
    const treeH = bounds.maxY - bounds.minY + padding * 2;

    const scaleX = clientWidth / treeW;
    const scaleY = clientHeight / treeH;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: clientWidth / 2 - centerX * newZoom,
      y: clientHeight / 2 - centerY * newZoom,
    });
  }, [layoutNodes.length, bounds, setZoom, setPan]);

  // Initial fit to screen on layout change or load
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, [layout, nodes.length]);

  // Toggle Collapse
  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prevZoom) => Math.min(Math.max(prevZoom * zoomFactor, 0.2), 2.5));
  };

  // Canvas Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    // If clicking directly on SVG canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggedNodeId) {
      // Dragging a node in canvas coordinates
      const currentX = (e.clientX - pan.x) / zoom;
      const currentY = (e.clientY - pan.y) / zoom;
      setCustomPositions((prev) => ({
        ...prev,
        [draggedNodeId]: {
          x: currentX - nodeDragOffset.x,
          y: currentY - nodeDragOffset.y,
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Start dragging node
  const handleNodeMouseDown = (node: LayoutedNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setDraggedNodeId(node.id);
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;
    setNodeDragOffset({
      x: canvasMouseX - node.x,
      y: canvasMouseY - node.y,
    });
    onSelectNode(node);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectNode(null);
      } else if (e.key === 'f' || e.key === 'F') {
        // If not typing in input
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        fitToScreen();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        if (selectedNodeId && selectedNodeId !== 'root') {
          onDeleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, fitToScreen, onDeleteNode, onSelectNode]);

  // Node type icon helper
  const getNodeTypeBadge = (type: NodeType) => {
    switch (type) {
      case 'core':
        return { label: 'Core', icon: <Sparkles className="h-3 w-3 text-amber-500" />, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'concept':
        return { label: 'Concept', icon: <Lightbulb className="h-3 w-3 text-indigo-500" />, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'subtopic':
        return { label: 'Topic', icon: <BookMarked className="h-3 w-3 text-blue-500" />, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'formula':
        return { label: 'Formula', icon: <Calculator className="h-3 w-3 text-emerald-500" />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'definition':
        return { label: 'Definition', icon: <FileText className="h-3 w-3 text-purple-500" />, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'example':
        return { label: 'Example', icon: <CheckCircle2 className="h-3 w-3 text-teal-500" />, bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'takeaway':
        return { label: 'Takeaway', icon: <Bookmark className="h-3 w-3 text-rose-500" />, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Node', icon: <Lightbulb className="h-3 w-3 text-slate-500" />, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`mindmap-canvas-container relative w-full h-[calc(100vh-4rem)] overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        theme === 'slate' ? 'canvas-blueprint-pattern' : 'canvas-dots-pattern'
      }`}
    >
      <svg
        ref={svgRef}
        id="canvas-bg"
        className="w-full h-full absolute inset-0 overflow-visible"
      >
        <defs>
          {/* Connector arrow markers */}
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
          </marker>

          {/* Gradients for branch connectors */}
          <linearGradient id="edge-gradient-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Scaled & panned canvas group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Connector lines between nodes */}
          <g className="edges-layer">
            {visibleEdges.map((edge) => {
              const sourceNode = nodeMap.get(edge.source);
              const targetNode = nodeMap.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const pathString = generateConnectorPath(sourceNode, targetNode, layout);
              const isBranchActive =
                !activeBranchSet ||
                (activeBranchSet.has(edge.source) && activeBranchSet.has(edge.target));

              const strokeColor = targetNode.branchColor || '#6366f1';

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  {/* Subtle glow under active edge */}
                  {isBranchActive && activeBranchSet && (
                    <path
                      d={pathString}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="6"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Main connector path */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isBranchActive ? '2.5' : '1.5'}
                    strokeOpacity={isBranchActive ? 0.9 : 0.25}
                    strokeDasharray={edge.style === 'dashed' ? '5,5' : 'none'}
                    markerEnd={layout === 'flowchart' ? 'url(#flow-arrow)' : undefined}
                    className="transition-all duration-200"
                  />
                  {/* Optional edge label */}
                  {edge.label && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2 + 10}
                      y={(sourceNode.y + targetNode.y) / 2 - 8}
                      className="text-[10px] font-medium fill-slate-500 select-none bg-white/80"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Node Cards Layer */}
          <g className="nodes-layer">
            {layoutNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isMatch = matchedNodeIds.includes(node.id);
              const isCurrentMatch = currentMatchedId === node.id;
              const isRoot = node.id === 'root' || !node.parentId;

              const isBranchActive = !activeBranchSet || activeBranchSet.has(node.id);
              const opacity = isBranchActive ? 1 : 0.35;

              const badge = getNodeTypeBadge(node.type);

              return (
                <foreignObject
                  key={node.id}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  className="overflow-visible"
                >
                  <div
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onMouseDown={(e) => handleNodeMouseDown(node, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node);
                    }}
                    style={{
                      opacity,
                      borderTopColor: node.branchColor,
                    }}
                    className={`group relative rounded-xl border-t-4 transition-all duration-150 cursor-pointer shadow-md flex flex-col justify-between p-2.5 ${
                      isRoot
                        ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl ring-2 ring-indigo-500/40'
                        : 'bg-white text-slate-800 border-x border-b border-slate-200 hover:border-slate-300 hover:shadow-lg'
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 shadow-indigo-500/20 scale-[1.02]'
                        : ''
                    } ${
                      isCurrentMatch
                        ? 'ring-3 ring-amber-500 animate-pulse'
                        : isMatch
                        ? 'ring-2 ring-amber-400'
                        : ''
                    }`}
                  >
                    {/* Top Row: Type Tag, Page Number, Uncertainty */}
                    <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold border ${
                            isRoot ? 'bg-indigo-800/80 text-indigo-200 border-indigo-700' : badge.bg
                          }`}
                        >
                          {badge.icon}
                          <span className="truncate">{badge.label}</span>
                        </span>

                        {node.uncertain && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-medium"
                            title="Uncertain or blurred in textbook source"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span>Verify</span>
                          </span>
                        )}
                      </div>

                      {node.sourcePage && (
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                            isRoot
                              ? 'bg-indigo-900/60 text-indigo-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {typeof node.sourcePage === 'number'
                            ? `p. ${node.sourcePage}`
                            : node.sourcePage}
                        </span>
                      )}
                    </div>

                    {/* Node Title */}
                    <h4
                      className={`font-bold text-xs leading-tight line-clamp-2 ${
                        isRoot ? 'text-white text-sm' : 'text-slate-900'
                      }`}
                      title={node.title}
                    >
                      {node.title}
                    </h4>

                    {/* Node Formula / Equation snippet if present */}
                    {node.formula && (
                      <div className="mt-1 px-1.5 py-0.5 rounded bg-emerald-50/80 border border-emerald-200/80 text-[10px] font-mono text-emerald-800 truncate">
                        {node.formula}
                      </div>
                    )}

                    {/* Node Summary */}
                    <p
                      className={`text-[11px] leading-snug line-clamp-2 mt-1 ${
                        isRoot ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                      title={node.summary}
                    >
                      {node.summary}
                    </p>

                    {/* Expand / Collapse Badge Button if parent node has children */}
                    {nodes.some((n) => n.parentId === node.id) && (
                      <button
                        onClick={(e) => toggleCollapse(node.id, e)}
                        className={`absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-transform hover:scale-110 z-10 ${
                          node.hasHiddenChildren
                            ? 'bg-amber-500 text-white ring-2 ring-white animate-bounce'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                        title={
                          node.hasHiddenChildren
                            ? `Expand ${node.hiddenCount} hidden subtopics`
                            : 'Collapse branch'
                        }
                      >
                        {node.hasHiddenChildren ? `+${node.hiddenCount || ''}` : '−'}
                      </button>
                    )}

                    {/* Floating Hover Action Toolbar */}
                    {(isHovered || isSelected) && (
                      <div
                        className="no-print absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-xl px-1.5 py-1 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Deepen / Regenerate branch with AI */}
                        <button
                          onClick={() => onRegenerateBranch(node)}
                          className="p-1 rounded text-amber-300 hover:bg-slate-800 transition-colors"
                          title="Deepen / Expand this branch with AI"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>

                        {/* Add custom child node */}
                        <button
                          onClick={() => onAddChildNode(node.id)}
                          className="p-1 rounded text-white hover:bg-slate-800 transition-colors"
                          title="Add child node"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Node */}
                        <button
                          onClick={() => onEditNode(node)}
                          className="p-1 rounded text-white hover:bg-slate-800 transition-colors"
                          title="Edit node details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Ask AI Tutor */}
                        <button
                          onClick={() => onAskTutorAboutNode(node)}
                          className="p-1 rounded text-cyan-300 hover:bg-slate-800 transition-colors"
                          title="Ask AI Tutor about this concept"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>

                        {/* TTS Audio Readout */}
                        <button
                          onClick={() => onPlayTTS(`${node.title}. ${node.summary}`)}
                          className="p-1 rounded text-emerald-300 hover:bg-slate-800 transition-colors"
                          title="Listen to explanation"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Node (Cannot delete root) */}
                        {!isRoot && (
                          <button
                            onClick={() => onDeleteNode(node.id)}
                            className="p-1 rounded text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete node"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
};
