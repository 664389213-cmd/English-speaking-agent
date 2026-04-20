import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AIReply, Level, Message, Phase, Scene, Unit } from '../types';

// 注意：现在不再使用 SDK 直接调用，所以 ai 实例其实已不再需要，但保留也不影响
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const replySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ai_reply: {
      type: Type.STRING,
      description: 'The natural conversational reply from the AI to the user.',
    },
    grammar_feedback: {
      type: Type.STRING,
      description: 'Specific feedback on the user\'s grammar and vocabulary.',
    },
    next_phase_suggestion: {
      type: Type.BOOLEAN,
      description: 'True if current phase is completed.',
    },
    is_session_end: {
      type: Type.BOOLEAN,
      description: 'True if ALL phases are completed and this is the final goodbye.',
    },
    summary_evaluation: {
      type: Type.STRING,
      description: 'A concise, important summary of the user\'s overall performance for the whole session. Only provided when is_session_end is true.',
    },
    phoneme_assessment_placeholder: {
      type: Type.STRING,
      description: 'A brief simulated phonetic assessment for the whole response.',
    },
    word_assessment_simulated: {
      type: Type.ARRAY,
      description: "A word-by-word assessment of the user's PREVIOUS message.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          score: { type: Type.STRING, enum: ["green", "yellow", "red"] },
          suggestion: { type: Type.STRING }
        },
        required: ["word", "score"]
      }
    },
    dynamic_scaffolding: {
      type: Type.OBJECT,
      description: 'Scaffolding tailored to the student\'s level for their NEXT turn.',
      properties: {
        fullSentences: { type: Type.ARRAY, items: { type: Type.STRING } },
        starters: { type: Type.ARRAY, items: { type: Type.STRING } },
        hints: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        advancedPhrases: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              phrase: { type: Type.STRING },
              translation: { type: Type.STRING }
            },
            required: ["phrase", "translation"]
          }
        }
      }
    }
  },
  required: ['ai_reply', 'grammar_feedback', 'next_phase_suggestion', 'dynamic_scaffolding']
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIResponse(
  unit: Unit,
  scene: Scene,
  level: Level,
  currentPhase: Phase,
  messages: Message[],
  userMessage: string
): Promise<AIReply> {
  const isFinalPhase = scene.phases.indexOf(currentPhase) === scene.phases.length - 1;

  // 强化 JSON Schema 定义的 systemInstruction
  const systemInstruction = `You are an intelligent and friendly English speaking practice agent for middle school students. 

TEXTBOOK ALIGNMENT (CRITICAL):
You MUST prioritize phrases and grammar from ${unit.title}:
- Key words: ${scene.preTaskReview.words.join(', ')}
- Key patterns: ${scene.preTaskReview.phrases.join(', ')}

Current Context:
- Unit: ${unit.title} (${unit.titleCn})
- Scene: ${scene.title} (${scene.titleCn})
- Setting/Roles: ${scene.context}
- Student Level: ${level}
- Current Phase: ${currentPhase.name} (Goal: ${currentPhase.aiGoal})
- Is Final Phase: ${isFinalPhase}

Guidelines:
1. CONCISENESS: Max 30 words. BOLD ONLY your questions (wrap them in **). Do not bold anything else.
2. TEXTBOOK LANGUAGE: Use the vocabulary/patterns listed above naturally.
3. IRRELEVANT ANSWER DETECTION: If user's "${userMessage}" is off-topic, flag it in 'grammar_feedback'.
4. VOICE DIAGNOSIS GUESS: In 'word_assessment_simulated', if you see a word that's obviously a mis-recognition based on common phonetic similarities (e.g., student said 'unknown' but it recognized 'all-known', or said 'calligraphy' but it recognized 'curly-graphy'), set the score to 'yellow' or 'red' and provide the correct word in 'suggestion'.
5. SCAFFOLDING:
   - Level L1: fullSentences.
   - Level L2: starters, keywords, and 'hints' (leading guiding answers or ideas).
   - Level L3: keywords, advancedPhrases.
6. FINAL WRAP-UP: If ${isFinalPhase} and you feel the session should end, set 'is_session_end: true'.
7. WORD ASSESSMENT: Word-by-word scores for "${userMessage}".

Always return valid JSON following this EXACT schema:
{
  "ai_reply": "string (your spoken response)",
  "grammar_feedback": "string (feedback on student's last input)",
  "next_phase_suggestion": boolean,
  "is_session_end": boolean,
  "summary_evaluation": "string",
  "phoneme_assessment_placeholder": "string",
  "word_assessment_simulated": [{"word": "string", "score": "green/yellow/red", "suggestion": "string"}],
  "dynamic_scaffolding": {
    "fullSentences": ["string"],
    "starters": ["string"],
    "keywords": ["string"],
    "hints": ["string"],
    "advancedPhrases": [{"phrase": "string", "translation": "string"}]
  }
}`;

  // 构造 Gemini 原生格式的历史记录（role + parts）
  const cleanHistory = messages.map(m => ({
    role: m.role === 'ai' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  // 如果最后一条不是当前用户消息，则追加（避免重复）
  if (cleanHistory.length === 0 || cleanHistory[cleanHistory.length - 1].parts[0].text !== userMessage) {
    cleanHistory.push({ role: 'user', parts: [{ text: userMessage }] });
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          history: cleanHistory,
          systemInstruction
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as AIReply;
    } catch (error: any) {
      attempts++;
      if (error?.status === 429 && attempts < maxAttempts) {
        await delay(2000);
        continue;
      }
      
      console.error('Error generating AI response:', error);
      
      if (error?.status === 429) {
        return {
          ai_reply: "Oops! My brain is a bit busy right now (Quota Reached). Please wait a moment before asking again. / 提问太快啦，请稍等一会儿再试哦。",
          grammar_feedback: "System busy (Quota Exceeded).",
          next_phase_suggestion: false,
          phoneme_assessment_placeholder: "N/A",
          dynamic_scaffolding: { starters: [], keywords: [] }
        };
      }

      return {
        ai_reply: "I'm sorry, my systems are having a little trouble connecting right now. Could you please try again?",
        grammar_feedback: "Connection error.",
        next_phase_suggestion: false,
        phoneme_assessment_placeholder: "N/A",
        dynamic_scaffolding: { starters: [], keywords: [] }
      };
    }
  }

  // Fallback
  return {
    ai_reply: "I'm sorry, I couldn't respond right now. Please try again soon.",
    grammar_feedback: "Unexpected error.",
    next_phase_suggestion: false,
    phoneme_assessment_placeholder: "N/A",
    dynamic_scaffolding: { starters: [], keywords: [] }
  };
}
