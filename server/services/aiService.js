// services/aiService.js
// ─────────────────────────────────────────────────────────────────
// AI SERVICE — Wraps the Google Gemini API (via @google/generative-ai)
//
// Switched from Anthropic Claude → Google Gemini 1.5 Flash
// Reason: Gemini 1.5 Flash is FREE via Google AI Studio (no billing needed)
// Get a free API key at: https://aistudio.google.com/app/apikey
//
// Responsibilities:
//   1. sendChatMessage()       — Send a conversation to Gemini, get a reply
//   2. extractSkillsFromReply() — Parse Gemini's reply for structured skill JSON
//   3. draftAgreement()        — Generate a barter agreement summary
// ─────────────────────────────────────────────────────────────────

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI  = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── SYSTEM PROMPT ───────────────────────────────────────────────
// Core instruction set for the SkillSwap AI assistant.
// Gemini uses systemInstruction (passed at model init time per chat session).
const SYSTEM_PROMPT = `You are the SkillSwap AI matchmaker assistant for a skill-bartering marketplace. Your job is to:

1. Read the user's message and extract any skills they are offering or skills they want to learn, in structured form.
   - When you detect skills, respond with a JSON block wrapped in triple backticks like this:
     \`\`\`json
     {
       "extracted": true,
       "skillsOffered": [{ "skillName": "...", "category": "...", "proficiency": "Beginner|Intermediate|Expert", "description": "..." }],
       "skillsWanted":  [{ "skillName": "...", "category": "...", "urgency": "Low|Medium|High", "description": "..." }]
     }
     \`\`\`
   - Then follow up with a friendly conversational confirmation message asking the user to confirm.

2. If the message doesn't clearly state skills offered or wanted, ask ONE short clarifying question to understand better.

3. When given a list of candidate matches from the backend (provided as JSON in the context), explain them conversationally and briefly — why this match makes sense for the user.

4. When helping negotiate a barter agreement, keep the tone friendly and neutral. If you detect hesitation or dissatisfaction in the user's messages (e.g., words like "not sure", "maybe", "uncomfortable", "not happy"), acknowledge it and offer to renegotiate rather than pushing the deal through.

5. When both parties have agreed, summarize the agreed terms clearly and generate a concise barter agreement text.

6. NEVER invent matches or users that were not provided to you by the backend — only discuss real data passed into your context.

7. Keep responses short (2–4 sentences) unless summarizing a full agreement or listing matches.

Always be warm, encouraging, and supportive — skill-swapping is about community and growth.`;

// ── NEGOTIATION CONTEXT ─────────────────────────────────────────
const NEGOTIATION_CONTEXT = (match) => `
You are currently helping negotiate a barter match. Here is the match context:
- Match Type: ${match.matchType}
- Status: ${match.status}
- Exchange: ${JSON.stringify(match.exchangeSummary)}
- Current Agreement: ${match.agreementText || 'None yet'}

Help the participants agree on: number of sessions, format (Online/Offline/Hybrid), and a rough schedule.
When they agree, draft a final agreement text summarizing the terms.
`;

// ── SEND CHAT MESSAGE ───────────────────────────────────────────
// Sends a user message + conversation history to Gemini 1.5 Flash.
// history: array of { role: 'user'|'assistant', content: string }
// matchContext: optional BarterMatch object for negotiation mode
// candidateMatches: optional array of match candidates from matchingEngine
const sendChatMessage = async (userMessage, history = [], matchContext = null, candidateMatches = null) => {
  // Build the full system instruction (base + optional context)
  let systemInstruction = SYSTEM_PROMPT;

  if (matchContext) {
    systemInstruction += '\n\n' + NEGOTIATION_CONTEXT(matchContext);
  }

  // If backend found candidate matches, inject them so Gemini can discuss them
  if (candidateMatches && candidateMatches.length > 0) {
    const matchSummary = candidateMatches.map((m, i) => {
      const names    = m.participants.map((p) => p.name).join(', ');
      const exchange = m.exchangeSummary
        .map((e) => `${e.userId} gives "${e.gives}" and gets "${e.gets}"`)
        .join('; ');
      return `Match ${i + 1} (${m.matchType}): Participants: ${names}. Exchange: ${exchange}. Score: ${m.score}`;
    }).join('\n');

    systemInstruction += `\n\nHere are the candidate matches the system found for this user:\n${matchSummary}`;
  }

  // Gemini uses a chat session with history
  // Convert our history format to Gemini format:
  // Gemini roles are 'user' and 'model' (not 'assistant')
  const geminiHistory = history.map((h) => ({
    role:  h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  // Create a new model instance with the system instruction for this request
  const chatModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  });

  const chat = chatModel.startChat({ history: geminiHistory });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
};

// ── EXTRACT SKILLS FROM REPLY ───────────────────────────────────
// Parses the AI's reply to check if it included a JSON skill extraction block.
// Returns: { hasExtraction, skillsOffered, skillsWanted, cleanReply }
const extractSkillsFromReply = (aiReply) => {
  // Look for a ```json ... ``` block in the reply
  const jsonMatch = aiReply.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    return { hasExtraction: false, skillsOffered: [], skillsWanted: [], cleanReply: aiReply };
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // Remove the JSON block from the reply so only conversational text remains
    const cleanReply = aiReply.replace(/```json[\s\S]*?```/, '').trim();
    return {
      hasExtraction: parsed.extracted === true,
      skillsOffered: parsed.skillsOffered || [],
      skillsWanted:  parsed.skillsWanted  || [],
      cleanReply,
    };
  } catch {
    return { hasExtraction: false, skillsOffered: [], skillsWanted: [], cleanReply: aiReply };
  }
};

// ── DRAFT BARTER AGREEMENT ──────────────────────────────────────
// Asks Gemini to write a short plain-text barter agreement.
const draftAgreement = async (participants, terms) => {
  const prompt = `Draft a short, friendly barter agreement (3-5 sentences) for the following skill exchange:

Participants:
${participants.map((p) => `- ${p.name}: gives "${p.gives}", receives "${p.gets}"`).join('\n')}

Agreed terms:
- Number of sessions: ${terms.sessions || 'to be decided'}
- Format: ${terms.format || 'Online'}
- Schedule: ${terms.schedule || 'flexible'}

The agreement should be casual but clear, summarizing what each person will do for the other. End with a note that both parties have agreed to these terms.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { sendChatMessage, extractSkillsFromReply, draftAgreement };
