'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { RotateCcw, Home, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import confetti from 'canvas-confetti';

interface QuizResults {
    score: number;
    total: number;
    answers: Array<{
        exerciseId: string;
        userAnswer: string | boolean;
        correctAnswer: string | boolean;
        isCorrect: boolean;
    }>;
    timeTaken: number;
}

export default function ResultsPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.topicId as string;
    const quizType = params.type as string;

    const [results, setResults] = useState<QuizResults | null>(null);
    const [previousBestScore, setPreviousBestScore] = useState<number | null>(null);
    const [saving, setSaving] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        // Get results from sessionStorage
        const resultsData = sessionStorage.getItem('quizResults');
        if (!resultsData) {
            router.push(`/student/topic/${topicId}`);
            return;
        }

        const parsedResults = JSON.parse(resultsData) as QuizResults;
        setResults(parsedResults);

        // Save score to Firestore
        await saveScore(parsedResults);

        // Trigger confetti for perfect score or new best
        const percentage = (parsedResults.score / parsedResults.total) * 100;
        if (percentage === 100) {
            triggerConfetti();
        }

        setSaving(false);
    };

    const saveScore = async (resultsData: QuizResults) => {
        if (!auth.currentUser) return;

        try {
            const scoreId = `${auth.currentUser.uid}_${topicId}_${quizType}`;
            const scoreRef = doc(db, 'scores', scoreId);
            const existingScore = await getDoc(scoreRef);

            let bestScore = resultsData.score;
            let attempts = 1;

            if (existingScore.exists()) {
                const data = existingScore.data();
                attempts = (data.attempts || 0) + 1;
                setPreviousBestScore(data.bestScore || data.score);
                bestScore = Math.max(resultsData.score, data.bestScore || data.score);

                // Trigger confetti for new best score
                if (resultsData.score > (data.bestScore || data.score)) {
                    setTimeout(() => triggerConfetti(), 500);
                }
            }

            const newScore = {
                studentId: auth.currentUser.uid,
                topicId,
                quizType,
                score: resultsData.score,
                maxScore: resultsData.total,
                bestScore: bestScore,
                attempts: attempts,
                lastAttempt: new Date()
            };

            await setDoc(scoreRef, newScore);

            // Get user name
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserName(userDoc.data().name || '');
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const handleRetake = () => {
        sessionStorage.removeItem('quizResults');
        router.push(`/student/quiz/${topicId}/${quizType}`);
    };

    if (saving || !results) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>💾</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600 }}>Saving results...</div>
                </div>
            </div>
        );
    }

    const percentage = Math.round((results.score / results.total) * 100);
    const isNewBest = previousBestScore !== null && results.score > previousBestScore;
    const isPerfect = percentage === 100;

    const scoreColor = isPerfect ? '#4ADE80' : percentage >= 70 ? '#A78BFA' : percentage >= 50 ? '#60A5FA' : '#FF8FA3';

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 40 }}>
            <Navbar userRole="student" userName={userName} />

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>

                {/* Trophy Header */}
                <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `rgba(${isPerfect ? '74,222,128' : '124,110,247'},0.15)`,
                        border: `2px solid ${scoreColor}40`,
                        fontSize: 36,
                        marginBottom: 16,
                    }}>
                        {isPerfect ? '👑' : '🏆'}
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                        Quiz Complete! 🎉
                    </h1>
                    {isPerfect && (
                        <p style={{ color: '#4ADE80', fontWeight: 700, fontSize: 15, margin: 0 }}>Perfect Score! 🌟</p>
                    )}
                    {isNewBest && !isPerfect && (
                        <p style={{ color: 'var(--accent-secondary)', fontWeight: 700, fontSize: 15, margin: 0 }}>New Best Score! 🚀</p>
                    )}
                </div>

                {/* Score Circle */}
                <div className="animate-fadeInUp" style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                    <div style={{ position: 'relative', width: 160, height: 160 }}>
                        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="80" cy="80" r="70" stroke="var(--bg-elevated)" strokeWidth="10" fill="none" />
                            <circle
                                cx="80" cy="80" r="70"
                                stroke={scoreColor}
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 36, fontWeight: 800, color: scoreColor }}>{percentage}%</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{results.score}/{results.total}</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="animate-fadeInUp" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        textAlign: 'center',
                    }}>
                        <CheckCircle2 size={24} color="#4ADE80" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#4ADE80' }}>{results.score}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Correct</div>
                    </div>
                    <div style={{
                        background: 'rgba(255,92,115,0.1)',
                        border: '1px solid rgba(255,92,115,0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        textAlign: 'center',
                    }}>
                        <XCircle size={24} color="#FF5C73" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#FF5C73' }}>{results.total - results.score}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Incorrect</div>
                    </div>
                </div>

                {/* Previous Best */}
                {previousBestScore !== null && (
                    <div className="animate-fadeInUp" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 20px',
                        textAlign: 'center',
                        marginBottom: 20,
                    }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 4px' }}>Previous Best</p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            {previousBestScore}/{results.total} ({Math.round((previousBestScore / results.total) * 100)}%)
                        </p>
                        {isNewBest && (
                            <p style={{ color: '#4ADE80', fontWeight: 700, fontSize: 13, margin: '6px 0 0' }}>
                                +{results.score - previousBestScore} improvement! 📈
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn-primary" onClick={handleRetake} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <RotateCcw size={18} />
                        Retake Quiz
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            className="btn-ghost"
                            onClick={() => router.push(`/student/topic/${topicId}`)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <BookOpen size={16} />
                            Back to Topic
                        </button>
                        <button
                            className="btn-ghost"
                            onClick={() => router.push('/student/dashboard')}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <Home size={16} />
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

