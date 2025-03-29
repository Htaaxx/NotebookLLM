"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Clock,
  Star,
  StarOff,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Flashcard {
  id: string
  front: string
  back: string
  starred: boolean
  lastReviewed: string
  status: "new" | "learning" | "review" | "mastered"
}

interface Deck {
  id: string
  name: string
  description: string
  cardCount: number
  lastStudied: string
}

export default function FlashcardPage() {
  const [activeTab, setActiveTab] = useState("decks")
  const [activeDeck, setActiveDeck] = useState<string | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [newFront, setNewFront] = useState("")
  const [newBack, setNewBack] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()

  // Sample decks
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "deck1",
      name: "Biology 101",
      description: "Basic biology concepts and terminology",
      cardCount: 42,
      lastStudied: "2 days ago",
    },
    {
      id: "deck2",
      name: "Spanish Vocabulary",
      description: "Common Spanish words and phrases",
      cardCount: 78,
      lastStudied: "Yesterday",
    },
    {
      id: "deck3",
      name: "Programming Concepts",
      description: "Key programming terms and definitions",
      cardCount: 35,
      lastStudied: "1 week ago",
    },
  ])

  // Load cards for the selected deck
  useEffect(() => {
    if (activeDeck) {
      // In a real app, you would fetch cards for the selected deck
      // For now, we'll use sample data
      const sampleCards: Flashcard[] = [
        {
          id: "card1",
          front: "What is photosynthesis?",
          back: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
          starred: true,
          lastReviewed: "2 days ago",
          status: "review",
        },
        {
          id: "card2",
          front: "What is cellular respiration?",
          back: "The process by which cells break down glucose and other molecules to generate energy in the form of ATP.",
          starred: false,
          lastReviewed: "1 week ago",
          status: "learning",
        },
        {
          id: "card3",
          front: "What is mitosis?",
          back: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
          starred: false,
          lastReviewed: "3 days ago",
          status: "mastered",
        },
      ]
      setCards(sampleCards)
      setCurrentCard(0)
      setIsFlipped(false)
    }
  }, [activeDeck])

  const filteredDecks = searchQuery
    ? decks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : decks

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim()) return

    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: newFront,
      back: newBack,
      starred: false,
      lastReviewed: "Never",
      status: "new",
    }
    setCards([...cards, newCard])
    setNewFront("")
    setNewBack("")
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

  const toggleStar = (cardId: string) => {
    setCards(cards.map((card) => (card.id === cardId ? { ...card, starred: !card.starred } : card)))
  }

  const updateCardStatus = (cardId: string, status: Flashcard["status"]) => {
    setCards(cards.map((card) => (card.id === cardId ? { ...card, status, lastReviewed: "Just now" } : card)))

    // Move to next card after marking
    setTimeout(() => {
      if (currentCard < cards.length - 1) {
        nextCard()
      } else {
        // If it's the last card, show completion message or reset
        alert("You've completed all cards in this deck!")
        setCurrentCard(0)
        setIsFlipped(false)
      }
    }, 500)
  }

  const deleteCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))
    if (currentCard >= cards.length - 1) {
      setCurrentCard(Math.max(0, cards.length - 2))
    }
  }

  const getStatusColor = (status: Flashcard["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "learning":
        return "bg-yellow-100 text-yellow-800"
      case "review":
        return "bg-purple-100 text-purple-800"
      case "mastered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <main className="container mx-auto p-6 flex-grow">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Flashcards</h1>
              <TabsList>
                <TabsTrigger value="decks">My Decks</TabsTrigger>
                <TabsTrigger value="study">Study</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
              </TabsList>
            </div>

            {/* Decks Tab */}
            <TabsContent value="decks" className="mt-0">
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search decks..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDecks.map((deck) => (
                  <Card
                    key={deck.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveDeck(deck.id)
                      setActiveTab("study")
                    }}
                  >
                    <div className="h-2 bg-green-600"></div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{deck.name}</h3>
                      <p className="text-gray-500 mb-4 line-clamp-2">{deck.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {deck.cardCount} cards
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {deck.lastStudied}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Deck Card */}
                <Card className="border-2 border-dashed flex items-center justify-center h-[180px] cursor-pointer hover:border-green-600 transition-colors">
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">Create New Deck</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Study Tab */}
            <TabsContent value="study" className="mt-0">
              {activeDeck ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {decks.find((d) => d.id === activeDeck)?.name || "Study Deck"}
                    </h2>
                    <Button variant="outline" onClick={() => setActiveTab("decks")}>
                      Back to Decks
                    </Button>
                  </div>

                  {cards.length > 0 ? (
                    <div className="space-y-6">
                      {/* Card Navigation */}
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={prevCard} disabled={currentCard === 0}>
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-500">
                          Card {currentCard + 1} of {cards.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextCard}
                          disabled={currentCard === cards.length - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>

                      {/* Flashcard */}
                      <div className="relative perspective-1000">
                        <div
                          className={`relative w-full transition-transform duration-500 transform-style-3d ${
                            isFlipped ? "rotate-y-180" : ""
                          }`}
                          style={{
                            transformStyle: "preserve-3d",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                          }}
                        >
                          {/* Front of Card */}
                          <Card
                            className={`p-8 min-h-[300px] flex flex-col ${
                              isFlipped ? "absolute inset-0 backface-hidden" : "relative"
                            }`}
                            style={{
                              backfaceVisibility: "hidden",
                            }}
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <div className="absolute top-4 right-4 flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleStar(cards[currentCard].id)
                                }}
                              >
                                {cards[currentCard].starred ? (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <StarOff className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteCard(cards[currentCard].id)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                              <h3 className="text-xl font-medium text-center">{cards[currentCard].front}</h3>
                            </div>

                            <div className="text-center mt-4 text-gray-500">
                              <span className="flex items-center justify-center gap-1">
                                <RotateCcw className="h-4 w-4" />
                                Click to flip
                              </span>
                            </div>
                          </Card>

                          {/* Back of Card */}
                          <Card
                            className={`p-8 min-h-[300px] flex flex-col ${
                              isFlipped ? "relative" : "absolute inset-0 backface-hidden"
                            }`}
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-lg text-center">{cards[currentCard].back}</p>
                            </div>

                            <div className="mt-6 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateCardStatus(cards[currentCard].id, "learning")
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Still Learning
                              </Button>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateCardStatus(cards[currentCard].id, "mastered")
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Got It
                              </Button>
                            </div>

                            <div className="text-center mt-4 text-gray-500">
                              <span className="flex items-center justify-center gap-1">
                                <RotateCcw className="h-4 w-4" />
                                Click to flip
                              </span>
                            </div>
                          </Card>
                        </div>
                      </div>

                      {/* Card Status */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cards[currentCard].status)}`}
                          >
                            {cards[currentCard].status.charAt(0).toUpperCase() + cards[currentCard].status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Last reviewed: {cards[currentCard].lastReviewed}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => {
                            setActiveTab("create")
                            setNewFront(cards[currentCard].front)
                            setNewBack(cards[currentCard].back)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Card
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">{t("noFlashcards")}</p>
                      <Button onClick={() => setActiveTab("create")} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Card
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Please select a deck to study</p>
                  <Button onClick={() => setActiveTab("decks")} className="bg-green-600 hover:bg-green-700">
                    View All Decks
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="mt-0">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">
                  {newFront || newBack ? "Edit Card" : "Create New Flashcard"}
                </h2>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-medium">Front Side</label>
                        <Input
                          placeholder="Enter question or term"
                          value={newFront}
                          onChange={(e) => setNewFront(e.target.value)}
                          className="text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-medium">Back Side</label>
                        <Input
                          placeholder="Enter answer or definition"
                          value={newBack}
                          onChange={(e) => setNewBack(e.target.value)}
                          className="text-lg"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewFront("")
                            setNewBack("")
                            setActiveTab("study")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addCard}
                          disabled={!newFront.trim() || !newBack.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {newFront || newBack ? "Update Card" : "Add Card"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

