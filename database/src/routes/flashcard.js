const express = require("express");
const router = express.Router();
const { generateFlashcards } = require("../controllers/flashcardController");

router.post("/generate", generateFlashcards);

module.exports = router
