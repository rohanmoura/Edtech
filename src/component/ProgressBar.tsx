"use client";

import { Star } from "lucide-react";

type ProgressBarProps = {
    totalStars?: number; // total number of stars to display
    filledStars?: number; // how many stars are filled
};

export default function ProgressBar({ totalStars = 5, filledStars = 0 }: ProgressBarProps) {
    const total = Math.max(1, Math.floor(totalStars));
    const filled = Math.min(Math.max(0, Math.floor(filledStars)), total);

    return (
        <div className="flex flex-col items-start space-y-2">
            {/* Label */}
            <span className="text-sm font-medium text-gray-300">Progress {filled}/{total}</span>

            {/* Stars */}
            <div className="flex space-x-1">
                {Array.from({ length: total }).map((_, index) => {
                    const isFilled = index < filled;
                    return (
                        <Star
                            key={index}
                            className={`w-5 h-5 ${isFilled ? "text-yellow-400" : "text-gray-500"}`}
                            fill={isFilled ? "currentColor" : "none"}
                            strokeWidth={isFilled ? 1.2 : 1.5}
                        />
                    );
                })}
            </div>
        </div>
    );
}
