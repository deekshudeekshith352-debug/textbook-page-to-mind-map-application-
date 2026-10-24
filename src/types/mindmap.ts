export type NodeType = 
  | 'core' 
  | 'concept' 
  | 'subtopic' 
  | 'formula' 
  | 'definition' 
  | 'example' 
  | 'takeaway';

export interface MindMapNode {
  id: string;
  parentId: string | null;
  title: string;
  summary: string;
  details?: string;
  type: NodeType;
  color?: string;
  collapsed?: boolean;
  sourcePage?: number | string;
  uncertain?: boolean;
  formula?: string;
  tags?: string[];
  position?: { x: number; y: number };
  custom?: boolean;
  width?: number;
  height?: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface StudyDefinition {
  term: string;
  definition: string;
  sourcePage?: string | number;
  importance?: 'high' | 'medium' | 'low';
}

export interface StudyFormula {
  name: string;
  formula: string;
  variables: { symbol: string; explanation: string }[];
  sourcePage?: string | number;
  notes?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  sourcePage?: string | number;
  mastery?: 'new' | 'learning' | 'mastered';
}

export type QuizType = 'mcq' | 'true_false' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  sourcePage?: string | number;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface MindMapData {
  id: string;
  title: string;
  chapter?: string;
  subject?: string;
  overview: string;
  keyTakeaways: string[];
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  definitions: StudyDefinition[];
  formulas: StudyFormula[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  generatedAt: string;
  detailLevel: 'simple' | 'detailed';
  sourcePagesCount: number;
}

export interface UploadedPageItem {
  id: string;
  name: string;
  mimeType: string;
  base64: string;
  previewUrl: string;
  pageNumber: number;
  selected: boolean;
  fileSize: number;
  type: 'image' | 'pdf' | 'text';
  extractedText?: string;
}

export type MapLayout = 'left-to-right' | 'tree' | 'radial' | 'top-to-bottom' | 'flowchart';

export type CanvasTheme = 'emerald' | 'indigo' | 'amber' | 'slate' | 'cyber';

export interface TutorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  selectedNodeId?: string;
  codeSnippets?: { language: string; code: string }[];
  isExternalKnowledge?: boolean;
}

export interface GenerateMindMapRequest {
  title?: string;
  detailLevel: 'simple' | 'detailed';
  focusMode: 'comprehensive' | 'exam' | 'concept';
  pages: {
    name: string;
    mimeType: string;
    base64: string;
    pageNumber: number;
  }[];
  pastedText?: string;
}
