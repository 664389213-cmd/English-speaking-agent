import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AIReply, Level, Message, Phase, Scene, Unit } from '../types';

// The system automatically provides process.env.GEMINI_API_KEY
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
      description: "A word-by-word assessment of the user's PREVIOUS message. If a word is yellow/red, try to guess what the user 'might' have been trying to say if it was mis-recognized (e.g. recognized 'all-known' but they meant 'unknown') and put it in 'suggestion'.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          score: { type: Type.STRING, enum: ["green", "yellow", "red"] },
          suggestion: { type: Type.STRING, description: "If word is yellow/red, offer a 'did you mean' guess based on context." }
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
        hints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Leading guiding answers or ideas for the NEXT question (specifically for Level L2)." },
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

Always return JSON adhering to the schema.`;

  const history = messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage,
    history: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] }
    ],
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
        await delay(2000); // 2 second backoff
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
