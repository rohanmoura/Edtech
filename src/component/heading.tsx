"use client"

import { LayoutTextFlip } from "./layout-text-flip"

export const HeroHeading = () => {
    return (
        <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-b from-neutral-50 via-blue-200 to-blue-400 bg-clip-text text-transparent leading-tight text-balance animate-slide-up">
            <span className="mr-2">“</span>
            <LayoutTextFlip
                text=""
                words={["Learn", "Build", "Master"]}
                duration={2000}
            />
            <span className="ml-2">: The AI-Powered 3D Learning Revolution”</span>
        </h1>
    )
}
