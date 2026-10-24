import React from 'react';
import {
  X,
  Clock,
  Layers,
  Trash2,
  Download,
  BookOpen,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { MindMapData } from '../types/mindmap';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMaps: MindMapData[];
  currentMapId: string;
  onSelectMap: (map: MindMapData) => void;
  onDeleteMap: (mapId: string) => void;
  onLoadSample: (index: number) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedMaps,
  currentMapId,
  onSelectMap,
  onDeleteMap,
  onLoadSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Your Mind Map Library</h3>
              <p className="text-[11px] text-slate-500">
                Switch between saved mind maps or reopen previous sessions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Map List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {savedMaps.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved mind maps found yet.
            </div>
          ) : (
            savedMaps.map((map) => {
              const isCurrent = map.id === currentMapId;
              const dateStr = new Date(map.generatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={map.id}
                  onClick={() => {
                    onSelectMap(map);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {map.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {map.overview}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span>{map.nodes.length} nodes</span>
                      {map.sourcePagesCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{map.sourcePagesCount} pages</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        onSelectMap(map);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    {savedMaps.length > 1 && (
                      <button
                        onClick={() => onDeleteMap(map.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete from library"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{savedMaps.length} saved map(s) stored in browser storage</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
