import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support large image/multimodal payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI client according to AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize JSON response from markdown blocks if present
function parseModelJson<T>(rawText: string | undefined): T {
  if (!rawText) throw new Error('Empty response from AI model');
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

// ---------------- API ROUTES ----------------

// 1. High-Speed Fast Mind Map Generation from textbook pages & notes
app.post('/api/mindmap/generate', async (req, res) => {
  try {
    const {
      pages = [],
      pastedText = '',
      title = '',
      detailLevel = 'detailed',
      focusMode = 'comprehensive',
      speedMode = 'turbo',
    } = req.body;

    if ((!pages || pages.length === 0) && (!pastedText || !pastedText.trim())) {
      return res.status(400).json({ error: 'Please upload at least one page or provide notes/text.' });
    }

    const nodeTarget = detailLevel === 'simple' ? '12 to 16 core nodes' : '20 to 30 structured nodes';
    
    const systemPrompt = `You are MindMap AI Pro Fast Engine. Extract concepts from textbook materials into a structured, faithful mind map rapidly.

RULES:
1. FAITHFUL & CONCISE: Strictly follow textbook facts, formulas, and laws. Do not invent.
2. SPEED & DENSITY: Write crisp, high-yield node titles (3-6 words) and sharp 1-sentence summaries.
3. STRUCTURE:
   - Root node: "root" (parentId: null, type: "core")
   - Level 1: Major themes/units (parentId: "root", type: "concept")
   - Level 2: Mechanisms, principles, subtopics (type: "subtopic")
   - Level 3: Formulas, definitions, high-yield takeaways (type: "formula", "definition", "example", or "takeaway")
   - Total nodes: ${nodeTarget}.
4. CITATIONS: Include sourcePage where applicable (e.g., "p. 1", "p. 3").
5. FLAG UNCERTAIN: Set "uncertain": true if text or diagram is blurry.
6. STUDY TOOLS: Include 4-6 definitions, key formulas, 5 flashcards, and 4-5 quiz questions.

OUTPUT ONLY JSON:
{
  "title": "Topic / Chapter Name",
  "chapter": "Optional Unit",
  "subject": "e.g. Computer Science, Physics, Biology, Economics",
  "overview": "2-sentence chapter overview",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "nodes": [
    {
      "id": "node-1",
      "parentId": "root",
      "title": "Concise concept label",
      "summary": "1-sentence definition/core explanation",
      "details": "optional extended note",
      "type": "core" | "concept" | "subtopic" | "formula" | "definition" | "example" | "takeaway",
      "sourcePage": "p. 1",
      "uncertain": false,
      "formula": "optional equation"
    }
  ],
  "edges": [
    { "id": "e-root-node1", "source": "root", "target": "node-1", "label": "leads to" }
  ],
  "definitions": [
    { "term": "string", "definition": "string", "sourcePage": "string", "importance": "high" }
  ],
  "formulas": [
    { "name": "string", "formula": "string", "variables": [{ "symbol": "string", "explanation": "string" }], "sourcePage": "string", "notes": "string" }
  ],
  "flashcards": [
    { "id": "fc-1", "question": "string", "answer": "string", "hint": "string", "category": "string" }
  ],
  "quiz": [
    { "id": "q-1", "type": "mcq" | "true_false" | "fill_blank", "question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": "string", "explanation": "string", "sourcePage": "string" }
  ]
}`;

    const parts: any[] = [];
    let aggregatedPageTexts = '';

    // Add multimodal image/document parts
    if (pages && Array.isArray(pages)) {
      pages.forEach((page: any, index: number) => {
        // If client already extracted clean text from PDF/OCR, append to text block for 10x faster processing
        if (page.extractedText && page.extractedText.trim()) {
          aggregatedPageTexts += `\n[Page ${page.pageNumber || index + 1} - ${page.name}]:\n${page.extractedText.trim()}\n`;
        } else if (page.base64 && page.mimeType) {
          parts.push({
            inlineData: {
              mimeType: page.mimeType,
              data: page.base64,
            },
          });
          parts.push({
            text: `[Textbook Page ${page.pageNumber || index + 1} - ${page.name || `Page ${index + 1}`}]`,
          });
        }
      });
    }

    let userPrompt = `Generate the structured Mind Map.`;
    if (title) userPrompt += ` Focus topic/title: "${title}".`;
    if (aggregatedPageTexts.trim()) {
      userPrompt += `\n\nExtracted Textbook Content (${pages.length} pages):\n${aggregatedPageTexts.trim()}`;
    }
    if (pastedText && pastedText.trim()) {
      userPrompt += `\n\nAdditional Notes & Document Text:\n${pastedText.trim()}`;
    }

    parts.push({ text: userPrompt });

    // Call Gemini 3.8 Flash with low thinking level for minimum latency
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    });

    const parsedData = parseModelJson<any>(response.text);

    // Validate root node presence
    if (!parsedData.nodes || !Array.isArray(parsedData.nodes) || parsedData.nodes.length === 0) {
      throw new Error('AI could not identify adequate concepts in the uploaded material.');
    }

    const hasRoot = parsedData.nodes.some((n: any) => n.id === 'root' || n.parentId === null);
    if (!hasRoot) {
      parsedData.nodes.unshift({
        id: 'root',
        parentId: null,
        title: parsedData.title || 'Central Topic',
        summary: parsedData.overview || 'Core subject matter extracted from source.',
        type: 'core',
        sourcePage: 'Overview',
      });
    }

    // Auto-generate edges if model missed some connections
    const existingEdges = parsedData.edges || [];
    const nodeMap = new Map(parsedData.nodes.map((n: any) => [n.id, n]));
    
    parsedData.nodes.forEach((node: any) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const edgeExists = existingEdges.some((e: any) => e.source === node.parentId && e.target === node.id);
        if (!edgeExists) {
          existingEdges.push({
            id: `e-${node.parentId}-${node.id}`,
            source: node.parentId,
            target: node.id,
          });
        }
      }
    });

    const finalResult = {
      id: `map-${Date.now()}`,
      title: parsedData.title || title || 'Mind Map',
      chapter: parsedData.chapter || '',
      subject: parsedData.subject || 'General Study',
      overview: parsedData.overview || '',
      keyTakeaways: parsedData.keyTakeaways || [],
      nodes: parsedData.nodes,
      edges: existingEdges,
      definitions: parsedData.definitions || [],
      formulas: parsedData.formulas || [],
      flashcards: parsedData.flashcards || [],
      quiz: parsedData.quiz || [],
      generatedAt: new Date().toISOString(),
      detailLevel,
      sourcePagesCount: pages.length,
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error('Error generating mind map:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process textbook pages and generate mind map.',
    });
  }
});

