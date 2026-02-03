'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Trophy, Target, Clock, CheckCircle2, XCircle, RotateCcw, Home, BookOpen } from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl font-medium text-indigo-600 animate-pulse">Saving results...</div>
            </div>
        );
    }

    const percentage = Math.round((results.score / results.total) * 100);
    const isNewBest = previousBestScore !== null && results.score > previousBestScore;
    const isPerfect = percentage === 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar userRole="student" userName={userName} />

            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                            <Trophy className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete! 🎉</h1>
                        {isPerfect && <p className="text-xl text-indigo-600 font-semibold">Perfect Score!</p>}
                        {isNewBest && !isPerfect && <p className="text-xl text-green-600 font-semibold">New Best Score! 🚀</p>}
                    </div>

                    {/* Score Circle */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="#e5e7eb"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 88}`}
                                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-gray-900">{percentage}%</span>
                                <span className="text-gray-600">{results.score}/{results.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-900">{results.score}</div>
                            <div className="text-sm text-green-700">Correct</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 text-center">
                            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-red-900">{results.total - results.score}</div>
                            <div className="text-sm text-red-700">Incorrect</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-900">{formatTime(results.timeTaken)}</div>
                            <div className="text-sm text-blue-700">Time Taken</div>
                        </div>
                    </div>

                    {/* Previous Best Score Comparison */}
                    {previousBestScore !== null && (
                        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-center">
                            <p className="text-sm text-gray-600 mb-1">Previous Best Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {previousBestScore}/{results.total} ({Math.round((previousBestScore / results.total) * 100)}%)
                            </p>
                            {isNewBest && (
                                <p className="text-green-600 font-medium mt-2">
                                    +{results.score - previousBestScore} improvement! 📈
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={handleRetake}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Retake Quiz
                        </button>
                        <button
                            onClick={() => router.push(`/student/topic/${topicId}`)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:shadow-lg hover:border-gray-400 transition-all font-semibold"
                        >
                            <BookOpen className="w-5 h-5" />
                            Back to Topic
                        </button>
                        <button
                            onClick={() => router.push('/student/dashboard')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:shadow-lg hover:border-gray-400 transition-all font-semibold"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
