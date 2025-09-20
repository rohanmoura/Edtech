"use client";

import { useState } from "react";
import { mockCourseData } from "@/lib/dara";
import ProfessorAvatar from "@/component/ProfessorAvatar";

export default function CoursePage() {
    const [openLesson, setOpenLesson] = useState("r-01"); // Lesson 1 open by default

    const toggleLesson = (id: string) => {
        setOpenLesson(openLesson === id ? "" : id);
    };

    return (
        <div className="min-h-screen bg-black/[0.96] text-neutral-200 py-12 px-6 md:px-12 lg:px-20 relative">
            {/* Grid pattern background (same as homepage) */}
            <div
                className="pointer-events-none absolute inset-0 [background-size:40px_40px] select-none
        [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),
        linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
            />

            <div className="relative z-10 max-w-6xl mx-auto space-y-12">
                {/* Course Header */}
                <div className="flex flex-col lg:flex-row items-center gap-8">
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
                            Master {mockCourseData.query} with structured lessons, interactive
                            projects, and real-world examples.
                        </p>
                    </div>
                    <ProfessorAvatar />
                </div>

                {/* Lessons */}
                <div className="space-y-8">
                    {mockCourseData.courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/10 transition-shadow"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-neutral-100" style={{
                                lineHeight: 1.5,
                                letterSpacing: 0.5,
                            }}>
                                {course.title}
                            </h3>

                            <div className="space-y-4">
                                {course.lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden"
                                    >
                                        {/* Lesson Header */}
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

                                        {/* Lesson Explanation */}
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
