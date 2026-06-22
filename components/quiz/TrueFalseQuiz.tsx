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
            <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--text-primary)',
                marginBottom: 32,
                lineHeight: 1.4,
            }}>
                {question}
            </h2>

            {!showResult ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <button
                        onClick={() => onAnswer(true)}
                        style={{
                            padding: '24px 16px',
                            background: 'rgba(34,211,94,0.1)',
                            border: '1.5px solid rgba(34,211,94,0.4)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,94,0.2)';
                            (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(34,211,94,0.25)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,94,0.1)';
                            (e.currentTarget as HTMLElement).style.transform = '';
                            (e.currentTarget as HTMLElement).style.boxShadow = '';
                        }}
                    >
                        <span style={{ fontSize: 36 }}>✓</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#4ADE80', letterSpacing: 1 }}>TRUE</span>
                    </button>
                    <button
                        onClick={() => onAnswer(false)}
                        style={{
                            padding: '24px 16px',
                            background: 'rgba(255,92,115,0.1)',
                            border: '1.5px solid rgba(255,92,115,0.4)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,92,115,0.2)';
                            (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255,92,115,0.25)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,92,115,0.1)';
                            (e.currentTarget as HTMLElement).style.transform = '';
                            (e.currentTarget as HTMLElement).style.boxShadow = '';
                        }}
                    >
                        <span style={{ fontSize: 36 }}>✗</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#FF8FA3', letterSpacing: 1 }}>FALSE</span>
                    </button>
                </div>
            ) : (
                <div className="animate-fadeInUp" style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    background: isCorrect ? 'rgba(34,211,94,0.1)' : 'rgba(255,92,115,0.1)',
                    border: `1px solid ${isCorrect ? 'rgba(34,211,94,0.3)' : 'rgba(255,92,115,0.3)'}`,
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: isCorrect ? '#4ADE80' : '#FF8FA3',
                        marginBottom: 14,
                    }}>
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                    </div>
                    <button
                        onClick={() => speakText(`${question}. The answer is ${correctAnswer}.`)}
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
