"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PopularTagsProps {
    onTagClick?: (tag: string) => void
    className?: string
}

const popularTags = [
    "#react.js",
    "#javascript",
    "#python",
    "#typescript",
    "#node.js",
    "#authentication",
    "#database",
    "#machine-learning",
    "#web-development",
    "#css",
    "#html",
    "#api-design",
    "#devops",
    "#git",
]

export const PopularTags: React.FC<PopularTagsProps> = ({ onTagClick, className }) => {
    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-sm font-medium text-neutral-400 text-center">Popular Learning Topics</h3>
            <div className="flex flex-wrap gap-3 justify-center">
                {popularTags.map((tag, index) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className={cn(
                            "px-4 py-2 text-sm cursor-pointer transition-all duration-300 hover:scale-110",
                            "bg-blue-500/10 text-blue-300 border border-blue-500/30 backdrop-blur-sm",
                            "hover:bg-blue-500/20 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50",
                            "animate-slide-up",
                        )}
                        style={{ animationDelay: `${0.1 * index}s` }}
                        onClick={() => onTagClick?.(tag)}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
