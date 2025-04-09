const express = require("express");
const { generateFlashcards } = require("../controllers/flashcardController");

const router = express.Router();

router.post("/flashcards", generateFlashcards);

module.exports = router;
