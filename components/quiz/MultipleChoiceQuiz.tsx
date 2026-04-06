'use client';

import { useState } from 'react';
import { MultipleChoiceOption } from '@/types';
import { findBestIcon } from '@/lib/iconMapper';
import { speakText } from '@/lib/audioUtils';
import { Volume2 } from 'lucide-react';

interface Props {
    question: string;
    options: string[] | MultipleChoiceOption[];
    correctAnswer: string;
    explanation?: string;
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function MultipleChoiceQuiz({ question, options, correctAnswer, explanation, onAnswer, showResult, isCorrect }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    // Normalize options to always have both text and icon
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === 'string') {
            return { text: opt, icon: findBestIcon(opt) };
        }
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

    // Build full sentence for playback: replace blank(s) with the correct answer
    const fullSentence = question.includes('_')
        ? question.replace(/_+/g, correctAnswer)
        : `${question} ${correctAnswer}`;

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
                                <div className={`text-base font-semibold text-center ${showResult && (isCorrectOption || (isSelected && !isCorrect)) ? 'text-white' : 'text-gray-800'}`}>
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
                    <div className="flex flex-col items-center gap-2 mt-3">
                        <p className="text-sm text-center italic opacity-80">{fullSentence}</p>
                        <button
                            onClick={() => speakText(fullSentence)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 shadow-md transition-all hover:shadow-lg"
                            title="Listen to full sentence"
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
