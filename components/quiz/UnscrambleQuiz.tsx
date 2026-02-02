'use client';

import { useState } from 'react';

interface Props {
    question: string;
    words: string[];
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function UnscrambleQuiz({ question, words, onAnswer, showResult, isCorrect }: Props) {
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>(words);

    const handleWordClick = (word: string, fromAvailable: boolean) => {
        if (showResult) return;

        if (fromAvailable) {
            setSelectedWords([...selectedWords, word]);
            setAvailableWords(availableWords.filter(w => w !== word));
        } else {
            setAvailableWords([...availableWords, word]);
            setSelectedWords(selectedWords.filter(w => w !== word));
        }
    };

    const handleSubmit = () => {
        onAnswer(selectedWords.join(' '));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{question}</h2>

            {/* Selected Words Area */}
            <div className="min-h-[100px] bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-dashed border-indigo-300">
                <div className="flex flex-wrap gap-2">
                    {selectedWords.length === 0 ? (
                        <p className="text-gray-400 text-center w-full">Tap words below to build your answer</p>
                    ) : (
                        selectedWords.map((word, index) => (
                            <button
                                key={index}
                                onClick={() => handleWordClick(word, false)}
                                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-all font-medium"
                                disabled={showResult}
                            >
                                {word}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Available Words */}
            <div className="flex flex-wrap gap-2 mb-6">
                {availableWords.map((word, index) => (
                    <button
                        key={index}
                        onClick={() => handleWordClick(word, true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all font-medium"
                        disabled={showResult}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {!showResult && selectedWords.length > 0 && (
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                    Submit Answer
                </button>
            )}

            {showResult && (
                <div className={`p-4 rounded-xl text-center font-bold text-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isCorrect ? '✅ Correct!' : `❌ Wrong! Correct answer: "${words.join(' ')}"`}
                </div>
            )}
        </div>
    );
}
