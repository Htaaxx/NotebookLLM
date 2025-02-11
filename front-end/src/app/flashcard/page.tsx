"use client"

import { useState } from "react"
import { NavBar } from "@/app/components/nav-bar"
import { Card, CardContent } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
}

export default function FlashcardPage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const addCard = () => {
    const newCard = {
      id: Math.random().toString(36).substr(2, 9),
      front: "",
      back: "",
    }
    setCards([...cards, newCard])
  }

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Flashcard Display */}
          <div className="flex justify-center mb-8">
            {cards.length > 0 ? (
              <Card className="w-full max-w-lg cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <CardContent className="p-12 min-h-[300px] flex items-center justify-center text-center">
                  <div className="text-xl">{isFlipped ? cards[currentCard].back : cards[currentCard].front}</div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  No flashcards yet. Create one below!
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation Controls */}
          {cards.length > 0 && (
            <div className="flex justify-center items-center gap-4 mb-8">
              <Button variant="outline" size="icon" onClick={prevCard} disabled={currentCard === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                Card {currentCard + 1} of {cards.length}
              </span>
              <Button variant="outline" size="icon" onClick={nextCard} disabled={currentCard === cards.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Add New Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Create New Flashcard</h2>
                <div className="space-y-4">
                  <Input placeholder="Front of card" className="mb-2" />
                  <Input placeholder="Back of card" className="mb-4" />
                  <Button onClick={addCard}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}