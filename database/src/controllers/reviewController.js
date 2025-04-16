const Flashcard = require("../models/flashcard.model");
const { updateFlashcardSRS } = require("../services/srs.service");

const getDueFlashcards = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cards = await Flashcard.find({
      "review.due_date": { $lte: new Date() }
    }).populate({
      path: "deck_id",
      match: { user_id }
    });

    // Lọc ra card thuộc user này
    const filtered = cards.filter(card => card.deck_id !== null);

    res.json({ due_cards: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch due flashcards" });
  }
};

const reviewFlashcard = async (req, res) => {
  const { card_id } = req.params;
  const { ease } = req.body;

  try {
    const card = await Flashcard.findById(card_id);
    if (!card) return res.status(404).json({ error: "Card not found" });

    card.review = updateFlashcardSRS(card, ease);
    await card.save();

    res.json({ message: "Review updated", card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Review failed" });
  }
};

module.exports = { getDueFlashcards, reviewFlashcard };
