"use client"

import type React from "react"
import { useState } from "react"
import { Globe, Youtube, Plus, Search, Trash2, MoreVertical, Eye, X, Check, ChevronUp, ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

interface UrlContextProps {
  onAddUrl?: (url: string) => void
  useAsContext: boolean
  onToggleUseAsContext: (checked: boolean) => void
  showSettings: boolean
  onToggleShowSettings: () => void
}

const UrlContext: React.FC<UrlContextProps> = ({
  onAddUrl,
  useAsContext,
  onToggleUseAsContext,
  showSettings,
  onToggleShowSettings,
}) => {
  const [url, setUrl] = useState("")
  const [urls, setUrls] = useState<string[]>([])
  const [urlSearchQuery, setUrlSearchQuery] = useState("")
  const { t } = useLanguage()

  const handleAddUrl = () => {
    if (url && !urls.includes(url)) {
      setUrls([...urls, url])
      if (onAddUrl) {
        onAddUrl(url)
      }
      setUrl("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUrl()
    }
  }

  const isYoutubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const handleClearUrls = () => {
    setUrls([])
  }

  // Filter URLs based on search query
  const filteredUrls = urls.filter((url) => {
    if (!urlSearchQuery) return true
    return url.toLowerCase().includes(urlSearchQuery.toLowerCase())
  })

  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-50"
        onClick={onToggleShowSettings}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm">{t("urlContext")}</span>
          {urls.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
              {urls.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={useAsContext} onCheckedChange={onToggleUseAsContext} className="mr-2" />
          <span className="text-xs text-gray-500 mr-2">{t("useAsContext")}</span>
          {showSettings ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 px-2">
              {/* URL input */}
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Input
                    placeholder={t("enterUrl")}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-8 h-8 text-sm"
                  />
                  <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAddUrl}
                  disabled={!url.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addUrl")}
                </Button>
              </div>

              {/* Search input */}
              {urls.length > 0 && (
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search URLs..."
                    className="pl-8 h-8 text-sm"
                    value={urlSearchQuery}
                    onChange={(e) => setUrlSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* URL list */}
              {urls.length > 0 ? (
                <div>
                  <div className="max-h-40 overflow-y-auto mb-2 rounded-md border">
                    {filteredUrls.map((url, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0">
                              <div className="flex items-center gap-2">
                                {useAsContext ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-300 rounded-sm" />
                                )}
                                {isYoutubeUrl(url) ? (
                                  <Youtube className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Globe className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="text-sm truncate max-w-[200px]">{url}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View URL</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="flex items-center text-red-500"
                                    onClick={() => {
                                      setUrls((prev) => prev.filter((_, i) => i !== index))
                                    }}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    <span>Remove URL</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{url}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>

                  {/* Clear all button */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                      onClick={handleClearUrls}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">No URLs added yet.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UrlContext
