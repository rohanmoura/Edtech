// data/mockCourses.ts

export interface Lesson {
    id: string;
    order: number;
    lesson: string;
    explanation: string;
    completed: boolean;
}

export interface Course {
    id: string;
    title: string;
    completed: boolean;
    progress: number;
    lessons: Lesson[];
}

export interface MockCourseData {
    query: string;
    image: string;
    timestamp: string;
    courses: Course[];
}

export const mockCourseData: MockCourseData = {
    query: "react",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    timestamp: "2025-09-20T13:00:00+05:30",
    courses: [
        {
            id: "react-course-001",
            title: "React is a popular JavaScript library developed by Facebook for building fast, interactive, and component-based user interfaces. At its core, React uses components—reusable pieces of UI logic and design—that manage their own state and can be combined to create complex applications. Learning React fundamentals starts with understanding JSX (a syntax extension that lets you write HTML-like code in JavaScript), components (functional and class-based), props (for passing data between components), and state (for handling dynamic data inside a component). React also introduces concepts like hooks (e.g., useState, useEffect) for managing state and side effects in functional components, and routing (via libraries like React Router) to create multi-page applications. For styling, developers can use CSS, styled-components, or UI libraries. Once the app is built, the next step is optimization and deployment. React apps are bundled (usually with tools like Webpack or Vite) and can be deployed to hosting services such as Vercel, Netlify, or GitHub Pages for free, or cloud providers like AWS, Azure, and Firebase for scalable hosting. From fundamentals to deployment, the React workflow teaches you how to design modular UIs, manage data flow efficiently, and bring your application live for real-world users.",
            completed: false,
            progress: 0.2,
            lessons: [
                {
                    id: "r-01",
                    order: 1,
                    lesson: "Introduction to React & JSX",
                    explanation: "React is an open-source JavaScript library used for building dynamic and interactive user interfaces, especially single-page applications (SPAs). Instead of directly manipulating the DOM, React uses a virtual DOM, which makes updates faster and more efficient. The building blocks of React are components, which are small, reusable pieces of UI that can be combined to create complex applications. To make writing components easier, React introduces JSX (JavaScript XML), a syntax extension that allows developers to write HTML-like code inside JavaScript. JSX improves readability and makes UI structure easier to visualize, while still being converted into JavaScript under the hood. For example, instead of using React.createElement, developers can simply write <h1>Hello World</h1> inside their component. JSX also allows embedding JavaScript expressions with curly braces { }, enabling dynamic rendering of values, conditions, and lists. Together, React and JSX provide a powerful, declarative, and intuitive way to build modern web applications with cleaner and more maintainable code..",
                    completed: true,
                },
                {
                    id: "r-02",
                    order: 2,
                    lesson: "Components & Props",
                    explanation: "In React, one of the biggest strengths lies in creating reusable components, which are independent, self-contained pieces of UI that can be reused across different parts of an application. For example, a button, a card, or a navigation bar can be written once and used multiple times, ensuring consistency and reducing duplication. To make components dynamic, React uses props (properties), which allow data to be passed from a parent component to a child component. Props are read-only, meaning the child component cannot change them, ensuring predictable data flow. For instance, a Card component can accept props like title and description to render different content while keeping the structure the same. Beyond props, React also supports composition patterns, where components can be combined or nested to create more flexible and scalable UIs. A common composition pattern is using children props, which allows developers to pass JSX or even other components inside a component, making layouts more modular. These techniques together enable developers to build applications that are scalable, maintainable, and easy to extend by reusing building blocks instead of rewriting code.",
                    completed: true,
                },
                // …continue adding the rest of lessons (r-03 to r-10)
            ],
        },
    ],
};