// 2. Regenerate / Deepen a specific branch
app.post('/api/mindmap/regenerate-branch', async (req, res) => {
  try {
    const { branchId, branchTitle, branchSummary, subjectContext, currentSubnodes = [] } = req.body;

    if (!branchTitle) {
      return res.status(400).json({ error: 'Branch title is required' });
    }

    const prompt = `You are MindMap AI Pro. Expand and deepen the branch "${branchTitle}".
Context:
Subject/Chapter: ${subjectContext || 'Academic Study'}
Branch Summary: ${branchSummary || ''}
Current Child Nodes: ${JSON.stringify(currentSubnodes)}

Generate 3 to 5 new, high-value, specific sub-branches or deeper insights for this node.
Include clear definitions, formulas, or practical examples where appropriate.

Return ONLY valid JSON matching this schema:
{
  "newNodes": [
    {
      "id": "new-subnode-unique-id",
      "parentId": "${branchId}",
      "title": "Subtopic title (3-6 words)",
      "summary": "1-2 sentence core concept explanation",
      "details": "Extended explanation with formulas, code, or nuance",
      "type": "subtopic" | "concept" | "formula" | "definition" | "example",
      "formula": "optional equation",
      "tags": ["tag1"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const result = parseModelJson<any>(response.text);
    return res.json(result);
  } catch (error: any) {
    console.error('Error regenerating branch:', error);
    return res.status(500).json({ error: error?.message || 'Failed to regenerate branch' });
  }
});

// 3. AI Study Tutor Chat (Conversational Tutor with Multi-language and Depth Modes)
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const {
      messages = [],
      currentTopic = '',
      selectedNode = null,
      overview = '',
      definitions = [],
      formulas = [],
      language = 'English',
      explanationLevel = 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
    } = req.body;

    const systemInstruction = `You are the MindMap AI Pro Personal Academic Tutor, inspired by world-class professors from MIT, Oxford, and Stanford.
You are helping a student master this textbook material.

Current Study Context:
Topic: "${currentTopic}"
Executive Overview: "${overview}"
${selectedNode ? `Focused Node: "${selectedNode.title}" (Type: ${selectedNode.type}) - ${selectedNode.summary}. Details: ${selectedNode.details || 'N/A'}` : 'Focused on entire chapter'}
Known Definitions: ${JSON.stringify(definitions.slice(0, 5))}
Known Formulas: ${JSON.stringify(formulas.slice(0, 5))}

Target Language: ${language} (CRITICAL: Answer fluently and naturally in ${language}, e.g. Kannada, Hindi, Spanish, English, etc.)
Pedagogical Level: ${explanationLevel}
- If 'beginner': Explain with simple everyday words, intuitive analogies, real-life metaphors (ELI5). Avoid unneeded jargon.
- If 'intermediate': Clear, solid undergraduate level with structured points and examples.
- If 'advanced': Rigorous, formal mathematical/scientific definitions, boundary cases, derivations, algorithmic complexities, and academic depth.

Special Instructions:
1. When citing facts directly tied to the textbook, mention page references when known.
2. If providing supplementary external insights, clearly flag: "💡 Additional context beyond textbook: ..."
3. If the topic involves math, physics, or computing, format equations neatly and provide concrete code snippets (e.g. Python, C++, or JavaScript) when relevant.
4. Keep explanations encouraging, intellectually stimulating, and easy to retain for exams.`;

    // Map message history
    const contents: any[] = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0.35,
      },
    });

    return res.json({
      reply: response.text || 'I could not generate an explanation at this moment.',
      timestamp: new Date().toISOString(),
      language,
    });
  } catch (error: any) {
    console.error('Error in tutor chat:', error);
    return res.status(500).json({ error: error?.message || 'Tutor service encountered an error.' });
  }
});

// 4. Translate Node / Branch
app.post('/api/tutor/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'Kannada' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required for translation' });

    const prompt = `Translate the following academic concept into fluent, accurate ${targetLanguage}. Maintain technical accuracy and educational clarity:
"${text}"
Provide ONLY the translated text without extra preamble.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ translatedText: response.text?.trim() });
  } catch (error: any) {
    console.error('Error translating:', error);
    return res.status(500).json({ error: error?.message || 'Translation failed' });
  }
});

