"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { accountTypeAPI } from "@/lib/api"
import { ACCOUNT_LIMITS, shouldResetDailyCounts } from "@/lib/account-limits"
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
  FileText,
  Upload,
  X,
  AlertCircle,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"
import { documentAPI } from "@/lib/api"
import type { FileItem } from "@/types/app-types"

// Update the Deck interface to include the new fields
interface Deck {
  id: string
  name: string
  description: string
  cardCount: number
  lastStudied: string
  documentId?: string
  created_at: string // Added for creation date
}

// Update the Flashcard interface to include review information
interface Flashcard {
  id: string
  front: string
  back: string
  starred: boolean
  lastReviewed: string
  status: "new" | "learning" | "review" | "mastered"
  // Added review fields
  review: {
    due_date: string
    review_count: number
    correct_streak: number
    interval: number
    ease_factor: number
  }
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
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckDescription, setNewDeckDescription] = useState("")
  const [userFiles, setUserFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { t } = useLanguage()
  const [accountType, setAccountType] = useState<string>("FREE")
  const [flashcardCount, setFlashcardCount] = useState<number>(0)
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false)

  // Add this after the existing useState declarations
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([])
  const [currentReviewCard, setCurrentReviewCard] = useState(0)
  const [filterType, setFilterType] = useState<"all" | "due" | "new" | "completed">("all")

  // Sample decks
  const [decks, setDecks] = useState<Deck[]>([])

  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_id")
      if (storedUserId) {
        setUserId(storedUserId)
      }
    }
  }, [])

  // Check account type and usage on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return

      try {
        // Check if we need to reset daily counts
        if (shouldResetDailyCounts()) {
          // Reset would happen server-side
          setFlashcardCount(0)
        }

        // Fetch account type and current count
        const accountTypeData = await accountTypeAPI.getAccountTypes(userId)
        setAccountType(accountTypeData.accountType || "FREE")

        const countData = await accountTypeAPI.getCountFlashcard(userId)
        setFlashcardCount(countData.countFlashcard || 0)

        // Check if limit exceeded
        checkFlashcardLimit(accountTypeData.accountType || "FREE", countData.countFlashcard || 0)
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo()
  }, [userId])

  // Function to check if user has exceeded their daily limit
  const checkFlashcardLimit = (type: string, count: number) => {
    const limit =
      type === "PRO"
        ? ACCOUNT_LIMITS.PRO.FLASHCARDS
        : type === "STANDARD"
          ? ACCOUNT_LIMITS.STANDARD.FLASHCARDS
          : ACCOUNT_LIMITS.FREE.FLASHCARDS

    setLimitExceeded(count >= limit)
  }

  // Fetch user files when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserFiles(userId)
    }
  }, [userId])

  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Generate fake decks when component mounts
    const fakeDeckData: Deck[] = [
      {
        id: "deck1",
        name: "English Vocabulary",
        description: "Common English words and phrases",
        cardCount: 25,
        lastStudied: "Yesterday",
        documentId: "doc1",
        created_at: "2023-10-15",
      },
      {
        id: "deck2",
        name: "JavaScript Basics",
        description: "Fundamental JavaScript concepts",
        cardCount: 30,
        lastStudied: "3 days ago",
        documentId: "doc2",
        created_at: "2023-11-20",
      },
      {
        id: "deck3",
        name: "React Hooks",
        description: "All about React hooks and their usage",
        cardCount: 15,
        lastStudied: "1 week ago",
        documentId: "doc3",
        created_at: "2024-01-05",
      },
      {
        id: "deck4",
        name: "CSS Flexbox",
        description: "Flexbox layout concepts and properties",
        cardCount: 20,
        lastStudied: "2 days ago",
        documentId: "doc4",
        created_at: "2024-02-10",
      },
      {
        id: "deck5",
        name: "Data Structures",
        description: "Common data structures and algorithms",
        cardCount: 40,
        lastStudied: "Never",
        documentId: "doc5",
        created_at: "2024-03-15",
      },
    ]

    setDecks(fakeDeckData)
  }, [])

  // Fetch user files from API
  const fetchUserFiles = async (userId: string) => {
    try {
      const documents = await documentAPI.getDocuments(userId)
      if (documents && documents.length > 0) {
        const files: FileItem[] = documents.map((doc: any) => ({
          id: doc.document_id,
          name: doc.document_name || "Untitled Document",
          selected: false,
          type: getFileTypeFromName(doc.document_name),
          url: `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${
            doc.document_id
          }${getFileExtension(doc.document_name)}`,
          size: 0,
          cloudinaryId: doc.document_id,
          FilePath: doc.document_path || "root",
        }))
        setUserFiles(files)
      }
    } catch (error) {
      console.error("Error fetching user files:", error)
    }
  }

  // Helper function to determine file type based on filename
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return "document"
    const extension = filename.split(".").pop()?.toLowerCase()
    if (!extension) return "document"
    if (["pdf"].includes(extension)) return "application/pdf"
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension)) return "image/" + extension
    if (["mp4", "webm", "mov"].includes(extension)) return "video/" + extension
    if (["md", "markdown"].includes(extension)) return "text/markdown"
    return "document"
  }

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    if (!filename) return ""
    const extensionMatch = filename.match(/\.[^.]+$/)
    return extensionMatch ? extensionMatch[0].toLowerCase() : ""
  }

  // Load cards for the selected deck
  useEffect(() => {
    if (activeDeck) {
      const selectedDeck = decks.find((deck) => deck.id === activeDeck)
      if (selectedDeck?.documentId) {
        fetchFlashcardsForDocument(selectedDeck.documentId)
      } else {
        // If no document ID, just set empty cards array
        setCards([])
      }
      setCurrentCard(0)
      setIsFlipped(false)
    }
  }, [activeDeck, decks])

  // Add this after your other useEffect hooks
  useEffect(() => {
    // Check if we were directed here from mind map with a specific deck
    const activeFlashcardDeck = localStorage.getItem("active_flashcard_deck")

    if (activeFlashcardDeck && decks.length === 0) {
      // Get the last generated deck data
      const lastGeneratedDeck = localStorage.getItem("last_generated_deck")

      if (lastGeneratedDeck) {
        const deckData = JSON.parse(lastGeneratedDeck)

        // Add the deck to our list
        const newDeck: Deck = {
          id: deckData.id,
          name: deckData.name,
          description: deckData.description || "Generated from mind map",
          cardCount: deckData.cards.length,
          lastStudied: "Never",
          documentId: deckData.id,
          created_at: new Date().toISOString(),
        }

        setDecks([newDeck])
        setActiveDeck(newDeck.id)
        setActiveTab("study")

        // Clear the active deck selection to avoid reloading on future visits
        localStorage.removeItem("active_flashcard_deck")
      }
    }
  }, [decks])

  // Add this function after fetchFlashcardsForDocument
  const fetchFlashcardsForDocument = async (documentId: string) => {
    setIsLoading(true)
    try {
      // Generate fake flashcards with review data
      const today = new Date().toISOString().split("T")[0]
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split("T")[0]

      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = nextWeek.toISOString().split("T")[0]

      const fakeFlashcards: Flashcard[] = [
        {
          id: "card1",
          front: "What is React?",
          back: "A JavaScript library for building user interfaces",
          starred: true,
          lastReviewed: "2024-04-10",
          status: "learning",
          review: {
            due_date: today,
            review_count: 3,
            correct_streak: 2,
            interval: 1,
            ease_factor: 2.5,
          },
        },
        {
          id: "card2",
          front: "What is JSX?",
          back: "A syntax extension for JavaScript that looks similar to HTML",
          starred: false,
          lastReviewed: "2024-04-12",
          status: "review",
          review: {
            due_date: today,
            review_count: 5,
            correct_streak: 0,
            interval: 1,
            ease_factor: 1.8,
          },
        },
        {
          id: "card3",
          front: "What is a React component?",
          back: "An independent, reusable piece of code that returns React elements",
          starred: false,
          lastReviewed: "Never",
          status: "new",
          review: {
            due_date: today,
            review_count: 0,
            correct_streak: 0,
            interval: 0,
            ease_factor: 2.5,
          },
        },
        {
          id: "card4",
          front: "What is the virtual DOM?",
          back: "A lightweight copy of the real DOM that React uses for performance optimization",
          starred: true,
          lastReviewed: "2024-04-15",
          status: "mastered",
          review: {
            due_date: nextWeekStr,
            review_count: 8,
            correct_streak: 5,
            interval: 7,
            ease_factor: 2.8,
          },
        },
        {
          id: "card5",
          front: "What are React hooks?",
          back: "Functions that let you use state and other React features without writing a class",
          starred: false,
          lastReviewed: "2024-04-14",
          status: "learning",
          review: {
            due_date: tomorrowStr,
            review_count: 2,
            correct_streak: 1,
            interval: 1,
            ease_factor: 2.2,
          },
        },
        {
          id: "card6",
          front: "What is useState?",
          back: "A hook that lets you add React state to function components",
          starred: false,
          lastReviewed: "Never",
          status: "new",
          review: {
            due_date: today,
            review_count: 0,
            correct_streak: 0,
            interval: 0,
            ease_factor: 2.5,
          },
        },
        {
          id: "card7",
          front: "What is useEffect?",
          back: "A hook that lets you perform side effects in function components",
          starred: false,
          lastReviewed: "2024-04-13",
          status: "learning",
          review: {
            due_date: today,
            review_count: 4,
            correct_streak: 2,
            interval: 1,
            ease_factor: 2.3,
          },
        },
      ]

      setCards(fakeFlashcards)

      // Set cards due for review today
      const dueCards = fakeFlashcards.filter((card) => card.review.due_date === today)
      setReviewCards(dueCards)
    } catch (error) {
      console.error("Error fetching flashcards:", error)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDecks = searchQuery
    ? decks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : decks

  const createDeck = () => {
    if (!newDeckName.trim()) return

    setIsLoading(true)

    try {
      // Create a new deck with reference to the selected document
      const newDeck: Deck = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDeckName,
        description: newDeckDescription || `Flashcards deck`,
        cardCount: 0, // Will be updated when cards are fetched
        lastStudied: "Never",
        documentId: selectedFile?.id,
        created_at: new Date().toISOString(),
      }

      setDecks([...decks, newDeck])

      // Reset form
      setNewDeckName("")
      setNewDeckDescription("")
      setSelectedFile(null)
      setIsCreateDeckDialogOpen(false)

      // Fetch flashcards for the new deck if document is selected
      if (selectedFile?.id) {
        console.log(`Created new deck with document ID: ${selectedFile.id}`)
      }
    } catch (error) {
      console.error("Error creating deck:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !activeDeck) return

    // Check if user has exceeded their limit
    if (limitExceeded && accountType !== "PRO") {
      alert(`You've reached your daily limit of ${
        accountType === "STANDARD" ? ACCOUNT_LIMITS.STANDARD.FLASHCARDS : ACCOUNT_LIMITS.FREE.FLASHCARDS
      } 
            flashcards for ${accountType} accounts. Upgrade to create more.`)
      return
    }

    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: newFront,
      back: newBack,
      starred: false,
      lastReviewed: "Never",
      status: "new",
      review: {
        due_date: new Date().toISOString().split("T")[0],
        review_count: 0,
        correct_streak: 0,
        interval: 0,
        ease_factor: 2.5,
      },
    }

    setCards([...cards, newCard])

    // Update card count in the deck
    setDecks(decks.map((deck) => (deck.id === activeDeck ? { ...deck, cardCount: deck.cardCount + 1 } : deck)))

    // Update the flashcard count
    if (userId) {
      const newCount = flashcardCount + 1
      accountTypeAPI
        .updateCountFlashcard(userId)
        .then(() => {
          setFlashcardCount(newCount)
          checkFlashcardLimit(accountType, newCount)
        })
        .catch((error) => console.error("Error updating flashcard count:", error))
    }

    setNewFront("")
    setNewBack("")
  }

  // Add this function after addCard
  const startReviewSession = () => {
    const today = new Date().toISOString().split("T")[0]
    const dueCards = cards.filter((card) => card.review.due_date === today)

    if (dueCards.length === 0) {
      alert("No cards due for review today!")
      return
    }

    setReviewCards(dueCards)
    setCurrentReviewCard(0)
    setShowAnswer(false)
    setIsReviewMode(true)
    setActiveTab("study")
  }

  // Add this function after startReviewSession
  const submitReviewRating = (cardId: string, rating: number) => {
    // Calculate new review parameters based on the SM-2 algorithm
    const card = reviewCards.find((c) => c.id === cardId)
    if (!card) return

    let newInterval = 1
    let newEaseFactor = card.review.ease_factor
    let newCorrectStreak = card.review.correct_streak

    // Adjust ease factor based on rating (0-5 scale)
    const easeDelta = 0.1 * (rating - 3)
    newEaseFactor = Math.max(1.3, card.review.ease_factor + easeDelta)

    // Calculate new interval
    if (rating < 3) {
      // If rating is poor, reset interval
      newInterval = 1
      newCorrectStreak = 0
    } else {
      // If rating is good, increase interval
      newCorrectStreak += 1

      if (card.review.interval === 0) {
        newInterval = 1
      } else if (card.review.interval === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(card.review.interval * newEaseFactor)
      }
    }

    // Calculate new due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + newInterval)
    const newDueDate = dueDate.toISOString().split("T")[0]

    // Update card in state
    const updatedCards = cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            lastReviewed: new Date().toISOString().split("T")[0],
            status: rating < 3 ? "learning" : rating >= 4 ? "mastered" : "review",
            review: {
              ...c.review,
              due_date: newDueDate,
              review_count: c.review.review_count + 1,
              correct_streak: newCorrectStreak,
              interval: newInterval,
              ease_factor: newEaseFactor,
            },
          }
        : c,
    )

    setCards(
      updatedCards.map((card) => ({
        ...card,
        status: card.status as "learning" | "mastered" | "review" | "new",
      }))
    )

    // Move to next review card
    if (currentReviewCard < reviewCards.length - 1) {
      setCurrentReviewCard(currentReviewCard + 1)
      setShowAnswer(false)
    } else {
      alert("Review session completed!")
      setIsReviewMode(false)
    }
  }

  // Add this function after submitReviewRating
  const filterCards = (type: "all" | "due" | "new" | "completed") => {
    setFilterType(type)

    if (!activeDeck) return

    const today = new Date().toISOString().split("T")[0]

    let filteredCards: Flashcard[] = []

    switch (type) {
      case "due":
        filteredCards = cards.filter((card) => card.review.due_date === today)
        break
      case "new":
        filteredCards = cards.filter((card) => card.status === "new")
        break
      case "completed":
        filteredCards = cards.filter((card) => card.status === "mastered")
        break
      case "all":
      default:
        filteredCards = cards
        break
    }

    // Just update the display, don't change the actual cards array
    if (filteredCards.length > 0) {
      setCurrentCard(0)
      setIsFlipped(false)
    }

    return filteredCards
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

  const submitReview = async (cardId: string, ease: number) => {
    try {
      const response = await fetch(`http://localhost:8000/review/${cardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          ease: ease,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to update review")

      const updated = await response.json()

      // Update flashcard locally
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                status: ease < 3 ? "learning" : "mastered",
                lastReviewed: new Date().toISOString(),
              }
            : card,
        ),
      )

      // Auto next card
      setTimeout(() => {
        if (currentCard < cards.length - 1) {
          nextCard()
        } else {
          alert("You've completed all cards in this deck!")
        }
      }, 500)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const deleteCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))

    // Update card count in the deck
    if (activeDeck) {
      setDecks(decks.map((deck) => (deck.id === activeDeck ? { ...deck, cardCount: deck.cardCount - 1 } : deck)))
    }

    if (currentCard >= cards.length - 1) {
      setCurrentCard(Math.max(0, cards.length - 2))
    }
  }

  const deleteDeck = (deckId: string) => {
    setDecks(decks.filter((deck) => deck.id !== deckId))
    if (activeDeck === deckId) {
      setActiveDeck(null)
      setCards([])
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

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <main className="container mx-auto p-6 flex-grow">
        {limitExceeded && accountType !== "PRO" && (
          <div className="bg-red-50 rounded-md p-3 mb-4 mx-auto max-w-6xl">
            <p className="text-red-700 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              You've reached your daily limit of{" "}
              {accountType === "STANDARD" ? ACCOUNT_LIMITS.STANDARD.FLASHCARDS : ACCOUNT_LIMITS.FREE.FLASHCARDS}
              flashcards for {accountType} accounts. Upgrade to create more.
            </p>
          </div>
        )}

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
                  // Update the Decks Tab to show creation date
                  // Replace the Card component inside the decks.map() function with this:
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
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-2 text-[#F2F5DA]">{deck.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 -mt-1 -mr-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteDeck(deck.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(deck.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Deck Card */}
                <Dialog open={isCreateDeckDialogOpen} onOpenChange={setIsCreateDeckDialogOpen}>
                  <DialogTrigger asChild>
                    <Card className="border-2 border-dashed flex items-center justify-center h-[180px] cursor-pointer hover:border-green-600 transition-colors">
                      <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium">Create New Deck</p>
                      </div>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Create New Flashcard Deck</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Deck Name</label>
                        <Input
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          placeholder="Enter deck name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <Input
                          value={newDeckDescription}
                          onChange={(e) => setNewDeckDescription(e.target.value)}
                          placeholder="Enter deck description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Select a Document</label>
                        <p className="text-sm text-gray-500 mb-2">Choose a document to generate flashcards from</p>

                        {/* Selected file display */}
                        {selectedFile && (
                          <div className="flex items-center p-2 bg-gray-50 rounded-md mb-2">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm flex-grow truncate">{selectedFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setSelectedFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* File selection area */}
                        <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto bg-white">
                          {userFiles.length > 0 ? (
                            <div className="space-y-1">
                              {userFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                                    selectedFile?.id === file.id ? "bg-green-50" : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => handleFileSelect(file)}
                                >
                                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>No files found</p>
                            </div>
                          )}
                        </div>

                        {/* Upload new file option */}
                        <div className="mt-2">
                          <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center p-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Upload a new document</span>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                // This would be implemented by the user later
                                console.log("File upload:", e.target.files)
                                alert("File upload functionality will be implemented later")
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <DialogFooter className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCreateDeckDialogOpen(false)
                            setSelectedFile(null)
                            setNewDeckName("")
                            setNewDeckDescription("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createDeck}
                          disabled={!newDeckName.trim() || isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? "Creating..." : "Create Deck"}
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {decks.length === 0 && !searchQuery && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any flashcard decks yet</p>
                  <Button onClick={() => setIsCreateDeckDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Deck
                  </Button>
                </div>
              )}

              {decks.length > 0 && filteredDecks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No decks found matching "{searchQuery}"</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="study" className="mt-0">
              {activeDeck ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {decks.find((d) => d.id === activeDeck)?.name || "Study Deck"}
                    </h2>
                    <div className="flex gap-2">
                      {!isReviewMode && (
                        <Button
                          variant="outline"
                          onClick={startReviewSession}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Review Session
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setActiveTab("decks")}>
                        Back to Decks
                      </Button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Loading flashcards...</p>
                    </div>
                  ) : isReviewMode ? (
                    // Review Mode UI
                    reviewCards.length > 0 ? (
                      <div className="space-y-6">
                        {/* Review Progress */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Review Progress: {currentReviewCard + 1} of {reviewCards.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Streak: {reviewCards[currentReviewCard].review.correct_streak}
                            </span>
                            <span className="text-xs text-gray-500">
                              Reviews: {reviewCards[currentReviewCard].review.review_count}
                            </span>
                          </div>
                        </div>

                        {/* Review Card */}
                        <Card className="p-8 min-h-[300px] flex flex-col">
                          <div className="flex-1 flex items-center justify-center">
                            <h3 className="text-xl font-medium text-center">{reviewCards[currentReviewCard].front}</h3>
                          </div>

                          {!showAnswer ? (
                            <div className="mt-6 flex justify-center">
                              <Button onClick={() => setShowAnswer(true)} className="bg-blue-600 hover:bg-blue-700">
                                Show Answer
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                                <p className="text-lg text-center">{reviewCards[currentReviewCard].back}</p>
                              </div>
                              // Find the review rating buttons in the Review Mode UI section and replace them with
                              this:
                              <div className="mt-6">
                                <h4 className="text-sm font-medium text-center mb-3">
                                  How well did you remember this?
                                </h4>
                                <div className="flex justify-center gap-3">
                                  <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50 flex-col py-4 px-6"
                                    onClick={() => submitReviewRating(reviewCards[currentReviewCard].id, 0)}
                                  >
                                    <span className="text-2xl mb-2">😵</span>
                                    <span className="text-xs font-medium">Forgot</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-50 flex-col py-4 px-6"
                                    onClick={() => submitReviewRating(reviewCards[currentReviewCard].id, 1)}
                                  >
                                    <span className="text-2xl mb-2">😕</span>
                                    <span className="text-xs font-medium">Hard</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50 flex-col py-4 px-6"
                                    onClick={() => submitReviewRating(reviewCards[currentReviewCard].id, 3)}
                                  >
                                    <span className="text-2xl mb-2">🙂</span>
                                    <span className="text-xs font-medium">Good</span>
                                  </Button>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700 flex-col py-4 px-6"
                                    onClick={() => submitReviewRating(reviewCards[currentReviewCard].id, 5)}
                                  >
                                    <span className="text-2xl mb-2">😎</span>
                                    <span className="text-xs font-medium">Easy</span>
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </Card>

                        {/* Review Stats */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Due date: {reviewCards[currentReviewCard].review.due_date}</span>
                          <span>Interval: {reviewCards[currentReviewCard].review.interval} days</span>
                          <span>Ease: {reviewCards[currentReviewCard].review.ease_factor.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No cards due for review today!</p>
                        <Button onClick={() => setIsReviewMode(false)} className="bg-green-600 hover:bg-green-700">
                          Return to Study
                        </Button>
                      </div>
                    )
                  ) : cards.length > 0 ? (
                    <div className="space-y-6">
                      {/* Filter Options */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button
                          variant={filterType === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => filterCards("all")}
                          className={filterType === "all" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          All Cards
                        </Button>
                        <Button
                          variant={filterType === "due" ? "default" : "outline"}
                          size="sm"
                          onClick={() => filterCards("due")}
                          className={filterType === "due" ? "bg-amber-600 hover:bg-amber-700" : ""}
                        >
                          Due Today
                        </Button>
                        <Button
                          variant={filterType === "new" ? "default" : "outline"}
                          size="sm"
                          onClick={() => filterCards("new")}
                          className={filterType === "new" ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          New Cards
                        </Button>
                        <Button
                          variant={filterType === "completed" ? "default" : "outline"}
                          size="sm"
                          onClick={() => filterCards("completed")}
                          className={filterType === "completed" ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          Completed
                        </Button>
                      </div>

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
                                Difficult
                              </Button>

                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateCardStatus(cards[currentCard].id, "mastered")
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Easy
                              </Button>
                            </div>

                            <div className="mt-6 flex justify-center gap-2">
                              {[0, 1, 2, 3, 4, 5].map((ease) => (
                                <Button
                                  key={ease}
                                  variant="outline"
                                  className={`border-gray-300 ${
                                    ease >= 4 ? "bg-green-100" : ease <= 2 ? "bg-red-100" : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    submitReview(cards[currentCard].id, ease)
                                  }}
                                >
                                  {ease}
                                </Button>
                              ))}
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

                      {/* Card Status and Review Info */}
                      <div className="flex flex-col gap-2">
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

                        {/* Review Information */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                          <div className="flex flex-col">
                            <span className="font-medium">Due Date</span>
                            <span>{cards[currentCard].review.due_date}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">Review Count</span>
                            <span>{cards[currentCard].review.review_count}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">Correct Streak</span>
                            <span>{cards[currentCard].review.correct_streak}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No flashcards found for this deck</p>
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

                {activeDeck ? (
                  <Card>
                    <CardContent className="p-6">
                      {limitExceeded && accountType !== "PRO" && (
                        <div className="mb-4 p-2 text-sm text-red-700 bg-red-50 rounded">
                          Daily limit reached. Upgrade your account to create more flashcards.
                        </div>
                      )}
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
                            disabled={!newFront.trim() || !newBack.trim() || limitExceeded}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {newFront || newBack ? "Update Card" : "Add Card"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Please select a deck first</p>
                    <Button onClick={() => setActiveTab("decks")} className="bg-green-600 hover:bg-green-700">
                      View All Decks
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
