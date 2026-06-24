import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// We'll initialize the Gemini client lazily or handle missing keys
let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// API: Triage Chat
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { chatHistory } = req.body;
    const client = getAI();
    
    const systemInstruction = `Ты — профессиональный медицинский ИИ-сортировщик (триаж). Твоя задача — задать пациенту 3-4 уточняющих вопроса по очереди, чтобы собрать точный анамнез. НЕ ставь окончательный диагноз. После сбора информации определи уровень риска: LOW (домашний отдых), MEDIUM (запись к врачу), HIGH (срочно вызвать скорую помощь). Возвращай ответ строго в формате JSON: { "text": "твой ответ и вопросы", "risk": "LOW" | "MEDIUM" | "HIGH", "nextStep": "рекомендуемый следующий шаг" }`;
    
    // Construct conversation history for Gemini
    const contents = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    let parsed = { text: "Ошибка парсинга", risk: "UNKNOWN", nextStep: "" };
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("Parse error:", e);
      parsed = { text: text, risk: "UNKNOWN", nextStep: "" };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Metrics Analysis
app.post('/api/analyze-metrics', async (req, res) => {
  try {
    const { metrics } = req.body;
    const client = getAI();
    
    const prompt = `Проанализируй следующие показатели здоровья пациента за последние дни:
${JSON.stringify(metrics)}
Дай структурированный разбор в виде JSON:
{
  "status": "Норма / Отклонение",
  "trend": "Положительный / Отрицательный / Стабильный",
  "advice": "Развернутый совет",
  "correlation": "Найденная закономерность, например: 'при сне менее 6 часов ваше давление повышается'"
}`;
    
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: { 
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });
    
    let parsed = { status: "N/A", trend: "N/A", advice: "No advice", correlation: "N/A" };
    try {
      const cleanText = (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {}

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Image Analysis
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, comment } = req.body;
    const client = getAI();
    
    // Remove data:image/...;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const systemInstruction = `Ты — продвинутый ИИ-ассистент для анализа медицинских изображений (снимков, МРТ, визуальных симптомов на коже). Внимательно изучи изображение и комментарий: '${comment}'. Дай структурированный аналитический разбор того, что видишь, используя понятный пациенту язык. В конце ОБЯЗАТЕЛЬНО добавь строгий дисклеймер о том, что это автоматический анализ и он требует подтверждения живого врача.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
      ],
      config: {
        systemInstruction
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Workout Plan
app.post('/api/generate-workout', async (req, res) => {
  try {
    const { metrics } = req.body;
    const client = getAI();
    
    const prompt = `На основе последних показателей здоровья пациента:
${JSON.stringify(metrics)}
Составь безопасный и персонализированный план тренировок на неделю.
Учитывай пульс и давление. Если показатели плохие, рекомендуй легкую активность.
Верни ответ строго в формате JSON, содержащем массив из 7 дней недели:
{
  "plan": [
    { "day": "День 1", "title": "Кардио-тренировка", "activity": "Описание активности" },
    ...
  ],
  "recommendation": "Общая рекомендация"
}`;
    
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: { 
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });
    
    let parsed = { plan: [], recommendation: "Сбой генерации плана" };
    try {
      const cleanText = (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {}

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
