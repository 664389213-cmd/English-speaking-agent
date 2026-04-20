import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AIReply, Level, Message, Phase, Scene, Unit } from '../types';

// 注意：现在尝试通过后端代理调用以增强稳定性并隐藏 API Key
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const replySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ai_reply: {
      type: Type.STRING,
      description: 'The natural conversational reply from the AI to the user. Speak ONLY in English. Do NOT include any Chinese translations, brackets, or phonetic symbols in this field.',
    },
    grammar_feedback: {
      type: Type.STRING,
      description: 'Specific feedback on the user\'s grammar and vocabulary. Chinese/English mix is preferred here.',
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

  const systemInstruction = `You are an empathetic and professional English speaking partner for 8th-grade middle school students. 

# SCENE CONTEXT
- **Unit**: ${unit.title} (${unit.titleCn})
- **Scene**: ${scene.title} (${scene.titleCn})
- **Your Role/Setting**: ${scene.context} 
- **Conversation Phase**: ${currentPhase.name}
- **Current AI Goal**: ${currentPhase.aiGoal}

# CORE PERSONALITY & TONE
- NATURAL CONVERSATION (EQ ABOVE ALL): Do NOT just list vocabulary. You must first acknowledge what the student said with empathy (e.g., "That sounds lovely!", "I totally get that.") before guiding them forward.
- NATURAL BRIDGE: Use phrases like "Actually...", "By the way...", "That reminds me..." to transition.
- VOCABULARY LEVEL: Strictly use Middle School (CEFR A2) level. Do NOT use advanced words like 'recruit' or 'facilitate'. Use natural, idiomatic English (e.g., "piece of cake", "on the same page") but Speak ONLY in English in 'ai_reply'. No brackets or Chinese.
- ANTI-REPETITION: Never repeat a statement you just made. If you already said "Yoga is good for stress", do NOT say it again in the next turn.

# STRATEGIC GUIDANCE
1. ROLEPLAY CONSISTENCY: Be fully in character based on the # SCENE CONTEXT. If you are a doctor, talk like one. If you are a friend at a playground, be casual.
2. ACKNOWLEDGE: Briefly react to the student's message ideas.
3. DIG DEEPER: If the student mentions a hobby or feeling (like Yoga), ask about the details, personal benefits, or their favorite part of it (e.g., "How do you feel after a session?") instead of quickly moving to the next generic question.
4. GUIDE & PROMPT: Naturally pivot the conversation to address the "Current AI Goal". **BOLD your specific questions (wrap them in **)**.
5. CONCISENESS: Max 30 words. No lecturing. No repeating known facts.
6. TARGET LANGUAGE: Nudge the student to use these words: ${scene.preTaskReview.words.join(', ')} and patterns: ${scene.preTaskReview.phrases.join(', ')}.

# OUTPUT REQUIREMENTS
- 'ai_reply': PURE ENGLISH ONLY. No Chinese. No brackets. 
- 'grammar_feedback': Helpful feedback (Chinese/English mix is preferred).
- 'word_assessment_simulated': Word-by-word score.
- 'dynamic_scaffolding': Provide help for their NEXT turn.
- 'is_session_end': Set true only if ${isFinalPhase} and the conversation naturally concludes.

Return STRICT JSON.`;

  // 构建干净的历史记录（只传递角色和文本）
  const historyPayload = [
    ...messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text })),
    { role: 'user', text: userMessage }
  ];

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      // 通过优化后的 API 子域名请求后端代理
      const response = await fetch('https://api.hello-echo.top/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
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
