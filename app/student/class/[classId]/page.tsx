'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Topic, Score, Class } from '@/types';
import Navbar from '@/components/Navbar';
import { BookOpen, ArrowLeft } from 'lucide-react';

const QUIZ_TYPES = ['multipleChoice', 'unscramble', 'trueFalse'] as const;

function getAggregatePct(topicScores: Record<string, Score>): number | null {
    const values = Object.values(topicScores);
    if (values.length === 0) return null;
    const totalScored = values.reduce((sum, s) => sum + (s.bestScore ?? s.score), 0);
    const totalMax = values.reduce((sum, s) => sum + s.maxScore, 0);
    return totalMax > 0 ? (totalScored / totalMax) * 100 : null;
}

function renderStars(pct: number | null): string {
    if (pct === null) return '';
    if (pct >= 100) return '⭐⭐⭐';
    if (pct >= 50) return '⭐⭐☆';
    return '☆☆☆';
}

export default function ClassTopicsPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;

    const [user, setUser] = useState<any>(null);
    const [classInfo, setClassInfo] = useState<Class | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    // scores[topicId][quizType] = Score
    const [scores, setScores] = useState<Record<string, Record<string, Score>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) { router.push('/login?role=student'); return; }
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            if (userData?.role !== 'student') { router.push('/login?role=student'); return; }
            setUser({ ...currentUser, ...userData });
            await loadClassData(currentUser.uid);
        });
        return () => unsubscribe();
    }, [router, classId]);

    const loadClassData = async (uid: string) => {
        try {
            const classDoc = await getDoc(doc(db, 'classes', classId));
            if (classDoc.exists()) setClassInfo({ id: classDoc.id, ...classDoc.data() } as Class);

            const topicsSnap = await getDocs(
                query(collection(db, 'topics'), where('classIds', 'array-contains', classId))
            );
            const topicsData = topicsSnap.docs
                .map(d => ({ id: d.id, ...d.data() } as Topic))
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            setTopics(topicsData);

            // Load scores: for each topic, check all 3 quiz types in parallel
            const scoresData: Record<string, Record<string, Score>> = {};
            await Promise.all(
                topicsData.map(async (topic) => {
                    const topicScores: Record<string, Score> = {};
                    await Promise.all(
                        QUIZ_TYPES.map(async (qt) => {
                            const scoreDoc = await getDoc(doc(db, 'scores', `${uid}_${topic.id}_${qt}`));
                            if (scoreDoc.exists()) topicScores[qt] = scoreDoc.data() as Score;
                        })
                    );
                    scoresData[topic.id] = topicScores;
                })
            );
            setScores(scoresData);
        } catch (error) {
            console.error('Error loading class data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl font-medium text-indigo-600 animate-pulse">Loading topics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar userRole="student" userName={user?.name} />
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Classes
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-1">{classInfo?.name || 'Class Topics'}</h1>
                    {classInfo?.level && (
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {classInfo.level}
                        </span>
                    )}
                    <p className="text-gray-600 mt-2">Choose a topic to start learning</p>
                </div>

                {topics.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-700">No Topics Yet</h2>
                        <p className="text-gray-500">The teacher hasn't added any topics to this class yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => {
                            const topicScores = scores[topic.id] || {};
                            const bestPct = getAggregatePct(topicScores);
                            const stars = renderStars(bestPct);
                            const attempted = Object.values(topicScores).length > 0;

                            return (
                                <div
                                    key={topic.id}
                                    onClick={() => router.push(`/student/topic/${topic.id}?from=${classId}`)}
                                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-200 transition-all">
                                            {topic.emoji
                                                ? <span className="text-4xl">{topic.emoji}</span>
                                                : <BookOpen className="w-8 h-8 text-indigo-600" />}
                                        </div>
                                        {stars && (
                                            <div className="text-right">
                                                <div className="text-xl leading-none">{stars}</div>
                                                {bestPct !== null && (
                                                    <div className="text-xs text-gray-400 mt-1">{Math.round(bestPct)}% best</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{topic.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>

                                    {attempted ? (
                                        <div className="text-sm text-green-600 font-medium">In Progress</div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">Not started yet</div>
                                    )}

                                    <div className="mt-3 flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                                        <span>{attempted ? 'Continue' : 'Start Learning'}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
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
