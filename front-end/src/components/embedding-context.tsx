"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type EmbeddingStatus = "idle" | "embedding" | "completed" | "error"

interface EmbeddingContextType {
  status: EmbeddingStatus
  progress: number
  documentId: string | null
  startEmbedding: (docId: string) => void
  completeEmbedding: () => void
  setEmbeddingError: () => void
}

const EmbeddingContext = createContext<EmbeddingContextType | undefined>(undefined)

export function EmbeddingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<EmbeddingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Start tracking embedding progress
  const startEmbedding = (docId: string) => {
    setStatus("embedding")
    setProgress(0)
    setDocumentId(docId)
    
    // Start polling to check if embeddings exist
    const intervalId = setInterval(() => {
      checkEmbeddingStatus(docId);
    }, 2000);
    
    setCheckInterval(intervalId);
    
    // Set a timeout for the entire process (10 minutes max)
    setTimeout(() => {
      if (status === "embedding") {
        completeEmbedding();
      }
    }, 10 * 60 * 1000);
  }
  
  // Check if embeddings exist for the document
  const checkEmbeddingStatus = async (docId: string) => {
    try {
      const userId = localStorage.getItem("user_id") || "";
      if (!userId) return;
      
      // Try to fetch embeddings using existing GET endpoint
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/embed/embeddings/${docId}?user_id=${userId}`;
      const response = await fetch(url);
  
      // If we get a successful response, embeddings exist
      if (response.ok) {
        const data = await response.json();
        if (data.total_chunks > 0) {
          completeEmbedding();
          return;
        }
      }
      
      // If embeddings don't exist yet, update progress (fake progress based on time)
      updateProgressByTime();
      
    } catch (error) {
      console.error("Error checking embedding status:", error);
    }
  }
  
  // Estimate progress based on time elapsed
  const updateProgressByTime = () => {
    setProgress(prev => {
      // Gradually increase progress, slower as we approach 90%
      if (prev < 50) return prev + 5;
      if (prev < 80) return prev + 2;
      if (prev < 90) return prev + 0.5;
      return prev;
    });
  }
  
  // Complete embedding
  const completeEmbedding = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setStatus("completed");
    setProgress(100);
    setDocumentId(null);
  }
  
  // Set embedding error
  const setEmbeddingError = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setStatus("error");
    setDocumentId(null);
  }
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  return (
    <EmbeddingContext.Provider
      value={{
        status,
        progress,
        documentId,
        startEmbedding,
        completeEmbedding,
        setEmbeddingError,
      }}
    >
      {children}
    </EmbeddingContext.Provider>
  )
}

export function useEmbedding() {
  const context = useContext(EmbeddingContext)
  if (context === undefined) {
    throw new Error("useEmbedding must be used within an EmbeddingProvider")
  }
  return context
}