const mongoose = require("mongoose");

const DeckSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  title: String,
  created_at: { type: Date, default: Date.now },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" }]
});

module.exports = mongoose.model("Deck", DeckSchema);
