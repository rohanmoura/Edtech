"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { type MockCourseData } from "@/lib/dara";
import ProfessorAvatar from "@/component/ProfessorAvatar";
import TTSControls, { type TTSHandle, type SpeakItem } from "@/component/TTSControls";
import { askGemini } from "@/lib/gemini";
import { generateCourseFromTag } from "@/lib/generateCourse";
import ProgressBar from "@/component/ProgressBar";

// Helper function to clean text for TTS
const cleanTextForTTS = (text: string): string => {
    return text
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/\*/g, "") // Remove asterisks
        .replace(/\n/g, ". ") // Replace newlines with periods
        .replace(/\s+/g, " ") // Remove extra whitespace
        .trim();
};

type ChatMessage = {
    role: "user" | "assistant";
    text: string;
};

export default function CoursePage() {
    const router = useRouter();
    const params = useParams<{ tag: string }>();
    const topicTag = decodeURIComponent(String(params?.tag || ""));

    const [courseData, setCourseData] = useState<MockCourseData | null>(null);
    const [openLesson, setOpenLesson] = useState("");
    const [speaking, setSpeaking] = useState(false);
    const [helpInput, setHelpInput] = useState("");
    const [helpInputVisible, setHelpInputVisible] = useState(false);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [loadingAnswer, setLoadingAnswer] = useState(false);
    const ttsRef = useRef<TTSHandle>(null);
    const initialQueuedRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const suppressSpeakRef = useRef(false);
    const [showFAQs, setShowFAQs] = useState(false);
    const [faqAnswers, setFaqAnswers] = useState<Record<number, { selected: number | null; correct: boolean | null }>>({});

    useEffect(() => setMounted(true), []);

    // Load course dynamically from Gemini based on route tag
    useEffect(() => {
        let active = true;
        if (!topicTag) return;
        (async () => {
            const data = await generateCourseFromTag(topicTag);
            if (!active) return;
            setCourseData(data as MockCourseData | null);
        })();
        return () => {
            active = false;
        };
    }, [topicTag]);

    const toggleLesson = (id: string) => {
        if (openLesson === id) {
            setOpenLesson("");
            ttsRef.current?.stop();
        } else {
            setOpenLesson(id);
        }
    };

    const handleSelectOption = (faqIndex: number, optionIndex: number) => {
        if (!courseData) return;
        const existing = faqAnswers[faqIndex];
        if (existing && existing.selected !== null) return; // already answered

        const course = courseData.courses[0];
        const correctIdx = course?.faqs?.[faqIndex]?.Answer?.findIndex((a) => a.correct) ?? -1;
        const isCorrect = optionIndex === correctIdx;
        setFaqAnswers((prev) => ({
            ...prev,
            [faqIndex]: { selected: optionIndex, correct: isCorrect },
        }));
    };

    // Handle help question submission
    const handleHelpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!helpInput.trim() || !courseData) return;

        const userMsg: ChatMessage = { role: "user", text: helpInput };
        setChat((prev) => [...prev, userMsg]);

        const question = helpInput;
        setHelpInput("");
        setLoadingAnswer(true);

        try {
            const answer = await askGemini(question, courseData);

            const assistantMsg: ChatMessage = { role: "assistant", text: answer };
            setChat((prev) => [...prev, assistantMsg]);

            // Speak the answer
            const helpQueue: SpeakItem[] = [
                { id: "help-answer", text: cleanTextForTTS(answer) },
            ];
            ttsRef.current?.speakQueue(helpQueue);
        } catch (error) {
            console.error("Error fetching Gemini answer:", error);
            setChat((prev) => [
                ...prev,
                { role: "assistant", text: "Sorry, something went wrong." },
            ]);
        } finally {
            setLoadingAnswer(false);
        }
    };

    // Course intro (dynamic)
    useEffect(() => {
        if (!mounted || !ttsRef.current || initialQueuedRef.current || !courseData) return;

        const course = courseData.courses[0];
        if (!course) return;

        const courseName = courseData.query;
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
    }, [mounted, courseData]);

    // Lesson toggle speech
    useEffect(() => {
        if (!initialQueuedRef.current) return;
        if (suppressSpeakRef.current) {
            suppressSpeakRef.current = false;
            return;
        }
        if (!courseData || !openLesson) return;
        const course = courseData.courses[0];
        if (!course) return;
        
        // Lessons speech
        const lesson = course.lessons.find((l) => l.id === openLesson);
        if (lesson) {
            const queue: SpeakItem[] = [
                { id: `${lesson.id}-title`, text: `${lesson.order}. ${lesson.lesson}.` },
                { id: lesson.id, text: cleanTextForTTS(lesson.explanation) },
            ];
            ttsRef.current?.speakQueue(queue);
            return;
        }

        // Optional: FAQ speech (question and options only)
        if (openLesson.startsWith("faq-")) {
            const idx = Number(openLesson.split("-")[1] ?? -1);
            const faq = course.faqs?.[idx];
            if (faq) {
                const text = `Question: ${cleanTextForTTS(faq.Question)}. Options: ${faq.Answer.map((a, i) => `${i + 1}. ${cleanTextForTTS(a.text)}`).join(". ")}.`;
                ttsRef.current?.speakQueue([{ id: openLesson, text }]);
            }
        }
    }, [openLesson, courseData]);

    useEffect(() => () => { ttsRef.current?.stop(); }, []);

    // Derived FAQ completion state
    const totalFAQs = courseData?.courses?.[0]?.faqs?.length ?? 0;
    const answeredCount = Object.values(faqAnswers).filter((v) => v && v.selected !== null).length;
    const allFAQsAnswered = totalFAQs > 0 && answeredCount >= totalFAQs;
    const correctCount = Object.values(faqAnswers).filter((v) => v?.correct === true).length;

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
                    onClick={() => router.push("/")}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                    Back
                </button>

                {/* Course Header */}
                <div className="flex flex-col lg:flex-row items-center gap-8 mt-4">
                    <div className="flex-1 text-center lg:text-left space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-relaxed py-1">
                            {courseData ? `${courseData.query} Courses` : "Loading..."}
                        </h2>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {courseData ? (
                                <>Master {courseData.query} with structured lessons, interactive projects, and real-world examples.</>
                            ) : (
                                "Generating your course with AI..."
                            )}
                        </p>
                    </div>
                    <div className="w-full lg:w-1/5 space-y-3">
                        <ProfessorAvatar isSpeaking={speaking} />
                        <TTSControls
                            ref={ttsRef}
                            onSpeakingChange={setSpeaking}
                            onHelpInputVisibilityChange={setHelpInputVisible}
                        />
