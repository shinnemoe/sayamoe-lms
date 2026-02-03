'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Topic, Score } from '@/types';
import Navbar from '@/components/Navbar';
import { BookOpen, Target, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [scores, setScores] = useState<Record<string, Score>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login?role=student');
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();

            if (userData?.role !== 'student') {
                router.push('/login?role=student');
                return;
            }

            setUser({ ...currentUser, ...userData });
            await loadTopics(userData.classId);
        });

        return () => unsubscribe();
    }, [router]);

    const loadTopics = async (classId?: string) => {
        if (!classId) {
            setLoading(false);
            return;
        }

        try {
            const topicsQuery = query(
                collection(db, 'topics'),
                where('classIds', 'array-contains', classId)
            );
            const topicsSnapshot = await getDocs(topicsQuery);
            const topicsData = topicsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Topic[];

            setTopics(topicsData);

            // Load scores - get best score for each topic
            const scoresData: Record<string, Score> = {};
            for (const topic of topicsData) {
                const scoreDoc = await getDoc(doc(db, 'scores', `${auth.currentUser!.uid}_${topic.id}`));
                if (scoreDoc.exists()) {
                    scoresData[topic.id] = scoreDoc.data() as Score;
                }
            }
            setScores(scoresData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading topics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl font-medium text-indigo-600 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar userRole="student" userName={user?.name} />

            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-600">Choose a topic to continue learning</p>
                </div>

                {!user?.classId ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Not Assigned to Class</h2>
                        <p className="text-gray-600">Your teacher needs to add you to a class before you can see topics.</p>
                        <p className="text-sm text-gray-500 mt-4">Contact your teacher or wait for them to assign you.</p>
                    </div>
                ) : topics.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">No Topics Available</h2>
                        <p className="text-gray-600">Your teacher hasn't assigned any topics to your class yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => {
                            const score = scores[topic.id];
                            const percentage = score?.bestScore
                                ? Math.round((score.bestScore / score.maxScore) * 100)
                                : 0;

                            return (
                                <div
                                    key={topic.id}
                                    onClick={() => router.push(`/student/topic/${topic.id}`)}
                                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-200 transition-all">
                                            <BookOpen className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        {score && (
                                            <div className="relative w-16 h-16">
                                                {/* Circular progress */}
                                                <svg className="w-16 h-16 transform -rotate-90">
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="url(#gradient)"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                                                        strokeLinecap="round"
                                                    />
                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#6366f1" />
                                                            <stop offset="100%" stopColor="#a855f7" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{topic.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>

                                    {score ? (
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-green-600">
                                                <Target className="w-4 h-4" />
                                                <span className="font-medium">{score.bestScore || score.score}/{score.maxScore}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>{score.attempts} {score.attempts === 1 ? 'attempt' : 'attempts'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">Not started yet</div>
                                    )}

                                    <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                                        <span>Start Learning</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
