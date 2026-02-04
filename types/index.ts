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
    emoji?: string;  // Optional custom emoji for topic
    classIds: string[];
    teacherId: string;
    createdAt: Date;
}

// Multiple Choice Answer Option (with optional icon/image)
export interface MultipleChoiceOption {
    text: string;
    icon?: string;      // Lucide icon name (e.g., "Apple", "GraduationCap")
    imageUrl?: string;  // Custom image URL from Firebase Storage
}

export interface Exercise {
    id: string;
    topicId: string;
    quizType: 'multipleChoice' | 'unscramble' | 'trueFalse';

    // Common fields
    order: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    hints?: string;
    explanation?: string;  // Explanation shown when answer is wrong
    uploadBatchId?: string;  // Groups exercises from same CSV upload
    batchEmoji?: string;  // Optional custom emoji for all options in this batch
    createdAt: Date;

    // Multiple Choice fields
    mcQuestion?: string;
    mcOptions?: MultipleChoiceOption[];
    mcCorrectAnswerIndex?: number;

    // Unscramble fields
    unscrambleQuestion?: string;  // Main context/question
    unscramblePrompt?: string;    // Instructions like "Arrange the words"
    unscrambleAnswer?: string;

    // True/False fields
    tfStatement?: string;
    tfAnswer?: boolean;

    // Backward compatibility (deprecated)
    question?: string;
    correctAnswer?: string;
    distractors?: string[];
}

export interface Score {
    id: string;
    studentId: string;
    topicId: string;
    quizType: string;  // Track score per quiz type
    score: number;
    maxScore: number;
    attempts: number;
    lastAttempt: Date;
    bestScore?: number;  // Best score across all attempts
}

export type QuizType = 'unscramble' | 'trueFalse' | 'multipleChoice';
