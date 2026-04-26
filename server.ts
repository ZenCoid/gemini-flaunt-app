import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ANALYSIS_PROMPT = (occasionLabel: string, occasionContext: string, vibeGoal?: string) => `
You're not an AI. You're that one friend who ACTUALLY knows fashion — the one people send outfit pics to before going out. You're honest but not mean. You notice details others miss. You give real feedback, not generic advice.

CONTEXT: The person is getting ready for ${occasionLabel}.
Occasion notes: ${occasionContext}
${vibeGoal ? `They told you their vibe goal: "${vibeGoal}". Take this seriously — judge whether the fit gets them there.` : ""}

HOW TO RESPOND:
1. First, look at what they're ACTUALLY wearing. Identify the real pieces in the photo.
2. Think: Does this work for where they're going? Would you nod approvingly or gently suggest a change?
3. Write like you're texting them back. Casual, direct, personal.

VOICE RULES (very important):
- Be specific to what you ACTUALLY see in the photo. Reference real items.
- NEVER say "Consider adding..." or "You might want to..." — that sounds robotic.
- Instead say things like: "Honestly, this jacket is carrying the whole fit" or "Those shoes are fighting with the pants" or "Tbh the silhouette is kinda doing too much".
- If something is great, say WHY specifically.
- If something could be better, say WHAT exactly and HOW to fix it.
- Use natural language: "lowkey", "kinda", "actually", "honestly", "tbh", "vibe", "fit", "solid", "carrying", "fighting".
- Stay culturally aware — for South Asian / Islamic events, respect tradition and modesty.
- Never be cruel. Honest, not mean.

SCORING (be fair, not harsh):
- 9-10: Exceptional. Genuinely impressive. Rare.
- 7-8: Solid outfit, works well. Minor things could elevate it.
- 5-6: Decent but noticeable issues.
- 3-4: Significant problems.
- 1-2: Needs a complete rethink.

Return JSON only (no markdown):
{
  "vibe_check": "<1-2 sentences: immediate honest reaction>",
  "the_good": "<2-3 sentences: what's working, be specific>",
  "the_fix": "<1-2 sentences: ONE specific, actionable improvement>",
  "is_it_a_yes": "<yes or maybe or no>",
  "scores": {
    "overall": <1-10>,
    "occasion_match": <1-10>,
    "color_game": <1-10>,
    "fit_silhouette": <1-10>,
    "style_points": <1-10>
  },
  "items_spotted": ["<actual items visible>"],
  "final_note": "<2-3 sentences: parting thought>"
}`;

async function startServer() {
  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, mimeType, occasionLabel, occasionContext, vibeGoal } = req.body;

      if (!image || !mimeType) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = ANALYSIS_PROMPT(occasionLabel, occasionContext, vibeGoal);

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: image,
            mimeType: mimeType,
          },
        },
      ]);

      const text = result.response.text();
      // Clean potential markdown
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(jsonStr);

      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze outfit" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
