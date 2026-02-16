'use client';

import { speakText } from '@/lib/audioUtils';
import { Volume2 } from 'lucide-react';

interface Props {
    question: string;
    explanation?: string;
    onAnswer: (answer: boolean) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function TrueFalseQuiz({ question, explanation, onAnswer, showResult, isCorrect }: Props) {
    const correctAnswer = showResult ? (isCorrect ? 'True' : 'False') : '';

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{question}</h2>

            {!showResult ? (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onAnswer(true)}
                        className="py-6 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-2xl font-bold"
                    >
                        ✓ TRUE
                    </button>
                    <button
                        onClick={() => onAnswer(false)}
                        className="py-6 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-2xl font-bold"
                    >
                        ✗ FALSE
                    </button>
                </div>
            ) : (
                <div className={`p-6 rounded-2xl ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className="text-center font-bold text-2xl mb-2">
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </div>
                    <div className="flex justify-center mt-3">
                        <button
                            onClick={() => speakText(`${question}. The answer is ${correctAnswer}.`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 shadow-md transition-all hover:shadow-lg"
                            title="Listen to answer"
                        >
                            <Volume2 className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-semibold text-gray-700">Listen</span>
                        </button>
                    </div>
                    {!isCorrect && explanation && (
                        <div className="text-base text-red-600 mt-3 pt-3 border-t border-red-300">
                            <span className="font-semibold">💡 Explanation:</span> {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
