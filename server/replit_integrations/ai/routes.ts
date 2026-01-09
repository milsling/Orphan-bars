import type { Express, Request, Response } from "express";
import { moderateContent, explainBar, suggestRhymes, chatWithAssistant, type PlatformContext } from "./barAssistant";
import { storage } from "../../storage";

function extractPotentialUsernames(message: string): string[] {
  const usernames: string[] = [];
  const stopWords = new Set([
    "the", "a", "an", "this", "that", "it", "bars", "hip", "hop", "rap", 
    "rhymes", "wordplay", "lyrics", "music", "song", "verse", "flow",
    "punchline", "metaphor", "me", "you", "them", "us", "we", "my", "your"
  ]);
  
  const atMentions = message.match(/@(\w+)/g);
  if (atMentions) {
    usernames.push(...atMentions.map(m => m.slice(1).toLowerCase()));
  }
  
  const whoIsPattern = /who\s+is\s+(\w+)/gi;
  let match;
  while ((match = whoIsPattern.exec(message)) !== null) {
    const word = match[1].toLowerCase();
    if (!stopWords.has(word) && word.length > 2) {
      usernames.push(word);
    }
  }
  
  const tellMeAboutPattern = /tell\s+me\s+about\s+(\w+)/gi;
  while ((match = tellMeAboutPattern.exec(message)) !== null) {
    const word = match[1].toLowerCase();
    if (!stopWords.has(word) && word.length > 2) {
      usernames.push(word);
    }
  }
  
  return Array.from(new Set(usernames));
}

async function buildPlatformContext(usernames: string[]): Promise<PlatformContext> {
  const context: PlatformContext = { users: [], bars: [] };
  
  for (const username of usernames.slice(0, 3)) {
    try {
      const user = await storage.getUserByUsername(username);
      if (user) {
        const stats = await storage.getUserStats(user.id);
        const userBars = await storage.getBarsByUser(user.id);
        const followingCount = await storage.getFollowingCount(user.id);
        
        const publicBars = userBars
          .filter(b => b.permissionStatus !== "private")
          .slice(0, 3)
          .map(b => b.content.substring(0, 150));
        
        context.users!.push({
          username: user.username,
          bio: user.bio || undefined,
          barCount: stats.barsMinted,
          followerCount: stats.followers,
          followingCount: followingCount,
          isOwner: user.isOwner || false,
          isAdmin: user.isAdmin || false,
          topBars: publicBars,
        });
      }
    } catch (e) {
      console.error(`Failed to lookup user ${username}:`, e);
    }
  }
  
  return context;
}

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
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const potentialUsernames = extractPotentialUsernames(message);
      const platformContext = potentialUsernames.length > 0 
        ? await buildPlatformContext(potentialUsernames)
        : undefined;
      
      const response = await chatWithAssistant(message, platformContext);
      res.json({ response });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Chat failed" });
    }
  });
}
