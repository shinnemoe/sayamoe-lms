import { Exercise, QuizType } from '@/types';

interface QuizVariation {
    type: QuizType;
    question: string;
    options?: string[];
    correctAnswer: string | boolean;
}

export function generateQuizVariations(exercise: Exercise): QuizVariation[] {
    const variations: QuizVariation[] = [];

    // 1. Multiple Choice
    variations.push({
        type: 'multipleChoice',
        question: exercise.question,
        options: [
            exercise.correctAnswer,
            ...(exercise.distractors || generateDistractors(exercise.correctAnswer))
        ].sort(() => Math.random() - 0.5),
        correctAnswer: exercise.correctAnswer
    });

    // 2. True/False
    variations.push({
        type: 'trueFalse',
        question: `${exercise.question} - "${exercise.correctAnswer}"`,
        correctAnswer: true
    });

    // 3. Unscramble
    variations.push({
        type: 'unscramble',
        question: exercise.question,
        options: scrambleWords(exercise.correctAnswer),
        correctAnswer: exercise.correctAnswer
    });

    return variations;
}

function generateDistractors(correctAnswer: string): string[] {
    // Simple distractor generation - can be improved
    const words = correctAnswer.split(' ');
    return [
        words.reverse().join(' '),
        words.map(w => w.split('').reverse().join('')).join(' '),
        'Not ' + correctAnswer
    ].slice(0, 3);
}

function scrambleWords(text: string): string[] {
    const words = text.split(' ');
    return words.sort(() => Math.random() - 0.5);
}

export function checkAnswer(
    userAnswer: string | boolean,
    correctAnswer: string | boolean,
    type: QuizType
): boolean {
    if (type === 'trueFalse') {
        return userAnswer === correctAnswer;
    }

    if (type === 'unscramble') {
        return userAnswer.toString().toLowerCase().trim() ===
            correctAnswer.toString().toLowerCase().trim();
    }

    return userAnswer === correctAnswer;
}
