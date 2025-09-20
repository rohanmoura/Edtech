"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningInputProps {
  onSubmit?: (tags: string) => void
  className?: string
}

export const LearningInput: React.FC<LearningInputProps> = ({ onSubmit, className }) => {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSubmit?.(inputValue.trim())
      setInputValue("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex items-center bg-neutral-900/80 backdrop-blur-sm rounded-xl border-2 shadow-lg transition-all duration-300",
          isFocused
            ? "border-blue-400 shadow-xl shadow-blue-500/20 scale-105"
            : "border-neutral-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10",
        )}
      >
        <div className="flex items-center px-6 text-blue-400">
          <Sparkles className={cn("h-5 w-5 transition-all duration-300", isFocused && "animate-pulse")} />
        </div>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What would you like to learn today? (e.g., React.js, Python, Design)"
          className="flex-1 border-none bg-transparent text-base text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 py-4"
        />
        <Button
          type="submit"
          size="sm"
          className={cn(
            "m-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300",
            inputValue.trim() && "hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30",
          )}
          disabled={!inputValue.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
