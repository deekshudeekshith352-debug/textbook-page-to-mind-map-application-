import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  Globe,
  Save,
  Trash2,
  BookOpen,
  Calculator,
  MessageSquare,
  RotateCw,
  Plus
} from 'lucide-react';
import { MindMapNode, NodeType } from '../types/mindmap';

interface NodeInspectorModalProps {
  node: MindMapNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNode: (updatedNode: MindMapNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddChildNode: (parentId: string) => void;
  onRegenerateBranch: (node: MindMapNode) => void;
  onAskTutor: (node: MindMapNode) => void;
  onPlayTTS: (text: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  isOpen,
  onClose,
  onSaveNode,
  onDeleteNode,
  onAddChildNode,
  onRegenerateBranch,
  onAskTutor,
  onPlayTTS,
}) => {
  if (!isOpen || !node) return null;

  const [title, setTitle] = useState(node.title);
  const [summary, setSummary] = useState(node.summary);
  const [details, setDetails] = useState(node.details || '');
  const [type, setType] = useState<NodeType>(node.type);
  const [formula, setFormula] = useState(node.formula || '');
  const [sourcePage, setSourcePage] = useState(node.sourcePage?.toString() || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Kannada');

  useEffect(() => {
    setTitle(node.title);
    setSummary(node.summary);
    setDetails(node.details || '');
    setType(node.type);
    setFormula(node.formula || '');
    setSourcePage(node.sourcePage?.toString() || '');
    setTranslatedText(null);
  }, [node]);

  const handleSave = () => {
    onSaveNode({
      ...node,
      title: title.trim(),
      summary: summary.trim(),
      details: details.trim() || undefined,
      type,
      formula: formula.trim() || undefined,
      sourcePage: sourcePage.trim() || undefined,
    });
    onClose();
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textToTranslate = `${title}. ${summary}`;
      const res = await fetch('/api/tutor/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, targetLanguage: targetLang }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const isRoot = node.id === 'root' || !node.parentId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md capitalize">
              {type} Node
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {node.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Concept / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Core Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Extended Academic Notes / Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Add step-by-step notes, edge cases, or classroom lecture notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Node Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NodeType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
              >
                <option value="concept">Concept</option>
                <option value="subtopic">Subtopic</option>
                <option value="formula">Formula</option>
                <option value="definition">Definition</option>
                <option value="example">Example</option>
                <option value="takeaway">Key Takeaway</option>
                {isRoot && <option value="core">Root Core</option>}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Page Reference</label>
              <input
                type="text"
                value={sourcePage}
                onChange={(e) => setSourcePage(e.target.value)}
                placeholder="e.g. Page 2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Math / Formula Notation (Optional)
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. E = mc^2 or \\lambda = h/p"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Translation Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Globe className="h-3.5 w-3.5 text-indigo-500" />
                <span>Translate into</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-slate-100 font-semibold rounded px-1.5 py-0.5 border border-slate-200"
                >
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 disabled:opacity-40"
              >
                {isTranslating ? <RotateCw className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                <span>Translate</span>
              </button>
            </div>

            {translatedText && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                <span className="font-bold block text-[10px] uppercase text-purple-700 mb-0.5">
                  {targetLang} Translation
                </span>
                <p className="leading-relaxed">{translatedText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Node Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPlayTTS(`${title}. ${summary}`)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Listen to pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAskTutor(node)}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              title="Ask AI Tutor"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onRegenerateBranch(node);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold"
              title="Deepen this branch with AI"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Deepen Branch</span>
            </button>
            <button
              onClick={() => {
                onAddChildNode(node.id);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
              title="Add child node"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Child</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isRoot && (
              <button
                onClick={() => {
                  onDeleteNode(node.id);
                  onClose();
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                title="Delete this node"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
