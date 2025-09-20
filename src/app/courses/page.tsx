"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mockCourseData } from "@/lib/dara";
import ProfessorAvatar from "@/component/ProfessorAvatar";
import TTSControls, { type TTSHandle, type SpeakItem } from "@/component/TTSControls";
import { Input } from "@/components/ui/input";

// Helper function to clean text for TTS
const cleanTextForTTS = (text: string): string => {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*/g, '') // Remove asterisks
        .replace(/\n/g, '. ') // Replace newlines with periods
        .replace(/\s+/g, ' ') // Remove extra whitespace
        .trim();
};

export default function CoursePage() {
    const router = useRouter();
    const [openLesson, setOpenLesson] = useState("");
    const [speaking, setSpeaking] = useState(false);
    const [helpInput, setHelpInput] = useState("");
    const [helpInputVisible, setHelpInputVisible] = useState(false); // New state
    const ttsRef = useRef<TTSHandle>(null);
    const initialQueuedRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const suppressSpeakRef = useRef(false);

    useEffect(() => setMounted(true), []);

    const toggleLesson = (id: string) => {
        if (openLesson === id) {
            setOpenLesson("");
            ttsRef.current?.stop();
        } else {
            setOpenLesson(id);
        }
    };

    // Handle help question submission
    const handleHelpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (helpInput.trim()) {
            // TODO: Implement help functionality
            console.log("Help requested:", helpInput);
            // For now, just speak the question back
            const helpQueue: SpeakItem[] = [
                { id: "help-request", text: `You asked: ${helpInput}` }
            ];
            ttsRef.current?.speakQueue(helpQueue);
            setHelpInput(""); // Clear input after submission
        }
    };

    useEffect(() => {
        if (!mounted || !ttsRef.current || initialQueuedRef.current) return;

        const course = mockCourseData.courses[0];
        if (!course) return;

        const courseName = mockCourseData.query;
        const introQueue: SpeakItem[] = [
            { id: "welcome", text: `Welcome to ${courseName} course.` },
            { id: "description", text: cleanTextForTTS(course.title) },
        ];

        ttsRef.current.speakQueue(introQueue);
        initialQueuedRef.current = true;

        const firstLesson = course.lessons[0];
        if (firstLesson) {
            const lessonQueue: SpeakItem[] = [
                { id: "first-lesson", text: `First lesson: ${firstLesson.lesson}.` },
                { id: firstLesson.id, text: cleanTextForTTS(firstLesson.explanation) },
            ];
            ttsRef.current.enqueue(lessonQueue);

            const timer = setTimeout(() => {
                suppressSpeakRef.current = true;
                setOpenLesson(firstLesson.id);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mounted]);

    useEffect(() => {
        if (!initialQueuedRef.current) return;
        if (suppressSpeakRef.current) {
            suppressSpeakRef.current = false;
            return;
        }
        const course = mockCourseData.courses[0];
        if (!course || !openLesson) return;

        const lesson = course.lessons.find((l) => l.id === openLesson);
        if (!lesson) return;

        const queue: SpeakItem[] = [
            { id: `${lesson.id}-title`, text: `${lesson.order}. ${lesson.lesson}.` },
            { id: lesson.id, text: cleanTextForTTS(lesson.explanation) },
        ];
        ttsRef.current?.speakQueue(queue);
    }, [openLesson]);

    useEffect(() => () => { ttsRef.current?.stop(); }, []);

    return (
        <div className="min-h-screen bg-black/[0.96] text-neutral-200 py-12 px-6 md:px-12 lg:px-20 relative">
            {/* Grid background */}
            <div
                className="pointer-events-none absolute inset-0 [background-size:40px_40px] select-none
                [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),
                linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
            />

            <div className="relative z-10 max-w-6xl mx-auto space-y-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/courses")}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                    Back
                </button>

                {/* Course Header */}
                <div className="flex flex-col lg:flex-row items-center gap-8 mt-4">
                    <img
                        src={mockCourseData.image}
                        alt={mockCourseData.query}
                        className="w-full lg:w-1/5 rounded-xl shadow-xl border border-neutral-800"
                    />
                    <div className="flex-1 text-center lg:text-left space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {mockCourseData.query} Courses
                        </h2>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Master {mockCourseData.query} with structured lessons, interactive projects, and real-world examples.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/5 space-y-3">
                        <ProfessorAvatar isSpeaking={speaking} />
                        <TTSControls
                            ref={ttsRef}
                            onSpeakingChange={setSpeaking}
                            onHelpInputVisibilityChange={setHelpInputVisible} // New prop
                        />
                    </div>
                </div>

                {/* Need Help Section - Hidden by default, shown when Need Help button is clicked */}
                {helpInputVisible && (
                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <form onSubmit={handleHelpSubmit} className="flex-1 w-full">
                                <Input
                                    type="text"
                                    value={helpInput}
                                    onChange={(e) => setHelpInput(e.target.value)}
                                    placeholder="Ask me anything about this module"
                                    className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </form>
                        </div>
                    </div>
                )}

                {/* Lessons */}
                <div className="space-y-8">
                    {mockCourseData.courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/10 transition-shadow"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-neutral-100" style={{ lineHeight: 1.5, letterSpacing: 0.5 }}>
                                {course.title}
                            </h3>
                            <div className="space-y-4">
                                {course.lessons.map((lesson) => (
                                    <div key={lesson.id} className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden">
                                        <div
                                            onClick={() => toggleLesson(lesson.id)}
                                            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                                        >
                                            <p className="font-medium text-neutral-200">
                                                {lesson.order}. {lesson.lesson}
                                            </p>
                                            <span className="text-sm text-neutral-500">
                                                {openLesson === lesson.id ? "▲" : "▼"}
                                            </span>
                                        </div>
                                        {openLesson === lesson.id && (
                                            <div className="px-5 pb-5 pt-3 text-[18px] leading-relaxed text-neutral-300 bg-neutral-950/60 border-t border-neutral-800">
                                                {lesson.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}