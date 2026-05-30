import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AIReply, Level, Message, Phase, Scene, Unit } from '../types';

// 注意：现在不再直接使用 SDK，而是通过后端代理调用，所以 ai 实例已无实际作用，但保留不会影响
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const replySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ai_reply: {
      type: Type.STRING,
      description: 'The natural conversational reply from the AI to the user. Speak ONLY in English. Do NOT include any Chinese translations, brackets, or phonetic symbols in this field.',
    },
    ai_reply_cn: {
      type: Type.STRING,
      description: 'Chinese translation of the ai_reply field for better understanding.',
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
      description: "Word-by-word assessment of user's PREVIOUS message. DEFAULT to GREEN unless there's a real error. GREEN=correct/makes sense (even if slight pronunciation issues), YELLOW=unclear/ambiguous, RED=completely wrong/nonsensical. Provide 'suggestion' ONLY for yellow/red. Leave suggestion empty for green. Be encouraging - 80-90% should be green if student shows good effort.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          score: { type: Type.STRING, enum: ["green", "yellow", "red"] },
          suggestion: { type: Type.STRING, description: "For yellow: what you think they meant. For red: correction. Leave EMPTY for green." }
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
2. PHASE PROGRESSION IS CRITICAL: Strictly follow the Current AI Goal for the CURRENT phase. Once the student answers the core question for this phase, IMMEDIATELY transition to the next phase - do NOT keep asking follow-up questions in the same phase.
   - If phase goal is to ask about activity, accept their answer and move forward.
   - If phase goal is to ask "why", accept their reason and mark next_phase_suggestion=true to advance.
3. ACKNOWLEDGE: Briefly react to the student's message ideas.
4. DIG DEEPER: If the student mentions a hobby or feeling (like Yoga), ask about the details, personal benefits, or their favorite part of it (e.g., "How do you feel after a session?") instead of quickly moving to the next generic question.
5. GUIDE & PROMPT: Naturally pivot the conversation to address the "Current AI Goal". **BOLD your specific questions (wrap them in **)**.
6. CONCISENESS: Max 30 words. No lecturing. No repeating known facts.
7. TARGET LANGUAGE: Nudge the student to use these words: ${scene.preTaskReview.words.join(', ')} and patterns: ${scene.preTaskReview.phrases.join(', ')}.

# SCAFFOLDING (Level: ${level})
- **L1 (Beginner)**: In 'fullSentences', provide 2-3 complete, easy-to-repeat sentences the user can say.
- **L2 (Intermediate)**: In 'starters', provide 3-4 sentence starters. In 'hints', provide brief ideas.
- **L3 (Advanced)**: In 'advancedPhrases', provide 2-3 idiomatic expressions or expansion vocabulary related to the context with translations.

# OUTPUT REQUIREMENTS
- 'ai_reply': PURE ENGLISH ONLY. No Chinese. No brackets.
- 'ai_reply_cn': Provide a clear and natural Chinese translation of 'ai_reply' to help students understand better.
- 'grammar_feedback': Helpful feedback (Chinese/English mix is preferred).
- 'word_assessment_simulated': CRITICAL - Provide detailed word-by-word assessment of the user's PREVIOUS message. Default to 'green' UNLESS there is a REAL ERROR:
  * 'green' (MOST COMMON): Word is correct, makes sense in context. Even if slightly mispronounced or misspelled, mark as 'green' if user's intent is clear. LEAVE suggestion EMPTY.
  * 'yellow' (RARE): Word is slightly off or ambiguous (e.g., "teh" instead of "the", "goed" instead of "went"). Provide best guess in 'suggestion'.
  * 'red' (VERY RARE): Word is completely wrong, nonsensical, or doesn't belong (e.g., user said random gibberish, used totally wrong word). Provide correction in 'suggestion'.
  * CRITICAL: If overall message makes sense and shows good effort, mark 80-90% of words as 'green'. Be encouraging and supportive!
  * Example: User says "I go to school yesterday" → mark all words green despite grammar error, explain grammar in 'grammar_feedback' instead.
- 'dynamic_scaffolding': Provide help for their NEXT turn.
- 'is_session_end': Set true only if ${isFinalPhase} and the conversation naturally concludes.

Return STRICT JSON.`;

  // 构建干净的历史记录（只传递角色和文本，不包含 parts 嵌套）
  const historyPayload = [
    ...messages.map(m => ({ role: m.role, text: m.text })),
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
        throw new Error("Backend error: " + response.status + " - " + errorText);
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
          dynamic_scaffolding: { starters: [], keywords: [], advancedPhrases: [] }
        };
      }

      return {
        ai_reply: "I'm sorry, my systems are having a little trouble connecting right now. Could you please try again?",
        grammar_feedback: "Connection error.",
        next_phase_suggestion: false,
        phoneme_assessment_placeholder: "N/A",
        dynamic_scaffolding: { starters: [], keywords: [], advancedPhrases: [] }
      };
    }
  }

  // Fallback
  return {
    ai_reply: "I'm sorry, I couldn't respond right now. Please try again soon.",
    grammar_feedback: "Unexpected error.",
    next_phase_suggestion: false,
    phoneme_assessment_placeholder: "N/A",
    dynamic_scaffolding: { starters: [], keywords: [], advancedPhrases: [] }
  };
}
