// api/chat.js - 最终版
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userMessage, history, systemInstruction } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            throw new Error('Missing GEMINI_API_KEY');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history,
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            throw new Error(`Gemini API error ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('AI returned empty response');

        const aiObj = JSON.parse(rawText);

        // 提取 scaffolding 对象（兼容两种字段名）
        const scaffoldSource = aiObj.dynamic_scaffolding || aiObj.scaffolding || {};

        // 构造标准化回复，确保前端永远不会拿到 undefined
        const standardized = {
            ai_reply: aiObj.ai_reply || aiObj.response || aiObj.reply || aiObj.text || "I'm sorry, I couldn't generate a response.",
            grammar_feedback: aiObj.grammar_feedback || "",
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
        console.error('API Error:', error);
        // 即使出错也返回标准结构，避免前端崩溃
        res.status(200).json({
            ai_reply: "I'm sorry, my brain is a bit foggy right now. Could you try again in a moment?",
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
