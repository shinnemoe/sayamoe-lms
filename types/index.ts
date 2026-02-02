export interface User {
    uid: string;
    email: string;
    role: 'teacher' | 'student';
    name: string;
    classId?: string;
    createdAt: Date;
}

export interface Class {
    id: string;
    name: string;
    level: string;
    teacherId: string;
    studentIds: string[];
    createdAt: Date;
}

export interface Topic {
    id: string;
    name: string;
    description: string;
    classIds: string[];
    teacherId: string;
    createdAt: Date;
}

export interface Exercise {
    id: string;
    topicId: string;
    question: string;
    correctAnswer: string;
    distractors?: string[];
    order: number;
    createdAt: Date;
}

export interface Score {
    id: string;
    studentId: string;
    topicId: string;
    score: number;
    maxScore: number;
    attempts: number;
    lastAttempt: Date;
}

export type QuizType = 'unscramble' | 'trueFalse' | 'multipleChoice';
