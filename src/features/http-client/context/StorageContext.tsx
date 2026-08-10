"use client"

import * as React from "react"
import { HttpRequest, HttpResponse, HistoryItem, CollectionItem } from "../types"

interface StorageContextValue {
  history: HistoryItem[]
  collections: CollectionItem[]
  isLoaded: boolean
  addToHistory: (request: HttpRequest, response: HttpResponse) => void
  clearHistory: () => void
  addCollection: (name: string) => void
  deleteCollection: (collectionId: string) => void
  renameCollection: (collectionId: string, newName: string) => void
  saveToCollection: (collectionId: string, request: HttpRequest) => void
  deleteRequestFromCollection: (collectionId: string, requestId: string) => void
}

const StorageContext = React.createContext<StorageContextValue | undefined>(undefined)

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [collections, setCollections] = React.useState<CollectionItem[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("quickpost_history")
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }

      const storedCollections = localStorage.getItem("quickpost_collections")
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections))
      }
    } catch (e) {
      console.error("Failed to load from local storage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage when state changes
  React.useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("quickpost_history", JSON.stringify(history))
  }, [history, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("quickpost_collections", JSON.stringify(collections))
  }, [collections, isLoaded])

  const addToHistory = React.useCallback((request: HttpRequest, response: HttpResponse) => {
    setHistory(prev => {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        request: { ...request },
        response: {
          // We only save metadata of response to save space, not the full payload if we don't want to
          // But type requires response or null. Let's save a light version or full depending on preference.
          // Let's save the full for now so history shows the response.
          ...response
        }
      }
      // Keep only last 50 items
      return [newItem, ...prev].slice(0, 50)
    })
  }, [])

  const clearHistory = React.useCallback(() => {
    setHistory([])
  }, [])

  const addCollection = React.useCallback((name: string) => {
    if (!name.trim()) return
    setCollections(prev => {
      const newCollection: CollectionItem = {
        id: crypto.randomUUID(),
        name,
        requests: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      return [...prev, newCollection]
    })
  }, [])

  const deleteCollection = React.useCallback((collectionId: string) => {
    setCollections(prev => prev.filter(col => col.id !== collectionId))
  }, [])

  const renameCollection = React.useCallback((collectionId: string, newName: string) => {
    if (!newName.trim()) return
    setCollections(prev => prev.map(col => 
      col.id === collectionId ? { ...col, name: newName.trim(), updatedAt: Date.now() } : col
    ))
  }, [])

  const saveToCollection = React.useCallback((collectionId: string, request: HttpRequest) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: [...col.requests, { ...request, id: crypto.randomUUID() }],
          updatedAt: Date.now()
        }
      }
      return col
    }))
  }, [])

  const deleteRequestFromCollection = React.useCallback((collectionId: string, requestId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: col.requests.filter(req => req.id !== requestId),
          updatedAt: Date.now()
        }
      }
      return col
    }))
  }, [])

  return (
    <StorageContext.Provider value={{
      history,
      collections,
      isLoaded,
      addToHistory,
      clearHistory,
      addCollection,
      deleteCollection,
      renameCollection,
      saveToCollection,
      deleteRequestFromCollection
    }}>
      {children}
    </StorageContext.Provider>
  )
}

export function useStorageContext() {
  const context = React.useContext(StorageContext)
  if (!context) {
    throw new Error("useStorageContext must be used within a StorageProvider")
  }
  return context
}
