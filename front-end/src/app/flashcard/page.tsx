"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { documentAPI } from "@/lib/api";
import type { FileItem } from "@/types/app-types";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  starred: boolean;
  lastReviewed: string;
  status: "new" | "learning" | "review" | "mastered";
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  lastStudied: string;
  documentId?: string;
}

export default function FlashcardPage() {
  const [activeTab, setActiveTab] = useState("decks");
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { t } = useLanguage();

  // Sample decks
  const [decks, setDecks] = useState<Deck[]>([]);

  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_id");
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  // Fetch user files when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserFiles(userId);
    }
  }, [userId]);

  // Fetch user files from API
  const fetchUserFiles = async (userId: string) => {
    try {
      const documents = await documentAPI.getDocuments(userId);
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
        }));
        setUserFiles(files);
      }
    } catch (error) {
      console.error("Error fetching user files:", error);
    }
  };

  // Helper function to determine file type based on filename
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return "document";
    const extension = filename.split(".").pop()?.toLowerCase();
    if (!extension) return "document";
    if (["pdf"].includes(extension)) return "application/pdf";
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension))
      return "image/" + extension;
    if (["mp4", "webm", "mov"].includes(extension)) return "video/" + extension;
    if (["md", "markdown"].includes(extension)) return "text/markdown";
    return "document";
  };

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    if (!filename) return "";
    const extensionMatch = filename.match(/\.[^.]+$/);
    return extensionMatch ? extensionMatch[0].toLowerCase() : "";
  };

  // Load cards for the selected deck
  useEffect(() => {
    if (activeDeck) {
      const selectedDeck = decks.find((deck) => deck.id === activeDeck);
      if (selectedDeck?.documentId) {
        fetchFlashcardsForDocument(selectedDeck.documentId);
      } else {
        // If no document ID, just set empty cards array
        setCards([]);
      }
      setCurrentCard(0);
      setIsFlipped(false);
    }
  }, [activeDeck, decks]);

  // Fetch flashcards for a document (placeholder for backend API call)
  const fetchFlashcardsForDocument = async (documentId: string) => {
    setIsLoading(true);
    try {
      // This is a placeholder - the user will implement the actual backend API call later
      console.log(`Fetching flashcards for document: ${documentId}`);

      // Simulate API call with timeout
      setTimeout(() => {
        // For now, just set empty cards array
        setCards([]);
        setIsLoading(false);
      }, 1000);

      // The actual API call would look something like this:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/flashcards/${documentId}`)
      // const data = await response.json()
      // setCards(data.flashcards)
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setCards([]);
      setIsLoading(false);
    }
  };

  const filteredDecks = searchQuery
    ? decks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : decks;

  const createDeck = () => {
    if (!newDeckName.trim()) return;

    setIsLoading(true);

    try {
      // Create a new deck with reference to the selected document
      const newDeck: Deck = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDeckName,
        description: newDeckDescription || `Flashcards deck`,
        cardCount: 0, // Will be updated when cards are fetched
        lastStudied: "Never",
        documentId: selectedFile?.id,
      };

      setDecks([...decks, newDeck]);

      // Reset form
      setNewDeckName("");
      setNewDeckDescription("");
      setSelectedFile(null);
      setIsCreateDeckDialogOpen(false);

      // Fetch flashcards for the new deck if document is selected
      if (selectedFile?.id) {
        console.log(`Created new deck with document ID: ${selectedFile.id}`);
      }
    } catch (error) {
      console.error("Error creating deck:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !activeDeck) return;

    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: newFront,
      back: newBack,
      starred: false,
      lastReviewed: "Never",
      status: "new",
    };

    setCards([...cards, newCard]);

    // Update card count in the deck
    setDecks(
      decks.map((deck) =>
        deck.id === activeDeck
          ? { ...deck, cardCount: deck.cardCount + 1 }
          : deck
      )
    );

    setNewFront("");
    setNewBack("");
  };

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const toggleStar = (cardId: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, starred: !card.starred } : card
      )
    );
  };

  const updateCardStatus = (cardId: string, status: Flashcard["status"]) => {
    setCards(
      cards.map((card) =>
        card.id === cardId
          ? { ...card, status, lastReviewed: "Just now" }
          : card
      )
    );

    // Move to next card after marking
    setTimeout(() => {
      if (currentCard < cards.length - 1) {
        nextCard();
      } else {
        // If it's the last card, show completion message or reset
        alert("You've completed all cards in this deck!");
        setCurrentCard(0);
        setIsFlipped(false);
      }
    }, 500);
  };

  const submitReview = async (cardId: string, ease: number) => {
    try {
      const response = await fetch(`/api/review/${cardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ease }),
      });

      if (!response.ok) throw new Error("Failed to update review");

      const updated = await response.json();

      // Cập nhật flashcard local
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                status: ease < 3 ? "learning" : "mastered",
                lastReviewed: new Date().toISOString(),
              }
            : card
        )
      );

      // Auto next card
      setTimeout(() => {
        if (currentCard < cards.length - 1) {
          nextCard();
        } else {
          alert("You've completed all cards in this deck!");
        }
      }, 500);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const deleteCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId));

    // Update card count in the deck
    if (activeDeck) {
      setDecks(
        decks.map((deck) =>
          deck.id === activeDeck
            ? { ...deck, cardCount: deck.cardCount - 1 }
            : deck
        )
      );
    }

    if (currentCard >= cards.length - 1) {
      setCurrentCard(Math.max(0, cards.length - 2));
    }
  };

  const deleteDeck = (deckId: string) => {
    setDecks(decks.filter((deck) => deck.id !== deckId));
    if (activeDeck === deckId) {
      setActiveDeck(null);
      setCards([]);
    }
  };

  const getStatusColor = (status: Flashcard["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "learning":
        return "bg-yellow-100 text-yellow-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "mastered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
  };

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
                      setActiveDeck(deck.id);
                      setActiveTab("study");
                    }}
                  >
                    <div className="h-2 bg-green-600"></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-2">{deck.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 -mt-1 -mr-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDeck(deck.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <p className="text-gray-500 mb-4 line-clamp-2">
                        {deck.description}
                      </p>
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
                <Dialog
                  open={isCreateDeckDialogOpen}
                  onOpenChange={setIsCreateDeckDialogOpen}
                >
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
                        <label className="block text-sm font-medium mb-1">
                          Deck Name
                        </label>
                        <Input
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          placeholder="Enter deck name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description (Optional)
                        </label>
                        <Input
                          value={newDeckDescription}
                          onChange={(e) =>
                            setNewDeckDescription(e.target.value)
                          }
                          placeholder="Enter deck description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Select a Document
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          Choose a document to generate flashcards from
                        </p>

                        {/* Selected file display */}
                        {selectedFile && (
                          <div className="flex items-center p-2 bg-gray-50 rounded-md mb-2">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm flex-grow truncate">
                              {selectedFile.name}
                            </span>
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
                                    selectedFile?.id === file.id
                                      ? "bg-green-50"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => handleFileSelect(file)}
                                >
                                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm truncate">
                                    {file.name}
                                  </span>
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
                            <span className="text-sm">
                              Upload a new document
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                // This would be implemented by the user later
                                console.log("File upload:", e.target.files);
                                alert(
                                  "File upload functionality will be implemented later"
                                );
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <DialogFooter className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCreateDeckDialogOpen(false);
                            setSelectedFile(null);
                            setNewDeckName("");
                            setNewDeckDescription("");
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
                  <p className="text-gray-500 mb-4">
                    You don't have any flashcard decks yet
                  </p>
                  <Button
                    onClick={() => setIsCreateDeckDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Deck
                  </Button>
                </div>
              )}

              {decks.length > 0 && filteredDecks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No decks found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Study Tab */}
            <TabsContent value="study" className="mt-0">
              {activeDeck ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {decks.find((d) => d.id === activeDeck)?.name ||
                        "Study Deck"}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("decks")}
                    >
                      Back to Decks
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Loading flashcards...</p>
                    </div>
                  ) : cards.length > 0 ? (
                    <div className="space-y-6">
                      {/* Card Navigation */}
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevCard}
                          disabled={currentCard === 0}
                        >
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
                            transform: isFlipped
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          {/* Front of Card */}
                          <Card
                            className={`p-8 min-h-[300px] flex flex-col ${
                              isFlipped
                                ? "absolute inset-0 backface-hidden"
                                : "relative"
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
                                  e.stopPropagation();
                                  toggleStar(cards[currentCard].id);
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
                                  e.stopPropagation();
                                  deleteCard(cards[currentCard].id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                              <h3 className="text-xl font-medium text-center">
                                {cards[currentCard].front}
                              </h3>
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
                              isFlipped
                                ? "relative"
                                : "absolute inset-0 backface-hidden"
                            }`}
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-lg text-center">
                                {cards[currentCard].back}
                              </p>
                            </div>

                            <div className="mt-6 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCardStatus(
                                    cards[currentCard].id,
                                    "learning"
                                  );
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <div className="mt-6 flex justify-center gap-2">
                                  {[0, 1, 2, 3, 4, 5].map((ease) => (
                                    <Button
                                      key={ease}
                                      variant="outline"
                                      className={`border-gray-300 ${
                                        ease >= 4
                                          ? "bg-green-100"
                                          : ease <= 2
                                          ? "bg-red-100"
                                          : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        submitReview(
                                          cards[currentCard].id,
                                          ease
                                        );
                                      }}
                                    >
                                      {ease}
                                    </Button>
                                  ))}
                                </div>
                              </Button>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCardStatus(
                                    cards[currentCard].id,
                                    "mastered"
                                  );
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                <div className="mt-6 flex justify-center gap-2">
                                  {[0, 1, 2, 3, 4, 5].map((ease) => (
                                    <Button
                                      key={ease}
                                      variant="outline"
                                      className={`border-gray-300 ${
                                        ease >= 4
                                          ? "bg-green-100"
                                          : ease <= 2
                                          ? "bg-red-100"
                                          : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        submitReview(
                                          cards[currentCard].id,
                                          ease
                                        );
                                      }}
                                    >
                                      {ease}
                                    </Button>
                                  ))}
                                </div>
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
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              cards[currentCard].status
                            )}`}
                          >
                            {cards[currentCard].status.charAt(0).toUpperCase() +
                              cards[currentCard].status.slice(1)}
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
                            setActiveTab("create");
                            setNewFront(cards[currentCard].front);
                            setNewBack(cards[currentCard].back);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Card
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">
                        No flashcards found for this deck
                      </p>
                      <Button
                        onClick={() => setActiveTab("create")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Card
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Please select a deck to study
                  </p>
                  <Button
                    onClick={() => setActiveTab("decks")}
                    className="bg-green-600 hover:bg-green-700"
                  >
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
                              setNewFront("");
                              setNewBack("");
                              setActiveTab("study");
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
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      Please select a deck first
                    </p>
                    <Button
                      onClick={() => setActiveTab("decks")}
                      className="bg-green-600 hover:bg-green-700"
                    >
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
  );
}
