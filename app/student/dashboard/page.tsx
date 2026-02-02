'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Topic, Score } from '@/types';

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

            // Load scores
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
                <div className="text-xl animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome, {user?.name || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-600 mt-2">Choose a topic to start learning</p>
                </div>

                {topics.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold mb-2">No Topics Yet</h2>
                        <p className="text-gray-600">Your teacher hasn't assigned any topics yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => {
                            const score = scores[topic.id];
                            const percentage = score ? Math.round((score.score / score.maxScore) * 100) : 0;

                            return (
                                <div
                                    key={topic.id}
                                    onClick={() => router.push(`/student/topic/${topic.id}`)}
                                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl">📖</div>
                                        {score && (
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {percentage}%
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{topic.description}</p>

                                    {score && (
                                        <div className="text-sm text-gray-500">
                                            Best Score: {score.score}/{score.maxScore} • {score.attempts} attempts
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center text-indigo-600 font-medium">
                                        Start Learning →
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