// 5. Generate or Refresh Study Tools (Flashcards, Quizzes, Formulas)
app.post('/api/study-tools/generate', async (req, res) => {
  try {
    const { topic, overview, keyTakeaways = [], nodes = [], toolType = 'flashcards' } = req.body;

    const prompt = `You are MindMap AI Pro Study Tool Generator.
Subject Topic: ${topic}
Overview: ${overview}
Key Concepts: ${nodes.map((n: any) => `${n.title}: ${n.summary}`).slice(0, 20).join('; ')}

Tool Requested: "${toolType}" ('flashcards', 'quiz', 'formulas', 'glossary')

Generate high-yield, exam-ready study materials.
Output ONLY valid JSON matching this schema:
{
  "flashcards": [
    { "id": "fc-new-1", "question": "string", "answer": "string", "hint": "string", "category": "${topic}" }
  ],
  "quiz": [
    {
      "id": "q-new-1",
      "type": "mcq" | "true_false" | "fill_blank",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ],
  "formulas": [
    {
      "name": "string",
      "formula": "string",
      "variables": [{ "symbol": "string", "explanation": "string" }],
      "notes": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = parseModelJson<any>(response.text);
    return res.json(result);
  } catch (error: any) {
    console.error('Error generating study tools:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate study tools' });
  }
});

// 6. Text to Speech for node pronunciation / audio listening
app.post('/api/tts', async (req, res) => {
  try {
    const { text = '' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 450), // clean bite-sized sentence
              speechMetadata: {
                style: 'Clear, engaging academic professor voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
    }

    return res.json({ audioBase64: null });
  } catch (err: any) {
    console.warn('TTS warning, frontend will fallback to Web Speech Synthesis:', err?.message);
    return res.json({ audioBase64: null, message: 'Fallback to browser speech' });
  }
});

// ---------------- VITE & STATIC SERVING ----------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindMap AI Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
