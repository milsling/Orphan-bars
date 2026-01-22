import { openai } from "../image/client";

export interface ModerationResult {
  approved: boolean;
  flagged: boolean;
  reasons: string[];
  plagiarismRisk: "none" | "low" | "medium" | "high";
  plagiarismDetails?: string;
}

export interface BarExplanation {
  explanation: string;
  wordplay: string[];
  references: string[];
  difficulty: "simple" | "moderate" | "complex";
}

export interface BarSuggestion {
  suggestions: string[];
  rhymes: string[];
  tips: string;
}

// Hardcoded blocklist - these words should NEVER appear regardless of AI decision
const BLOCKED_SLURS = [
  "nigger", "niggers", "nigga", "niggas", "nigg3r", "n1gger", "n1gga",
  "kike", "kikes", "k1ke",
  "faggot", "faggots", "f4ggot", "fag", "fags",
  "spic", "spics", "sp1c",
  "wetback", "wetbacks",
  "chink", "chinks", "ch1nk",
  "gook", "gooks",
  "towelhead", "towelheads",
  "raghead", "ragheads",
  "tranny", "trannies",
  "retard", "retards", "ret4rd",
];

// Check for blocked slurs in content
function containsBlockedSlurs(content: string): { blocked: boolean; matches: string[] } {
  const normalizedContent = content.toLowerCase().replace(/[^\w\s]/g, '');
  const matches: string[] = [];
  
  for (const slur of BLOCKED_SLURS) {
    const regex = new RegExp(`\\b${slur}\\b`, 'i');
    if (regex.test(normalizedContent) || normalizedContent.includes(slur)) {
      matches.push(slur);
    }
  }
  
  return { blocked: matches.length > 0, matches };
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  // FIRST: Check hardcoded blocklist - instant block for worst slurs
  const slurCheck = containsBlockedSlurs(content);
  if (slurCheck.blocked) {
    console.log("[MODERATION] Blocked by slur filter:", slurCheck.matches);
    return {
      approved: false,
      flagged: true,
      reasons: ["Content contains prohibited language that violates our community guidelines."],
      plagiarismRisk: "none",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a strict content moderator for Orphan Bars, a platform for sharing rap lyrics and punchlines. 

MUST REJECT content containing:
1. Racial slurs or hate speech targeting any group (race, religion, sexuality, gender, disability)
2. Nazi references, white supremacist content, or calls for violence against groups
3. Explicit threats of violence or harm
4. Pedophilia references or child exploitation
5. Direct harassment or doxxing

Hip-hop culture allows: wordplay, metaphors, braggadocio, battle rap style disses, slang, mild profanity, and creative expression.
Battle rap disses about skills/talent are fine. Edgy content is fine. But hate speech is NOT artistic expression.

Be STRICT about hate speech. When in doubt, reject.

Respond in JSON format:
{
  "approved": boolean,
  "flagged": boolean,
  "reasons": string[] (only if not approved or flagged),
  "plagiarismRisk": "none" | "low" | "medium" | "high",
  "plagiarismDetails": string (only if plagiarism detected - name the song/artist if known)
}`
        },
        {
          role: "user",
          content: `Moderate this bar:\n\n"${content}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    console.log("[MODERATION] AI result:", result);
    return {
      approved: result.approved === true,
      flagged: result.flagged === true,
      reasons: result.reasons || [],
      plagiarismRisk: result.plagiarismRisk || "none",
      plagiarismDetails: result.plagiarismDetails,
    };
  } catch (error) {
    // CRITICAL: If AI moderation fails, DO NOT approve content - require manual review
    console.error("[MODERATION] AI error - defaulting to REJECT:", error);
    return {
      approved: false,
      flagged: true,
      reasons: ["Content could not be verified by our moderation system. Please try again or submit for manual review."],
      plagiarismRisk: "none",
    };
  }
}

export async function explainBar(content: string): Promise<BarExplanation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a hip-hop expert who explains rap lyrics and punchlines. Break down the bar's meaning, wordplay, double entendres, and cultural references.

Respond in JSON format:
{
  "explanation": "A clear breakdown of what the bar means",
  "wordplay": ["list of specific wordplay, puns, or double meanings"],
  "references": ["list of cultural, musical, or historical references"],
  "difficulty": "simple" | "moderate" | "complex"
}`
        },
        {
          role: "user",
          content: `Explain this bar:\n\n"${content}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      explanation: result.explanation || "Could not analyze this bar.",
      wordplay: result.wordplay || [],
      references: result.references || [],
      difficulty: result.difficulty || "moderate",
    };
  } catch (error) {
    console.error("Explain error:", error);
    return {
      explanation: "Sorry, I couldn't analyze this bar right now.",
      wordplay: [],
      references: [],
      difficulty: "moderate",
    };
  }
}

export async function suggestRhymes(topic: string, style?: string): Promise<BarSuggestion> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative rap writing assistant. Help users craft clever bars, punchlines, and wordplay.
${style ? `Style hint: ${style}` : ""}

Respond in JSON format:
{
  "suggestions": ["3-5 example bars or punchlines based on their input"],
  "rhymes": ["useful rhyming words they could use"],
  "tips": "A brief writing tip relevant to their request"
}`
        },
        {
          role: "user",
          content: `Help me write a bar about: ${topic}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      suggestions: result.suggestions || [],
      rhymes: result.rhymes || [],
      tips: result.tips || "",
    };
  } catch (error) {
    console.error("Suggest error:", error);
    return {
      suggestions: [],
      rhymes: [],
      tips: "Sorry, I couldn't generate suggestions right now.",
    };
  }
}

