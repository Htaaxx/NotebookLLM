"use client"

import { useState } from "react"
import { allThemes } from "../lib/mind-elixir-themes"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (themeName: string) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = (themeName: string) => {
    onThemeChange(themeName)
    setIsOpen(false)
  }

  // Find the current theme object
  const currentThemeObj = allThemes.find((t) => t.name === currentTheme) || allThemes[0]

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 h-9 px-3 py-2 text-sm font-medium border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <span>Theme: {currentThemeObj.displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-10 w-48 mt-1 bg-white border rounded-md shadow-lg">
          <ul className="py-1">
            {allThemes.map((theme) => (
              <li key={theme.name}>
                <button
                  onClick={() => handleThemeSelect(theme.name)}
                  className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {currentTheme === theme.name && <Check className="w-4 h-4 mr-2 text-green-500" />}
                  <span className={currentTheme === theme.name ? "font-medium" : ""}>{theme.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
