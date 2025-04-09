const express = require("express");
const { generateFlashcards } = require("../controllers/flashcardController");
// const { saveFlashcards } = require("../controllers/authController");

const router = express.Router();

router.post("/flashcards", generateFlashcards);
// router.post("/save-flashcards", saveFlashcards);

module.exports = router;
