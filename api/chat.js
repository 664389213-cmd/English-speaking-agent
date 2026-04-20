// api/chat.js - 最终版（透传历史，确保上下文不丢失）
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { history, systemInstruction } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error('Missing GEMINI_API_KEY');

    // 将前端传来的 { role, text } 转换为 Gemini 要求的 { role, parts: [{ text }] }
    const contents = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('AI returned empty response');

    // 剥离可能的 Markdown 代码块
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    let aiObj = JSON.parse(cleanedText);
    if (Array.isArray(aiObj)) aiObj = aiObj[0];

    // 字段映射 + 安全默认值
    const scaffoldSource = aiObj.dynamic_scaffolding || aiObj.scaffolding || {};
    const standardized = {
      ai_reply: aiObj.ai_reply || aiObj.response || aiObj.reply || aiObj.text || aiObj.answer || "I'm sorry, I couldn't understand that. Could you try again?",
      grammar_feedback: aiObj.grammar_feedback || aiObj.feedback || "",
      next_phase_suggestion: aiObj.next_phase_suggestion ?? false,
      is_session_end: aiObj.is_session_end ?? false,
      summary_evaluation: aiObj.summary_evaluation || "",
      phoneme_assessment_placeholder: aiObj.phoneme_assessment_placeholder || "N/A",
      word_assessment_simulated: aiObj.word_assessment_simulated || aiObj.word_assessment || [],
      dynamic_scaffolding: {
        fullSentences: scaffoldSource.fullSentences || [],
        starters: scaffoldSource.starters || [],
        hints: scaffoldSource.hints || [],
        keywords: scaffoldSource.keywords || [],
        advancedPhrases: scaffoldSource.advancedPhrases || []
      }
    };

    res.status(200).json(standardized);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    // 即使出错也返回一个完整结构，避免前端崩溃
    res.status(200).json({
      ai_reply: "I'm sorry, my brain is a bit foggy. Can we try that again?",
      grammar_feedback: "System temporarily unavailable.",
      next_phase_suggestion: false,
      is_session_end: false,
      summary_evaluation: "",
      phoneme_assessment_placeholder: "N/A",
      word_assessment_simulated: [],
      dynamic_scaffolding: {
        fullSentences: [],
        starters: [],
        hints: [],
        keywords: [],
        advancedPhrases: []
      }
    });
  }
}
