function updateFlashcardSRS(card, ease) {
    const now = new Date();
    const review = card.review || {
      ease_factor: 2.5,
      interval: 1,
      correct_streak: 0,
      review_count: 0
    };
  
    if (ease < 3) {
      review.interval = 1;
      review.correct_streak = 0;
    } else {
      review.correct_streak += 1;
      review.interval = Math.round(review.interval * review.ease_factor);
      review.ease_factor = Math.max(
        1.3,
        review.ease_factor + (0.1 - (5 - ease) * (0.08 + (5 - ease) * 0.02))
      );
    }
  
    review.last_reviewed = now;
    review.due_date = new Date(now.getTime() + review.interval * 86400000); // ms
    review.review_count += 1;
  
    return review;
  }
  
  module.exports = { updateFlashcardSRS };
  