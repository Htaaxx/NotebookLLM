const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require("uuid");

const API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const generateFlashcards = async (req, res) => {
  const { text, numQuestions = 10 } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ error: "GOOGLE_API_KEY not set" });
  }

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid text input" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Based on the following text, create a set of ${numQuestions} flashcards.
Text:
"""
${text}
"""
Return a JSON object like:
{
  "title": "...",
  "description": "...",
  "cards": [ { "front": "...", "back": "..." } ]
}`;

    const result = await model.generateContent(prompt);
    const raw = await result.response.text();
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(clean);

    if (!data.cards || !Array.isArray(data.cards)) {
      return res.status(500).json({ error: "Invalid response from AI" });
    }

    const deck = {
      id: uuidv4(),
      title: data.title || "Flashcards",
      description: data.description || "",
      cards: data.cards.map((c) => ({
        id: uuidv4(),
        front: c.front,
        back: c.back,
      })),
    };

    return res.status(200).json(deck);
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: "Failed to generate flashcards" });
  }
};

module.exports = {
  generateFlashcards,
};
