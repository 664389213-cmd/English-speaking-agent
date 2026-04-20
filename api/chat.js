// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userMessage, history, systemInstruction } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // 1. 预处理 History：将 'ai' 角色转换为 Gemini 认识的 'model'
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text || "" }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedHistory,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      }
    );

    const data = await response.json();
    
    // 处理 API 错误
    if (data.error) throw new Error(data.error.message || "Gemini API Error");

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("AI Returned Empty Content");

    // --- 核心修复 1: 剥离 Markdown 标签 ---
    // 有时 AI 会返回 ```json { ... } ```，这会导致 JSON.parse 失败
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let aiObj;
    try {
      aiObj = JSON.parse(cleanedText);
      // 如果 AI 返回的是数组 [ { ... } ]，取第一个
      if (Array.isArray(aiObj)) aiObj = aiObj[0];
    } catch (e) {
      console.error("JSON Parse Fail, raw text:", cleanedText);
      throw new Error("AI output was not valid JSON");
    }

    // --- 核心修复 2: 终极字段映射（确保前端不崩溃） ---
    const standardized = {
      ai_reply: aiObj.ai_reply || aiObj.response || aiObj.reply || aiObj.text || "I'm sorry, I couldn't understand that. Could you try again?",
      grammar_feedback: aiObj.grammar_feedback || aiObj.feedback || "Good effort!",
      next_phase_suggestion: aiObj.next_phase_suggestion ?? false,
      is_session_end: aiObj.is_session_end ?? false,
      summary_evaluation: aiObj.summary_evaluation || "",
      phoneme_assessment_placeholder: aiObj.phoneme_assessment_placeholder || "N/A",
      word_assessment_simulated: aiObj.word_assessment_simulated || aiObj.word_assessment || [],
      dynamic_scaffolding: aiObj.dynamic_scaffolding || aiObj.scaffolding || { 
        starters: [], 
        keywords: [], 
        hints: [] 
      }
    };

    res.status(200).json(standardized);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
        error: "Proxy internal error", 
        message: error.message,
        // 这里返回一个空的结构化对象，防止前端崩溃
        ai_reply: "Oops! My brain is a bit foggy. Can we try that again?",
        dynamic_scaffolding: { starters: [], keywords: [], hints: [] }
    });
  }
}
