'use client';

import { useState } from 'react';

interface Props {
    question: string;
    options: string[];
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

const icons = ['🎓', '✏️', '📚', '🎯'];

export default function MultipleChoiceQuiz({ question, options, onAnswer, showResult, isCorrect }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    const handleSelect = (option: string) => {
        if (showResult) return;
        setSelectedAnswer(option);
        onAnswer(option);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{question}</h2>

            <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        disabled={showResult}
                        className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${showResult && selectedAnswer === option
                                ? isCorrect
                                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl scale-105'
                                    : 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-2xl scale-105'
                                : showResult
                                    ? 'bg-gray-100 opacity-50'
                                    : 'bg-gradient-to-br from-white to-gray-50 hover:from-indigo-50 hover:to-purple-50 shadow-lg hover:shadow-2xl'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-5xl">{icons[index]}</div>
                            <div className={`text-lg font-semibold text-center ${showResult && selectedAnswer === option ? 'text-white' : 'text-gray-800'
                                }`}>
                                {option}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={`mt-6 p-6 rounded-2xl text-center font-bold text-2xl ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isCorrect ? '✅ Correct!' : '❌ Try Again!'}
                </div>
            )}
        </div>
    );
}