-                        <ProgressBar />
+                        <ProgressBar totalStars={totalFAQs || 5} filledStars={correctCount} />
                    </div>
                </div>

                {/* Need Help Section */}
                {helpInputVisible && (
                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg space-y-4">
                        {/* Chat Display */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {chat.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`text-sm px-3 py-2 rounded-lg max-w-[80%] ${msg.role === "user"
                                        ? "bg-purple-700/70 text-white ml-auto"
                                        : "bg-neutral-800/70 text-neutral-300 mr-auto"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {loadingAnswer && (
                                <div className="text-sm text-neutral-400 italic">Thinking...</div>
                            )}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleHelpSubmit} className="flex-1 w-full">
                            <textarea
                                value={helpInput}
                                onChange={(e) => setHelpInput(e.target.value)}
                                placeholder="Ask me anything about this module..."
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleHelpSubmit(e as any);
                                    }
                                }}
                                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-200 placeholder-neutral-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        </form>
                    </div>
                )}

                {/* Lessons / FAQs */}
                <div className="space-y-8">
                    {courseData?.courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/10 transition-shadow"
                        >
                            {!showFAQs ? (
                                <>
                                    <h3
                                        className="text-xl font-semibold mb-4 text-neutral-100"
                                        style={{ lineHeight: 1.5, letterSpacing: 0.5 }}
                                    >
                                        {course.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {course.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden"
                                            >
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
                                </>
                            ) : (
                                <>
                                    <h3
                                        className="text-xl font-semibold mb-4 text-neutral-100"
                                        style={{ lineHeight: 1.5, letterSpacing: 0.5 }}
                                    >
                                        {courseData?.query} FAQs
                                    </h3>
                                    <div className="space-y-4">
                                        {course.faqs?.map((faq, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden"
                                            >
                                                {/* Question Header */}
                                                <div
                                                    onClick={() =>
                                                        setOpenLesson(openLesson === `faq-${idx}` ? "" : `faq-${idx}`)
                                                    }
                                                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                                                >
                                                    <p className="font-medium text-neutral-200">{faq.Question}</p>
                                                    <span className="text-sm text-neutral-500">
                                                        {openLesson === `faq-${idx}` ? "▲" : "▼"}
                                                    </span>
                                                </div>

                                                {/* Answers */}
                                                {openLesson === `faq-${idx}` && (
                                                    <div className="px-5 pb-5 pt-3 text-[18px] leading-relaxed text-neutral-300 bg-neutral-950/60 border-t border-neutral-800 space-y-2">
                                                        {(() => {
                                                            const answered = faqAnswers[idx]?.selected !== null && faqAnswers[idx]?.selected !== undefined;
                                                            const selectedIdx = faqAnswers[idx]?.selected ?? null;
                                                            const isCorrectSel = faqAnswers[idx]?.correct === true;
                                                            const correctIdx = faq.Answer.findIndex((a) => a.correct);
                                                            return faq.Answer.map((ans, i) => {
                                                                const isSelected = selectedIdx === i;
                                                                let classes = "px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/40 hover:bg-neutral-800 transition cursor-pointer";
                                                                if (answered) {
                                                                    classes += " pointer-events-none";
                                                                    if (isCorrectSel && isSelected) {
                                                                        classes = "px-3 py-2 rounded-lg bg-green-700/40 text-green-300 border border-green-600/40";
                                                                    } else if (!isCorrectSel && isSelected) {
                                                                        classes = "px-3 py-2 rounded-lg bg-red-700/40 text-red-300 border border-red-600/40";
                                                                    } else if (!isCorrectSel && i === correctIdx) {
                                                                        classes = "px-3 py-2 rounded-lg bg-green-700/40 text-green-300 border border-green-600/40";
                                                                    }
                                                                }
                                                                return (
                                                                    <div key={i} className={classes} onClick={() => handleSelectOption(idx, i)}>
                                                                        {ans.text}
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    {!showFAQs ? (
                        <button
                            onClick={() => {
                                setShowFAQs(true);
                                setOpenLesson("");
                            }}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer"
                        >
                            Next
                        </button>
                    ) : (
                        allFAQsAnswered && (
                            <button
                                onClick={() => router.push("/")}
                                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition cursor-pointer"
                            >
                                Complete
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}