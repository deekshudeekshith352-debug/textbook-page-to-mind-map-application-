import React, { useState } from 'react';
import {
  X,
  BookOpen,
  HelpCircle,
  Calculator,
  Bookmark,
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  Copy,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Flashcard,
  MindMapData,
  QuizQuestion,
  StudyDefinition,
  StudyFormula
} from '../types/mindmap';

interface StudyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindmap: MindMapData;
  onPlayTTS: (text: string) => void;
}

export const StudyToolsModal: React.FC<StudyToolsModalProps> = ({
  isOpen,
  onClose,
  mindmap,
  onPlayTTS,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'definitions' | 'formulas'>('flashcards');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteryScores, setMasteryScores] = useState<Record<string, 'review' | 'good' | 'mastered'>>({});
  const flashcards = mindmap.flashcards || [];

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [fillBlankInput, setFillBlankInput] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizScore, setQuizScore] = useState(0);
  const quiz = mindmap.quiz || [];

  // Copied definitions
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  // Flashcards navigation
  const nextCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCardIndex((prev) => (prev + 1) % (flashcards.length || 1));
  };

  const prevCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCardIndex((prev) => (prev - 1 + flashcards.length) % (flashcards.length || 1));
  };

  const markMastery = (id: string, status: 'review' | 'good' | 'mastered') => {
    setMasteryScores((prev) => ({ ...prev, [id]: status }));
    nextCard();
  };

  // Quiz submission
  const handleSelectAnswer = (qId: string, answer: string, correctAnswer: string) => {
    if (quizSubmitted[qId]) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: answer }));
    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));

    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      setQuizScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore === quiz.length) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return nextScore;
      });
    }
  };

  const handleFillBlankSubmit = (qId: string, correctAnswer: string) => {
    const input = fillBlankInput[qId] || '';
    if (!input.trim() || quizSubmitted[qId]) return;
    handleSelectAnswer(qId, input.trim(), correctAnswer);
  };

  const currentCard = flashcards[cardIndex];

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                Interactive Study Tools Suite
              </h2>
              <p className="text-xs text-slate-500">
                {mindmap.title} {mindmap.chapter ? `• ${mindmap.chapter}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-4 md:px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'flashcards'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Flashcards ({flashcards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Adaptive Quiz ({quiz.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('definitions')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'definitions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Glossary & Definitions ({mindmap.definitions?.length || 0})</span>
          </button>

          {mindmap.formulas && mindmap.formulas.length > 0 && (
            <button
              onClick={() => setActiveTab('formulas')}
              className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'formulas'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Formulas ({mindmap.formulas.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Chapter Summary</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          {/* TAB 1: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="max-w-xl mx-auto space-y-5">
              {flashcards.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No flashcards generated yet for this material.
                </div>
              ) : (
                <>
                  {/* Card Status Bar */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>
                      Card {cardIndex + 1} of {flashcards.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Mastered: {Object.values(masteryScores).filter((s) => s === 'mastered').length}
                      </span>
                      <button
                        onClick={() => setCardIndex(Math.floor(Math.random() * flashcards.length))}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Shuffle card"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[260px] rounded-2xl bg-white border border-slate-200 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {isFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}
                      </span>
                      {currentCard?.category && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {currentCard.category}
                        </span>
                      )}
                    </div>

                    <div className="my-auto py-4 text-center">
                      <p className={`font-semibold leading-relaxed ${isFlipped ? 'text-indigo-900 text-sm md:text-base' : 'text-slate-900 text-base md:text-lg'}`}>
                        {isFlipped ? currentCard?.answer : currentCard?.question}
                      </p>

                      {showHint && !isFlipped && currentCard?.hint && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200 inline-block">
                          💡 Hint: {currentCard.hint}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                      <span>Click to flip card</span>
                      <div className="flex items-center gap-2">
                        {currentCard?.hint && !isFlipped && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHint(!showHint);
                            }}
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            {showHint ? 'Hide hint' : 'Show hint'}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayTTS(isFlipped ? currentCard.answer : currentCard.question);
                          }}
                          className="p-1 hover:text-indigo-600"
                          title="Listen to card audio"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Navigation and Mastery Buttons */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={prevCard}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markMastery(currentCard.id, 'review')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          Need Review
                        </button>
                        <button
                          onClick={() => markMastery(currentCard.id, 'good')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          Good
                        </button>
                        <button
                          onClick={() => markMastery(currentCard.id, 'mastered')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          Mastered
                        </button>
                      </div>

                      <button
                        onClick={nextCard}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: ADAPTIVE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Quiz Score Header */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                    Interactive Exam Recall Quiz
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Test your understanding with real textbook questions and instant rationale.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Score</span>
                  <p className="text-lg font-bold text-indigo-600">
                    {quizScore} / {quiz.length}
                  </p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {quiz.map((q, idx) => {
                  const isSubmitted = Boolean(quizSubmitted[q.id]);
                  const userAns = quizAnswers[q.id];
                  const isCorrect = userAns?.toLowerCase() === q.correctAnswer.toLowerCase();

                  return (
                    <div
                      key={q.id}
                      className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Question {idx + 1} • {q.type.toUpperCase().replace('_', ' ')}
                        </span>
                        {q.sourcePage && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.sourcePage}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs md:text-sm font-semibold text-slate-900 leading-snug">
                        {q.question}
                      </h4>

                      {/* Question Type: MCQ */}
                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((option, oIdx) => {
                            const isChosen = userAns === option;
                            const isAnswerCorrect = option === q.correctAnswer;

                            let btnStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700';
                            if (isSubmitted) {
                              if (isAnswerCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isChosen && !isAnswerCorrect) {
                                btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                              } else {
                                btnStyle = 'border-slate-100 bg-slate-50/30 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectAnswer(q.id, option, q.correctAnswer)}
                                disabled={isSubmitted}
                                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{option}</span>
                                {isSubmitted && isAnswerCorrect && (
                                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                )}
                                {isSubmitted && isChosen && !isAnswerCorrect && (
                                  <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Question Type: True / False */}
                      {q.type === 'true_false' && (
                        <div className="flex items-center gap-3 pt-1">
                          {['True', 'False'].map((val) => {
                            const isChosen = userAns === val;
                            const isAnswerCorrect = val.toLowerCase() === q.correctAnswer.toLowerCase();

                            let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';
                            if (isSubmitted) {
                              if (isAnswerCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isChosen && !isAnswerCorrect) {
                                btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                              }
                            }

                            return (
                              <button
                                key={val}
                                onClick={() => handleSelectAnswer(q.id, val, q.correctAnswer)}
                                disabled={isSubmitted}
                                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${btnStyle}`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Question Type: Fill in the Blank */}
                      {q.type === 'fill_blank' && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={fillBlankInput[q.id] || ''}
                            onChange={(e) =>
                              setFillBlankInput((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            disabled={isSubmitted}
                            placeholder="Type your answer here..."
                            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleFillBlankSubmit(q.id, q.correctAnswer)}
                            disabled={isSubmitted || !fillBlankInput[q.id]?.trim()}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40"
                          >
                            Submit
                          </button>
                        </div>
                      )}

                      {/* Explanation Callout */}
                      {isSubmitted && (
                        <div
                          className={`mt-2 p-3 rounded-xl text-xs space-y-1 ${
                            isCorrect
                              ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/80 border border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            {isCorrect ? (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle className="h-4 w-4" /> Correct Answer!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-700">
                                <XCircle className="h-4 w-4" /> Correct Answer: "{q.correctAnswer}"
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-700">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEFINITIONS & GLOSSARY */}
          {activeTab === 'definitions' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  Essential academic definitions and technical terminology extracted from source.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(mindmap.definitions || []).map((def, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs text-slate-900">{def.term}</h4>
                        {def.sourcePage && (
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {def.sourcePage}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {def.definition}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span className="capitalize font-semibold text-indigo-600">
                        {def.importance || 'High'} Yield
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${def.term}: ${def.definition}`);
                          setCopiedTerm(def.term);
                          setTimeout(() => setCopiedTerm(null), 2000);
                        }}
                        className="flex items-center gap-1 hover:text-slate-700"
                      >
                        {copiedTerm === def.term ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="h-3 w-3" /> Copy
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FORMULAS */}
          {activeTab === 'formulas' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="space-y-3">
                {(mindmap.formulas || []).map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs md:text-sm text-slate-900">
                        {formula.name}
                      </h4>
                      {formula.sourcePage && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {formula.sourcePage}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs md:text-sm shadow-inner flex items-center justify-between">
                      <span>{formula.formula}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(formula.formula)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy formula"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {formula.variables && formula.variables.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Variables & Parameters
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {formula.variables.map((v, vIdx) => (
                            <div key={vIdx} className="flex items-center gap-1.5 text-slate-700">
                              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {v.symbol}
                              </span>
                              <span className="text-[11px] text-slate-500">: {v.explanation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formula.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                        Note: {formula.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHAPTER SUMMARY */}
          {activeTab === 'summary' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Executive Summary</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {mindmap.overview}
                  </p>
                </div>

                {mindmap.keyTakeaways && mindmap.keyTakeaways.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900 mb-2">
                      High-Yield Exam Takeaways
                    </h4>
                    <ul className="space-y-1.5">
                      {mindmap.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
