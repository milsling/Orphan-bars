import type { Express, Request, Response } from "express";
import { moderateContent, explainBar, suggestRhymes, chatWithAssistant } from "./barAssistant";

export function registerAIRoutes(app: Express): void {
  app.post("/api/ai/moderate", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const result = await moderateContent(content);
      res.json(result);
    } catch (error) {
      console.error("Moderation API error:", error);
      res.status(500).json({ error: "Moderation failed" });
    }
  });

  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const result = await explainBar(content);
      res.json(result);
    } catch (error) {
      console.error("Explain API error:", error);
      res.status(500).json({ error: "Explanation failed" });
    }
  });

  app.post("/api/ai/suggest", async (req: Request, res: Response) => {
    try {
      const { topic, style } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      const result = await suggestRhymes(topic, style);
      res.json(result);
    } catch (error) {
      console.error("Suggest API error:", error);
      res.status(500).json({ error: "Suggestion failed" });
    }
  });

  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const response = await chatWithAssistant(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Chat failed" });
    }
  });
}
