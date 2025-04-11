const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require("uuid");

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const generateFlashcards = async (req, res) => {
  const { user_id, deck_id, nodes, numQuestions } = req.body;

  if (!API_KEY) return res.status(500).json({ error: "GOOGLE_API_KEY not set" });
  if (!user_id || !deck_id || !Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const nodeText = nodes.map((n, i) => `Section ${i + 1} - ${n.header}:\n${n.details}`).join("\n\n");

    const prompt = `
You are a teaching assistant. Based only on the provided sections below, generate ${numQuestions} deep-thinking flashcards. Each flashcard should test understanding of the content, and all questions and answers must be based only on the sections below.

Sections:
"""
${nodeText}
"""

Output JSON format only:
[
  { "question": "What is ...?", "answer": "..." },
  ...
]
`;

    const result = await model.generateContent(prompt);
    const raw = await result.response.text();
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const cards = JSON.parse(clean);

    if (!Array.isArray(cards)) {
      return res.status(500).json({ error: "Invalid flashcard format from AI" });
    }

    const formatted = {
      user_id,
      deck_id,
      cards: cards.map((card) => ({
        id: uuidv4(),
        question: card.question,
        answer: card.answer,
      })),
    };

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: "Failed to generate flashcards" });
  }
};

module.exports = {
  generateFlashcards,
};
