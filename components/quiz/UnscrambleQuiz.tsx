'use client';

import { useState, useEffect } from 'react';
import { speakText } from '@/lib/audioUtils';
import { Volume2, RotateCcw } from 'lucide-react';

interface WordInstance {
    text: string;
    instanceId: number;
    displayIndex?: number;
}

interface Props {
    question: string;
    prompt?: string;
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

    const processWords = (wordList: typeof words) => {
        const wordInstances: WordInstance[] = [];
        const wordCounts: { [key: string]: number } = {};
        const wordArray = wordList.map(w => typeof w === 'string' ? w : w.text);
        wordArray.forEach(word => { wordCounts[word] = (wordCounts[word] || 0) + 1; });
        const instanceCounts: { [key: string]: number } = {};
        wordArray.forEach((word, index) => {
            instanceCounts[word] = (instanceCounts[word] || 0) + 1;
            wordInstances.push({
                text: word,
                instanceId: index,
                displayIndex: wordCounts[word] > 1 ? instanceCounts[word] : undefined,
            });
        });
        return wordInstances;
    };

    useEffect(() => {
        setAvailableWords(processWords(words));
        setSelectedWords([]);
    }, [words]);

    useEffect(() => {
        if (!showResult) {
            setAvailableWords(processWords(words));
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

    const handleClear = () => {
        setAvailableWords(processWords(words));
        setSelectedWords([]);
    };

    const handleSubmit = () => {
        onAnswer(selectedWords.map(w => w.text).join(' '));
    };

    const subscriptNumbers = ['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

    const renderWord = (word: WordInstance) => (
        <>
            {word.text}
            {word.displayIndex && (
                <span style={{ fontSize: '0.65em', opacity: 0.5, marginLeft: 1 }}>
                    {subscriptNumbers[word.displayIndex - 1] || word.displayIndex}
                </span>
            )}
        </>
    );

    return (
        <div>
            <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 6,
                lineHeight: 1.4,
            }}>
                {question}
            </h2>
            {prompt && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{prompt}</p>
            )}

            {/* Answer drop zone */}
            <div style={{
                minHeight: 80,
                borderRadius: 'var(--radius-md)',
                padding: 14,
                marginBottom: 16,
                border: `2px dashed ${showResult
                    ? isCorrect ? 'rgba(34,211,94,0.5)' : 'rgba(255,92,115,0.5)'
                    : 'var(--border-accent)'}`,
                background: showResult
                    ? isCorrect ? 'rgba(34,211,94,0.06)' : 'rgba(255,92,115,0.06)'
                    : 'rgba(124,110,247,0.05)',
                transition: 'all 0.3s ease',
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 44, alignItems: 'center' }}>
                    {showResult ? (
                        correctAnswer.split(' ').map((word, index) => (
                            <span
                                key={index}
                                className="animate-fadeInUp"
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    background: isCorrect ? 'rgba(34,211,94,0.15)' : 'rgba(255,92,115,0.15)',
                                    color: isCorrect ? '#4ADE80' : '#FF8FA3',
                                    border: `1px solid ${isCorrect ? 'rgba(34,211,94,0.3)' : 'rgba(255,92,115,0.3)'}`,
                                    animationDelay: `${index * 0.04}s`,
                                }}
                            >
                                {word}
                            </span>
                        ))
                    ) : selectedWords.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, width: '100%', textAlign: 'center', margin: 0 }}>
                            Tap words below to build your answer
                        </p>
                    ) : (
                        selectedWords.map((word) => (
                            <button
                                key={word.instanceId}
                                onClick={() => handleWordClick(word, false)}
                                style={{
                                    padding: '8px 14px',
                                    background: 'var(--bg-elevated)',
                                    border: '1.5px solid var(--border-accent)',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,92,115,0.15)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,92,115,0.5)';
                                    (e.currentTarget as HTMLElement).style.color = '#FF8FA3';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                                }}
                            >
                                {renderWord(word)}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Available words */}
            {!showResult && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {availableWords.map((word) => (
                        <button
                            key={word.instanceId}
                            onClick={() => handleWordClick(word, true)}
                            style={{
                                padding: '8px 14px',
                                background: 'var(--bg-card)',
                                border: '1.5px solid var(--border-subtle)',
                                borderRadius: 10,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 14,
                                color: 'var(--text-secondary)',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(124,110,247,0.15)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                                (e.currentTarget as HTMLElement).style.transform = '';
                            }}
                        >
                            {renderWord(word)}
                        </button>
                    ))}
                </div>
            )}

            {/* Action buttons */}
            {!showResult && selectedWords.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                        onClick={handleClear}
                        style={{
                            padding: '12px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <RotateCcw size={14} />
                        Clear
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        style={{ flex: 1, padding: '12px 16px' }}
                    >
                        Submit Answer
                    </button>
                </div>
            )}

            {/* Result */}
            {showResult && (
                <div className="animate-fadeInUp" style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(34,211,94,0.1)' : 'rgba(255,92,115,0.1)',
                    border: `1px solid ${isCorrect ? 'rgba(34,211,94,0.3)' : 'rgba(255,92,115,0.3)'}`,
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: isCorrect ? '#4ADE80' : '#FF8FA3',
                        marginBottom: 10,
                    }}>
                        {isCorrect ? '✅ Correct!' : `❌ Correct answer: "${correctAnswer}"`}
                    </div>
                    <button
                        onClick={() => speakText(correctAnswer)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 10,
                            cursor: 'pointer',
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            fontSize: 13,
                            fontFamily: 'inherit',
                        }}
                    >
                        <Volume2 size={16} />
                        Listen
                    </button>
                    {!isCorrect && explanation && (
                        <div style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid rgba(255,92,115,0.2)',
                            fontSize: 13,
                            color: '#FF8FA3',
                            textAlign: 'left',
                        }}>
                            <span style={{ fontWeight: 700 }}>💡 Explanation:</span> {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
