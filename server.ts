import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Bridge: Allow cross-origin requests from GitHub Pages (*.github.io) and custom frontends
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Gemini Automatic Fallback Model Chain
  const MODEL_CHAIN = [
    "gemini-3.8-flash",      // 主力旗艦 (深度推理)
    "gemini-3.1-flash-lite", // 輕量降級 (高吞吐、低延遲、寬裕配額)
    "gemini-2.5-flash",      // 標準備援
    "gemini-2.5-flash-lite"  // 極限低延遲備援
  ];

  async function generateWithFallback(prompt: string, modelIndex = 0): Promise<{ data: any; modelUsed: string }> {
    if (modelIndex >= MODEL_CHAIN.length) {
      throw new Error("All Gemini models in the fallback chain have been exhausted.");
    }
    
    const modelName = MODEL_CHAIN[modelIndex];
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      console.log(`[AI Model Router] Attempting generation with model: ${modelName} (tier: ${modelIndex + 1}/${MODEL_CHAIN.length})`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      
      const parsed = JSON.parse(response.text?.trim() || "{}");
      console.log(`[AI Model Router] Successfully generated with: ${modelName}`);
      return { data: parsed, modelUsed: modelName };
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimited = error?.status === 429 || 
                            error?.code === 429 || 
                            errorMsg.includes("429") || 
                            errorMsg.includes("RESOURCE_EXHAUSTED") ||
                            errorMsg.includes("Quota") ||
                            errorMsg.includes("overloaded");

      console.warn(`[AI Model Router] Model ${modelName} failed. Reason: ${errorMsg}`);
      
      if (modelIndex + 1 < MODEL_CHAIN.length) {
        const nextModel = MODEL_CHAIN[modelIndex + 1];
        console.warn(`[AI Model Router] ${isRateLimited ? "429 Quota limit reached" : "Generation error"}. Automatically degrading to next candidate: ${nextModel}`);
        return generateWithFallback(prompt, modelIndex + 1);
      }
      
      throw error;
    }
  }

  // API Route
  app.post("/api/generate", async (req, res) => {
    try {
      const { input, lang } = req.body;
      if (!input || typeof input !== "string" || !input.trim()) {
        return res.status(400).json({ error: "Input prompt is required." });
      }

      const langInstruction = lang === 'zh' 
        ? "Output in Traditional Chinese (繁體中文) for all content." 
        : "Output in English for all content.";
        
      const prompt = `
        You are an expert in Nonviolent Communication (NVC) based on Marshall B. Rosenberg's principles.
        ${langInstruction}
        
        Task: Generate a specific conflict scenario based on the user's input, and provide 5 distinct types of responses.
        
        **CRITICAL CONTEXT CONSISTENCY**:
        The "choices" MUST be strictly derived from the "situation" and "trigger". 
        DO NOT mention unrelated topics (e.g., if the situation is about money, DO NOT mention grades; if the situation is about work, DO NOT mention health).
        Each choice must feel like a direct response to the "trigger" words.
    
        **CRITICAL REQUIREMENT FOR NVC CHOICE**:
        The "NVC" choice MUST be a complete sentence that explicitly includes ALL four components:
        1. Observation (Fact without judgment)
        2. Feeling (Emotion, not thought)
        3. Need (Universal value/longing)
        4. Request (Specific, doable action)
        The text of the NVC choice must MATCH the "nvcAnalysis" fields exactly.
    
        **GENERATE 5 TYPES OF RESPONSES**:
        1. **Violent/Jackal (暴力/指責)**: Judging, blaming, or attacking the other person.
        2. **Passive/Turtle (被動/退縮)**: Denying own needs, self-blaming, or avoiding conflict.
        3. **Comparison (比較)**: Comparing the person negatively to others.
        4. **Emotional Blackmail (情緒勒索)**: Using guilt, fear, or obligation.
        5. **NVC/Giraffe (非暴力溝通)**: Strictly OFNR format. Compassionate and clear.
    
        User Input Conflict: "${input}"
    
        **JSON OUTPUT FORMAT**:
        Return strict JSON.
        {
          "id": "ai-gen",
          "title": "Short Topic Title (Max 10 chars)",
          "situation": "Context of what happened (approx 100 chars)",
          "trigger": "The specific trigger event/words",
          "choices": [
            { "type": "violent", "text": "...", "feedback": "Analysis of why this is violent", "resultTitle": "Disconnected" },
            { "type": "passive", "text": "...", "feedback": "Analysis of why this is passive", "resultTitle": "Suppressed" },
            { "type": "comparison", "text": "...", "feedback": "Analysis of comparison language", "resultTitle": "Resentment" },
            { "type": "blackmail", "text": "...", "feedback": "Analysis of emotional manipulation", "resultTitle": "Guilt & Fear" },
            { "type": "nvc", "text": "...", "feedback": "Analysis of OFNR components", "resultTitle": "Connection" }
          ],
          "nvcAnalysis": {
            "observation": "...", "feeling": "...", "need": "...", "request": "..."
          }
        }
      `;

      const result = await generateWithFallback(prompt);
      res.json({ ...result.data, _modelUsed: result.modelUsed });
    } catch (e: any) {
      console.error("[API Route Error]:", e);
      res.status(500).json({ error: e.message || "Failed to generate scenario" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
