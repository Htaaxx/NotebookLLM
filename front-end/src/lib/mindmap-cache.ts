// A simple cache for storing mindmap data to avoid redundant API calls

interface MindMapCacheItem {
  data: string
  timestamp: number
  documentIds: string[]
}

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

class MindMapCache {
  private cache: Map<string, MindMapCacheItem> = new Map()

  // Generate a cache key from document IDs
  private generateKey(documentIds: string[]): string {
    return documentIds.sort().join("|")
  }

  // Store mindmap data in the cache
  set(documentIds: string[], data: string): void {
    if (!documentIds.length || !data) return

    const key = this.generateKey(documentIds)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      documentIds: [...documentIds],
    })

    console.log(`Cached mindmap data for documents: ${documentIds.join(", ")}`)
  }

  /**
   * Determines if the mindmap needs to be refreshed based on selected files
   * @param previousFiles Previously selected file IDs
   * @param currentFiles Currently selected file IDs
   * @returns true if refresh is needed, false otherwise
   */
  needsRefresh(previousFiles: string[], currentFiles: string[]): boolean {
    // If either array is empty but the other isn't, we definitely need to refresh
    if (
      (previousFiles.length === 0 && currentFiles.length > 0) ||
      (previousFiles.length > 0 && currentFiles.length === 0)
    ) {
      return true
    }

    // If the number of files changed, need to refresh
    if (previousFiles.length !== currentFiles.length) {
      return true
    }

    // Sort both arrays to make comparison consistent
    const sortedPrevious = [...previousFiles].sort()
    const sortedCurrent = [...currentFiles].sort()

    // Check if the file sets are different
    for (let i = 0; i < sortedCurrent.length; i++) {
      if (sortedCurrent[i] !== sortedPrevious[i]) {
        return true
      }
    }

    return false
  }

  // Get mindmap data from the cache if it exists and is not expired
  get(documentIds: string[]): string | null {
    if (!documentIds.length) return null

    const key = this.generateKey(documentIds)
    const cacheItem = this.cache.get(key)

    if (!cacheItem) {
      console.log(`Cache miss for documents: ${documentIds.join(", ")}`)
      return null
    }

    // Check if cache is expired
    if (Date.now() - cacheItem.timestamp > CACHE_EXPIRATION) {
      console.log(`Cache expired for documents: ${documentIds.join(", ")}`)
      this.cache.delete(key)
      return null
    }

    console.log(`Cache hit for documents: ${documentIds.join(", ")}`)
    return cacheItem.data
  }

  // Clear cache for specific document IDs
  invalidate(documentIds: string[]): void {
    if (!documentIds.length) return

    const key = this.generateKey(documentIds)
    if (this.cache.has(key)) {
      this.cache.delete(key)
      console.log(`Cache invalidated for documents: ${documentIds.join(", ")}`)
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    console.log("Mindmap cache cleared")
  }
}

// Create a singleton instance
const mindMapCache = new MindMapCache()
export default mindMapCache
