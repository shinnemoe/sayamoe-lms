'use client';

import { useState, useEffect } from 'react';

interface WordInstance {
    text: string;
    instanceId: number;
    displayIndex?: number; // For showing to the user (e.g., Ko₁, Ko₂)
}

interface Props {
    question: string;
    prompt?: string;  // Optional instruction like "Arrange the words"
    words: string[] | WordInstance[];
    correctAnswer: string;
    explanation?: string;
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function UnscrambleQuiz({ question, prompt, words, correctAnswer, explanation, onAnswer, showResult, isCorrect }: Props) {
    const [selectedWords, setSelectedWords] = useState<WordInstance[]>([]);
    const [availableWords, setAvailableWords] = useState<WordInstance[]>([]);

    // Process words and add instance IDs on component mount or when words change
    useEffect(() => {
        // Convert string array to WordInstance array if needed
        const wordInstances: WordInstance[] = [];
        const wordCounts: { [key: string]: number } = {};

        const wordArray = words.map(w => typeof w === 'string' ? w : w.text);

        wordArray.forEach((word, index) => {
            if (!wordCounts[word]) {
                wordCounts[word] = 0;
            }
            wordCounts[word]++;
        });

        // Create instances with display indices for duplicates
        const instanceCounts: { [key: string]: number } = {};
        wordArray.forEach((word, index) => {
            if (!instanceCounts[word]) {
                instanceCounts[word] = 0;
            }
            instanceCounts[word]++;

            const hasDuplicates = wordCounts[word] > 1;
            wordInstances.push({
                text: word,
                instanceId: index,
                displayIndex: hasDuplicates ? instanceCounts[word] : undefined
            });
        });

        setAvailableWords(wordInstances);
        setSelectedWords([]);
    }, [words]);

    // Reset state when question changes (when showResult becomes false)
    useEffect(() => {
        if (!showResult) {
            // Re-process words
            const wordInstances: WordInstance[] = [];
            const wordCounts: { [key: string]: number } = {};

            const wordArray = words.map(w => typeof w === 'string' ? w : w.text);

            wordArray.forEach((word, index) => {
                if (!wordCounts[word]) {
                    wordCounts[word] = 0;
                }
                wordCounts[word]++;
            });

            const instanceCounts: { [key: string]: number } = {};
            wordArray.forEach((word, index) => {
                if (!instanceCounts[word]) {
                    instanceCounts[word] = 0;
                }
                instanceCounts[word]++;

                const hasDuplicates = wordCounts[word] > 1;
                wordInstances.push({
                    text: word,
                    instanceId: index,
                    displayIndex: hasDuplicates ? instanceCounts[word] : undefined
                });
            });

            setAvailableWords(wordInstances);
            setSelectedWords([]);
        }
    }, [showResult, words]);

    const handleWordClick = (word: WordInstance, fromAvailable: boolean) => {
        if (showResult) return;

        if (fromAvailable) {
            setSelectedWords([...selectedWords, word]);
            setAvailableWords(availableWords.filter(w => w.instanceId !== word.instanceId));
        } else {
            setAvailableWords([...availableWords, word]);
            setSelectedWords(selectedWords.filter(w => w.instanceId !== word.instanceId));
        }
    };

    const handleSubmit = () => {
        // Strip instance IDs and build answer
        const answer = selectedWords.map(w => w.text).join(' ');
        onAnswer(answer);
    };

    const subscriptNumbers = ['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

    const renderWord = (word: WordInstance) => {
        return (
            <>
                {word.text}
                {word.displayIndex && (
                    <span className="text-xs opacity-60 ml-0.5">
                        {subscriptNumbers[word.displayIndex - 1] || word.displayIndex}
                    </span>
                )}
            </>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">{question}</h2>
            {prompt && <p className="text-gray-600 mb-6 text-lg">{prompt}</p>}

            {/* Selected Words Area */}
            <div className="min-h-[100px] bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-dashed border-indigo-300">
                <div className="flex flex-wrap gap-2">
                    {selectedWords.length === 0 ? (
                        <p className="text-gray-400 text-center w-full">Tap words below to build your answer</p>
                    ) : (
                        selectedWords.map((word) => (
                            <button
                                key={word.instanceId}
                                onClick={() => handleWordClick(word, false)}
                                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-all font-medium"
                                disabled={showResult}
                            >
                                {renderWord(word)}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Available Words */}
            <div className="flex flex-wrap gap-2 mb-6">
                {availableWords.map((word) => (
                    <button
                        key={word.instanceId}
                        onClick={() => handleWordClick(word, true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all font-medium"
                        disabled={showResult}
                    >
                        {renderWord(word)}
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
                <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className="text-center font-bold text-lg mb-2">
                        {isCorrect ? '✅ Correct!' : `❌ Wrong! Correct answer: "${correctAnswer}"`}
                    </div>
                    {!isCorrect && explanation && (
                        <div className="text-sm text-red-600 mt-2 pt-2 border-t border-red-300">
                            <span className="font-semibold">💡 Explanation:</span> {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
