import { accountTypeAPI } from "@/lib/api";

export const ACCOUNT_LIMITS = {
    FREE: {
      CHAT_QUERIES: 50,
      MAX_QUERY_WORDS: 500,
      MINDMAPS: 50,
      CHEATSHEETS: 50,
      FLASHCARDS: 10
    },
    STANDARD: {
      CHAT_QUERIES: 50,
      MAX_QUERY_WORDS: 500,
      MINDMAPS: 50,
      CHEATSHEETS: 50,
      FLASHCARDS: 20
    },
    PRO: {
      CHAT_QUERIES: Infinity,
      MAX_QUERY_WORDS: Infinity,
      MINDMAPS: Infinity,
      CHEATSHEETS: Infinity,
      FLASHCARDS: Infinity
    }
  };
  
  // Helper to check if we need to reset daily counts
  export function shouldResetDailyCounts(): boolean {
    const lastResetDate = localStorage.getItem('lastCountResetDate');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!lastResetDate || lastResetDate !== today) {
      localStorage.setItem('lastCountResetDate', today);
      return true;
    }
    return false;
  }

// Server-side check with fallback to client-side
export async function checkAndResetDailyCounts(userId: string): Promise<boolean> {
    try {
      const response = await accountTypeAPI.checkAndResetCounts(userId);
      return response.wasReset;
    } catch (error) {
      console.error("Error checking daily count reset:", error);
      
      // Fallback to client-side check if API fails
      const lastResetDate = localStorage.getItem('lastCountResetDate');
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!lastResetDate || lastResetDate !== today) {
        localStorage.setItem('lastCountResetDate', today);
        return true;
      }
      return false;
    }
  }