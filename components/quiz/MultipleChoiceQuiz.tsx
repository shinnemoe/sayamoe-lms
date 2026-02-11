'use client';

import { useState } from 'react';
import { MultipleChoiceOption } from '@/types';
import { findBestIcon } from '@/lib/iconMapper';

interface Props {
    question: string;
    options: string[] | MultipleChoiceOption[];  // Support both old and new formats
    correctAnswer: string;
    explanation?: string;
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function MultipleChoiceQuiz({ question, options, correctAnswer, explanation, onAnswer, showResult, isCorrect }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    // Normalize options to always have both text and icon
    // This handles backwards compatibility with existing quizzes
    const normalizedOptions = options.map((opt, index) => {
        if (typeof opt === 'string') {
            // Old format: just a string array
            return { text: opt, icon: findBestIcon(opt) };
        }
        // New format: option object, but icon might be missing
        return {
            text: opt.text,
            icon: opt.icon || findBestIcon(opt.text)
        };
    });

    const handleSelect = (option: string) => {
        if (showResult) return;
        setSelectedAnswer(option);
        onAnswer(option);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{question}</h2>

            <div className="grid grid-cols-2 gap-4">
                {normalizedOptions.map((option, index) => {
                    const isSelected = selectedAnswer === option.text;
                    const isCorrectOption = option.text === correctAnswer;

                    let cardClass = 'bg-gradient-to-br from-white to-gray-50 hover:from-indigo-50 hover:to-purple-50 shadow-lg hover:shadow-2xl';

                    if (showResult) {
                        if (isCorrectOption) {
                            cardClass = 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl scale-105';
                        } else if (isSelected && !isCorrect) {
                            cardClass = 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-2xl';
                        } else {
                            cardClass = 'bg-gray-100 opacity-50';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(option.text)}
                            disabled={showResult}
                            className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${cardClass}`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="text-4xl">{option.icon}</div>
                                <div className={`text-base font-semibold text-center ${showResult && (isCorrectOption || (isSelected && !isCorrect)) ? 'text-white' : 'text-gray-800'
                                    }`}>
                                    {option.text}
                                </div>
                                {showResult && isCorrectOption && (
                                    <div className="text-2xl">✓</div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <div className={`mt-6 p-4 rounded-2xl ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className="text-center font-bold text-2xl mb-2">
                        {isCorrect ? '✅ Correct!' : `❌ Wrong! Correct answer: ${correctAnswer}`}
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
