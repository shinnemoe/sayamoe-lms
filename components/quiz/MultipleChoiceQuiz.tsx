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

    const normalizedOptions = options.map((opt) => {
        if (typeof opt === 'string') return { text: opt, icon: findBestIcon(opt) };
        return { text: opt.text, icon: opt.icon || findBestIcon(opt.text) };
    });

    const handleSelect = (option: string) => {
        if (showResult) return;
        setSelectedAnswer(option);
        onAnswer(option);
    };

    // Strip instruction prefixes like "Fill in the blank:" so TTS only reads the actual sentence.
    const sentencePart = question.includes(':') && question.includes('_')
        ? question.substring(question.indexOf(':') + 1).trim()
        : question;
    const fullSentence = sentencePart.includes('_')
        ? sentencePart.replace(/_+/g, correctAnswer)
        : `${sentencePart} ${correctAnswer}`;

    return (
        <div>
            <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--text-primary)',
                marginBottom: 28,
                lineHeight: 1.4,
            }}>
                {question}
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
            }}>
                {normalizedOptions.map((option, index) => {
                    const isSelected = selectedAnswer === option.text;
                    const isCorrectOption = option.text === correctAnswer;

                    let bg = 'var(--bg-card)';
                    let border = 'var(--border-subtle)';
                    let textColor = 'var(--text-primary)';
                    let glow = 'none';
                    let scale = '1';

                    if (showResult) {
                        if (isCorrectOption) {
                            bg = 'rgba(34,211,94,0.15)';
                            border = 'rgba(34,211,94,0.6)';
                            glow = '0 0 16px rgba(34,211,94,0.3)';
                            textColor = '#4ADE80';
                            scale = '1.03';
                        } else if (isSelected && !isCorrect) {
                            bg = 'rgba(255,92,115,0.15)';
                            border = 'rgba(255,92,115,0.5)';
                            textColor = '#FF8FA3';
                        } else {
                            bg = 'var(--bg-elevated)';
                            border = 'var(--border-subtle)';
                            textColor = 'var(--text-muted)';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(option.text)}
                            disabled={showResult}
                            style={{
                                background: bg,
                                border: `1.5px solid ${border}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '16px 12px',
                                cursor: showResult ? 'default' : 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transform: `scale(${scale})`,
                                boxShadow: glow,
                                fontFamily: 'inherit',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 10,
                            }}
                            onMouseEnter={e => {
                                if (!showResult) {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!showResult) {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }
                            }}
                        >
                            <div style={{ fontSize: 36 }}>{option.icon}</div>
                            <div style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: textColor,
                                textAlign: 'center',
                                lineHeight: 1.3,
                            }}>
                                {option.text}
                            </div>
                            {showResult && isCorrectOption && (
                                <div style={{ fontSize: 18 }}>✓</div>
                            )}
                            {showResult && isSelected && !isCorrect && option.text === selectedAnswer && (
                                <div style={{ fontSize: 18 }}>✗</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <div className="animate-fadeInUp" style={{
                    marginTop: 20,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(34,211,94,0.1)' : 'rgba(255,92,115,0.1)',
                    border: `1px solid ${isCorrect ? 'rgba(34,211,94,0.3)' : 'rgba(255,92,115,0.3)'}`,
                }}>
                    <div style={{
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: 800,
                        color: isCorrect ? '#4ADE80' : '#FF8FA3',
                        marginBottom: 10,
                    }}>
                        {isCorrect ? '✅ Correct!' : `❌ Answer: ${correctAnswer}`}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <p style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            margin: 0,
                        }}>
                            {fullSentence}
                        </p>
                        <button
                            onClick={() => speakText(fullSentence)}
                            style={{
                                display: 'flex',
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
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Volume2 size={16} />
                            Listen
                        </button>
                    </div>
                    {!isCorrect && explanation && (
                        <div style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid rgba(255,92,115,0.2)',
                            fontSize: 13,
                            color: '#FF8FA3',
                        }}>
                            <span style={{ fontWeight: 700 }}>💡 Explanation:</span> {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
