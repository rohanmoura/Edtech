"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, Zap, Users, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spotlight } from "@/component/spotlight"
import { LearningInput } from "@/component/LearningInput"
import { PopularTags } from "@/component/PopularTags"
import { HeroHeading } from "@/component/heading"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleInputSubmit = (tags: string) => {
    console.log("Learning tags submitted:", tags)
    // TODO: Implement learning session start logic
  }


  const handleTagClick = (tag: string) => {
    setLoading(true); // show loader
    console.log("Tag clicked:", tag);

    // simulate navigation delay
    setTimeout(() => {
      router.push(`/courses/${tag.toLowerCase()}`);
    }, 500); // 500ms delay to show loader
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-black/[0.96] antialiased p-6 md:p-8 lg:p-12">
      {/* Grid pattern background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      />

      {/* Spotlight effects */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
      <Spotlight className="-top-40 right-0 md:-top-20 md:right-60" fill="blue" />

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-12 min-h-[80vh] justify-center">
          {/* Hero Content */}
          <div className="space-y-12 relative z-10 animate-fade-in">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="text-sm font-medium px-6 py-3 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300 animate-slide-up backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>

              {/* Replace the h1 block */}
              <HeroHeading />


              <p
                className="text-xl text-neutral-300 max-w-3xl mx-auto text-pretty leading-relaxed animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                Master new skills with personalized AI guidance. Simply enter your learning goals and let our
                intelligent system create the perfect curriculum tailored just for you.
              </p>
            </div>

            {/* Interactive Learning Section */}
            <div className="space-y-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
                  <LearningInput onSubmit={handleInputSubmit} className="mb-6" />
                  <PopularTags onTagClick={handleTagClick} />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards - Updated for dark mode */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto animate-slide-up"
            style={{ animationDelay: "1s" }}
          >
            {[
              { icon: Brain, title: "AI-Powered", desc: "Smart personalization" },
              { icon: Zap, title: "Instant", desc: "Immediate feedback" },
              { icon: BookOpen, title: "Comprehensive", desc: "All subjects covered" },
              { icon: Users, title: "Expert", desc: "World-class knowledge" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-3 hover:scale-105 group cursor-pointer"
                style={{ animationDelay: `${1.2 + index * 0.1}s` }}
              >
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                    <feature.icon className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-200 group-hover:text-blue-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-400 text-pretty leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
