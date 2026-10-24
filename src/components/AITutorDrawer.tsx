import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  Globe,
  Gauge,
  Lightbulb,
  Code2,
  BookOpen,
  ArrowRight,
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import { MindMapData, MindMapNode, TutorChatMessage } from '../types/mindmap';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mindmap: MindMapData;
  selectedNode: MindMapNode | null;
  onPlayTTS: (text: string) => void;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  mindmap,
  selectedNode,
  onPlayTTS,
}) => {
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I'm your MindMap AI Pro Study Tutor. I'm primed with all the concepts, formulas, and notes from **"${mindmap.title}"**.

Feel free to ask me for simple analogies, step-by-step formula derivations, code examples, or exam revision questions. You can also switch languages (including Kannada, Hindi, English) and explanation levels!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // If user selected a new node while tutor is open, add an inviting hint
  useEffect(() => {
    if (selectedNode && isOpen) {
      // Don't duplicate if last message is already about this node
    }
  }, [selectedNode, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: TutorChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      selectedNodeId: selectedNode?.id,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentTopic: mindmap.title,
          selectedNode: selectedNode,
          overview: mindmap.overview,
          definitions: mindmap.definitions,
          formulas: mindmap.formulas,
          language,
          explanationLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach tutor service');
      }

      const data = await response.json();

      const assistantMsg: TutorChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an issue connecting to the AI tutor service. Please check your network and retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed top-16 right-0 bottom-0 w-full sm:w-[460px] bg-white border-l border-slate-200/90 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-slate-900">AI Academic Tutor</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[240px]">
              {selectedNode ? `Focused on: ${selectedNode.title}` : `Topic: ${mindmap.title}`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Control Strip: Language & Pedagogical Level */}
      <div className="px-3.5 py-2 border-b border-slate-100 bg-white flex items-center justify-between gap-2 text-xs">
        {/* Language Selector */}
        <div className="flex items-center gap-1 text-slate-600">
          <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Spanish">Español (Spanish)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="French">Français</option>
            <option value="German">Deutsch</option>
            <option value="Japanese">日本語</option>
          </select>
        </div>

        {/* Depth Level */}
        <div className="flex items-center gap-1 text-slate-600">
          <Gauge className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <div className="flex bg-slate-100 p-0.5 rounded-md text-[10px] font-semibold">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExplanationLevel(lvl)}
                className={`px-1.5 py-0.5 rounded capitalize transition-all ${
                  explanationLevel === lvl
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lvl === 'beginner' ? 'ELI5' : lvl === 'intermediate' ? 'Standard' : 'Deep'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Focused Node Notification Bar if selected */}
      {selectedNode && (
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-indigo-900 truncate">
            <span className="font-semibold text-indigo-600 shrink-0">[Node]</span>
            <span className="truncate font-medium">{selectedNode.title}</span>
          </div>
          <button
            onClick={() => handleSendMessage(`Explain the concept "${selectedNode.title}" in detail with an intuitive analogy.`)}
            className="shrink-0 text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
          >
            <span>Explain</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
              }`}
            >
              {/* Formatted Text rendering with basic markdown bullets / code formatting */}
              <div className="space-y-1.5 whitespace-pre-wrap break-words">
                {msg.content}
              </div>

              {/* Message Footer with Copy & Audio Listen */}
              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPlayTTS(msg.content)}
                      className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                      title="Listen with Text-to-Speech"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-500">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xs">
              <RotateCw className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
              <span>Analyzing curriculum & formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        <button
          onClick={() => handleSendMessage('Give me a simple real-world analogy to remember this easily.')}
          className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Lightbulb className="h-3 w-3 text-amber-500" />
          <span>Real-world Analogy</span>
        </button>
        <button
          onClick={() => handleSendMessage('Explain the formulas or mathematics step by step with variable meanings.')}
          className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span>Step-by-Step Derivation</span>
        </button>
        <button
          onClick={() => handleSendMessage('Provide a practical programming or engineering code snippet demonstrating this.')}
          className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Code2 className="h-3 w-3 text-emerald-500" />
          <span>Code Example</span>
        </button>
        <button
          onClick={() => handleSendMessage(`Translate the summary of "${selectedNode?.title || mindmap.title}" into Kannada.`)}
          className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Globe className="h-3 w-3 text-purple-500" />
          <span>Translate to Kannada</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              selectedNode
                ? `Ask anything about "${selectedNode.title}"...`
                : 'Ask anything about this chapter or mind map...'
            }
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0 shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
