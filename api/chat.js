// api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userMessage, history, systemInstruction } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // 注意：这里我们使用 v1beta 接口以支持最新的 Flash 模型和 JSON Mode
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history, // 前端已经处理好了格式
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        responseMimeType: "application/json", // 强制要求返回 JSON
                    }
                })
            }
        );

        const data = await response.json();
        
        // 关键：Gemini 返回的是一个 JSON 字符串，我们需要解析它
        const rawResponseRole = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawResponseRole) throw new Error("AI 未返回内容");

        // 直接由于前端已经定义好了 Schema，这里原样返回给前端解析即可
        const aiReplyObj = JSON.parse(rawResponseRole);
        
        res.status(200).json(aiReplyObj);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
}
