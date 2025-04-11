const express = require("express");
const router = express.Router();
const { getDueFlashcards, reviewFlashcard } = require("../controllers/reviewController");

router.get("/:user_id", getDueFlashcards); // Lấy flashcard đến hạn của user
router.post("/:card_id", reviewFlashcard); // Gửi đánh giá ôn tập 1 flashcard


module.exports = router

