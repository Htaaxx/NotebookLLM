const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  last_reviewed: { type: Date, default: null },
  interval: { type: Number, default: 1 },
  ease_factor: { type: Number, default: 2.5 },
  due_date: { type: Date },
  review_count: { type: Number, default: 0 },
  correct_streak: { type: Number, default: 0 }
});

const FlashcardSchema = new mongoose.Schema({
  deck_id: { type: mongoose.Schema.Types.ObjectId, ref: "Deck", required: true },
  question: String,
  answer: String,
  review: { type: ReviewSchema, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("Flashcard", FlashcardSchema);