export interface StyleAnalysis {
  primaryStyle: string;
  secondaryStyles: string[];
  strengths: string[];
  characteristics: string[];
  comparison: string;
  summary: string;
}

export async function analyzeUserStyle(bars: string[], username: string): Promise<StyleAnalysis> {
  if (bars.length === 0) {
    return {
      primaryStyle: "Unknown",
      secondaryStyles: [],
      strengths: [],
      characteristics: ["No bars to analyze yet"],
      comparison: "",
      summary: `${username} hasn't posted any bars yet. Check back after they drop some heat!`,
    };
  }

  try {
    const barsText = bars.slice(0, 20).map((bar, i) => `${i + 1}. "${bar}"`).join("\n");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert hip-hop analyst who studies lyrical styles. Analyze the user's bars to determine their unique writing style.

Respond in JSON format:
{
  "primaryStyle": "One word or short phrase describing their main style (e.g., 'Wordsmith', 'Storyteller', 'Battle Rapper', 'Conscious', 'Punchline King', 'Metaphor Master', 'Comedian', 'Street Poet')",
  "secondaryStyles": ["2-3 additional style elements"],
  "strengths": ["3-4 specific lyrical strengths you noticed"],
  "characteristics": ["4-5 distinctive characteristics of their writing"],
  "comparison": "Compare their style to 1-2 well-known rappers (e.g., 'Reminiscent of Lil Wayne's wordplay with Kendrick's storytelling')",
  "summary": "A 2-3 sentence engaging summary of their overall style written directly to them"
}`
        },
        {
          role: "user",
          content: `Analyze the lyrical style of @${username} based on these bars:\n\n${barsText}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      primaryStyle: result.primaryStyle || "Unique",
      secondaryStyles: result.secondaryStyles || [],
      strengths: result.strengths || [],
      characteristics: result.characteristics || [],
      comparison: result.comparison || "",
      summary: result.summary || "Style analysis unavailable.",
    };
  } catch (error) {
    console.error("Style analysis error:", error);
    return {
      primaryStyle: "Unknown",
      secondaryStyles: [],
      strengths: [],
      characteristics: [],
      comparison: "",
      summary: "Sorry, I couldn't analyze this user's style right now.",
    };
  }
}

export interface PlatformContext {
  users?: Array<{
    username: string;
    bio?: string;
    barCount: number;
    followerCount: number;
    followingCount: number;
    isOwner?: boolean;
    isAdmin?: boolean;
    topBars?: string[];
  }>;
  bars?: Array<{
    content: string;
    author: string;
    category?: string;
    likes: number;
  }>;
}

export async function chatWithAssistant(message: string, platformContext?: PlatformContext): Promise<string> {
  try {
    let contextBlock = "";
    
    if (platformContext?.users?.length) {
      contextBlock += "\n\n=== REAL USER DATA FROM ORPHAN BARS ===\n";
      contextBlock += "The following is VERIFIED information from the platform database. Use ONLY this data when discussing these users:\n\n";
      for (const user of platformContext.users) {
        contextBlock += `@${user.username}:\n`;
        contextBlock += `- Bio: ${user.bio || "(no bio set)"}\n`;
        contextBlock += `- Bars posted: ${user.barCount}\n`;
        contextBlock += `- Followers: ${user.followerCount}\n`;
        contextBlock += `- Following: ${user.followingCount}\n`;
        if (user.isOwner) contextBlock += `- Role: Site Owner\n`;
        else if (user.isAdmin) contextBlock += `- Role: Admin\n`;
        if (user.topBars?.length) {
          contextBlock += `- Recent bars:\n`;
          user.topBars.forEach(bar => {
            contextBlock += `  "${bar}"\n`;
          });
        }
        contextBlock += "\n";
      }
      contextBlock += "=== END REAL DATA ===\n";
    }

    if (platformContext?.bars?.length) {
      contextBlock += "\n=== REAL BARS FROM THE PLATFORM ===\n";
      for (const bar of platformContext.bars) {
        contextBlock += `"${bar.content}" - @${bar.author} (${bar.likes} likes)\n`;
      }
      contextBlock += "=== END BARS ===\n";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Orphie, the AI assistant for Orphan Bars, a platform where lyricists share bars, punchlines, and wordplay. You help users:
- Understand and explain bars/lyrics
- Write better punchlines and wordplay  
- Find rhymes and improve flow
- Learn about hip-hop culture and references
- Answer questions about users on the platform

CRITICAL RULES:
1. When asked about specific users on Orphan Bars, ONLY use the verified data provided in the context below. 
2. If a user is NOT in the provided context, say "I don't have information about that user" - DO NOT make up information.
3. Never invent follower counts, bar counts, or biographical details.
4. If someone asks "who is X" and X is not in the context, acknowledge you don't have their profile data.
5. You can still discuss hip-hop culture, techniques, and general topics freely.

Be conversational, helpful, and honest. Keep responses concise.${contextBlock}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 600,
    });

    return response.choices[0]?.message?.content || "Sorry, I couldn't respond right now.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble responding right now. Try again in a moment.";
  }
}
