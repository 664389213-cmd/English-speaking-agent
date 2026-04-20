// api/chat.js - 最终修复版：CORS + 角色自愈 + 字段映射 + 稳定模型配置
export default async function handler(req, res) {
  // --- 1. 设置 CORS 响应头 ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.hello-echo.top');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // --- 2. 处理浏览器预检请求 (OPTIONS) ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 3. 只允许 POST 请求 ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, systemInstruction } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error('Missing GEMINI_API_KEY');

    // --- 4. 角色序列自愈（确保 user / model 严格交替）---
    let contents = [];
    (history || []).forEach((msg) => {
      // 自动识别并转换角色
      let role = (msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user';

      // 第一条消息必须是 user
      if (contents.length === 0 && role === 'model') return;

      // 连续相同角色则合并内容
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n' + (msg.text || '');
        return;
      }

      contents.push({
        role: role,
        parts: [{ text: msg.text || '' }]
      });
    });

    // 最后一条不能是 model（API 要求以 user 结尾）
    if (contents.length > 0 && contents[contents.length - 1].role === 'model') {
      contents.pop();
    }

    // --- 5. 调用 Gemini API（使用稳定的模型和版本）---
    // 模型：gemini-2.0-flash-exp（免费且 JSON 模式稳定）
    // 版本：v1beta（对 system_instruction 支持最完善）
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          system_instruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
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

    // --- 6. 字段映射与安全默认值 ---
    const scaffoldSource = aiObj.dynamic_scaffolding || aiObj.scaffolding || {};
    const standardized = {
      ai_reply: aiObj.ai_reply || aiObj.response || aiObj.reply || aiObj.text || aiObj.answer || "I'm sorry, I couldn't understand that. Could you try again?",
      grammar_feedback: aiObj.grammar_feedback || aiObj.feedback || '',
      next_phase_suggestion: aiObj.next_phase_suggestion ?? false,
      is_session_end: aiObj.is_session_end ?? false,
      summary_evaluation: aiObj.summary_evaluation || '',
      phoneme_assessment_placeholder: aiObj.phoneme_assessment_placeholder || 'N/A',
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
    // 降级返回：避免前端崩溃
    res.status(200).json({
      ai_reply: "I'm back! Could you please repeat that? I had a quick technical glitch.",
      grammar_feedback: 'System Logic Fixed.',
      next_phase_suggestion: false,
      is_session_end: false,
      summary_evaluation: '',
      phoneme_assessment_placeholder: 'N/A',
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
