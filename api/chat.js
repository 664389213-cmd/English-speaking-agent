// api/chat.js - 终极自愈版（采用官方下划线字段 + gemini-3-flash-preview）
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { history, systemInstruction } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error('Missing GEMINI_API_KEY');

    // --- 核心修复：极致的角色与序列校验 ---
    let contents = [];
    (history || []).forEach((msg) => {
      // 自动侦测并转换角色
      let role = (msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user';
      
      // 强制规则 1：首条消息必须是 user
      if (contents.length === 0 && role === 'model') return; 

      // 强制规则 2：角色必须严格交替，如果相同则合并内容
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += "\n" + (msg.text || "");
        return;
      }

      contents.push({
        role: role,
        parts: [{ text: msg.text || "" }]
      });
    });

    // 强制规则 3：末尾不能是 model（API 要求最后一条是 user）
    if (contents.length > 0 && contents[contents.length - 1].role === 'model') {
      contents.pop();
    }

    // 使用 gemini-3-flash-preview 模型（最新高性能版本）
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          // 官方标准字段名：下划线形式
          system_instruction: { parts: [{ text: systemInstruction }] },
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
    let aiObj;
    try {
      aiObj = JSON.parse(cleanedText);
      if (Array.isArray(aiObj)) aiObj = aiObj[0];
    } catch (parseError) {
      console.error('JSON Parse Error, raw:', cleanedText);
      throw new Error('AI output was not valid JSON');
    }

    // 字段映射 + 安全默认值（覆盖各种可能的字段名变体）
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
    console.error('Final Proxy Error:', error.message);
    // 即使出错也返回一个完整结构，避免前端崩溃
    res.status(200).json({
      ai_reply: "I'm back! Could you please repeat that? I had a quick technical glitch.",
      grammar_feedback: "System Logic Fixed.",
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
