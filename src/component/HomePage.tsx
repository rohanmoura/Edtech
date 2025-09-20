"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Zap, Users } from 'lucide-react';
import { LearningInput } from './LearningInput';
import { PopularTags } from './PopularTags';
import { Avatar3D } from './Avatar3d';

export const HomePage: React.FC = () => {
    const handleInputSubmit = (tags: string) => {
        console.log('Learning tags submitted:', tags);
    };

    const handleTagClick = (tag: string) => {
        console.log('Tag clicked:', tag);
    };

    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Learning',
            description: 'Personalized curriculum adapted to your learning style',
        },
        {
            icon: Zap,
            title: 'Instant Feedback',
            description: 'Get immediate answers and explanations',
        },
        {
            icon: BookOpen,
            title: 'Comprehensive Coverage',
            description: 'Learn any skill with structured lessons',
        },
        {
            icon: Users,
            title: 'Expert Knowledge',
            description: 'Access to world-class expertise in every field',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Content */}
                    <div className="flex-1 space-y-8">
                        <Badge
                            variant="secondary"
                            className="px-4 py-2 font-semibold text-sm bg-primary/10 text-primary border border-primary/20"
                        >
                            EdTech
                        </Badge>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-primary-light/80">
                            Learn Any Skill Instantly with Your AI Professor
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl">
                            Master new skills with personalized AI guidance. Enter your learning goals and let our AI professor create the perfect curriculum for you.
                        </p>

                        {/* Input Section */}
                        <div className="space-y-4 max-w-xl">
                            <LearningInput onSubmit={handleInputSubmit} />
                            <PopularTags onTagClick={handleTagClick} />
                        </div>
                    </div>

                    {/* Right Avatar */}
                    <div className="flex-1 relative w-full max-w-lg">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-3xl blur-2xl" />
                        <div className="relative h-[500px] rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm border border-primary/10 shadow-lg">
                            <Avatar3D />
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-20 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-foreground">Why Choose AI Professor?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Experience the future of personalized learning with cutting-edge AI technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <Card
                                key={idx}
                                className="p-6 bg-card/80 border-0 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 hover:-translate-y-1"
                            >
                                <div className="space-y-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
