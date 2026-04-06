'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Class, Topic, Score } from '@/types';
import Navbar from '@/components/Navbar';
import { Users, BookOpen, ChevronRight } from 'lucide-react';

const QUIZ_TYPES = ['multipleChoice', 'unscramble', 'trueFalse'] as const;

interface MasteryInfo {
    emoji: string;
    title: string;
    message: string;
    color: string;
    bg: string;
    starText: string;
}

function getMastery(earned: number, total: number, anyAttempted: boolean): MasteryInfo {
    if (total === 0 || !anyAttempted) return {
        emoji: '🐣', title: 'Just Getting Started',
        message: 'Complete your first quiz to begin!',
        color: 'text-gray-500', bg: 'bg-gray-50', starText: `0 / ${total} ⭐`,
    };
    const pct = (earned / total) * 100;
    const starText = `${earned} / ${total} ⭐`;
    if (pct <= 25) return {
        emoji: '🌱', title: 'Noob', message: "You're just getting started. Keep exploring!",
        color: 'text-green-700', bg: 'bg-green-50', starText,
    };
    if (pct <= 50) return {
        emoji: '📖', title: 'Novice', message: "Good progress! You're building your skills.",
        color: 'text-blue-700', bg: 'bg-blue-50', starText,
    };
    if (pct <= 75) return {
        emoji: '🎯', title: 'Learner', message: "Halfway there! Your hard work is paying off.",
        color: 'text-indigo-700', bg: 'bg-indigo-50', starText,
    };
    if (pct < 100) return {
        emoji: '🏆', title: 'Expert', message: "Almost there! You're nearly a master!",
        color: 'text-yellow-700', bg: 'bg-yellow-50', starText,
    };
    return {
        emoji: '👑', title: 'Master', message: '🎉 Congratulations! You are a top student!',
        color: 'text-purple-700', bg: 'bg-purple-50', starText,
    };
}

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
    const [masteries, setMasteries] = useState<Record<string, MasteryInfo>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) { router.push('/login?role=student'); return; }
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            if (userData?.role !== 'student') { router.push('/login?role=student'); return; }
            setUser({ ...currentUser, ...userData });
            await loadClasses(currentUser.uid);
        });
        return () => unsubscribe();
    }, [router]);

    const loadClasses = async (uid: string) => {
        try {
            // PHASE 1: Load classes fast — show UI immediately
            const snapshot = await getDocs(collection(db, 'classes'));
            const classesData = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Class))
                .sort((a, b) => a.name.localeCompare(b.name));
            setClasses(classesData);
            setLoading(false); // Show classes now — don't wait for mastery

            // Load teacher names (non-blocking)
            const names: Record<string, string> = {};
            const teacherIds = [...new Set(classesData.map(c => c.teacherId).filter(Boolean))];
            await Promise.all(teacherIds.map(async (tid) => {
                const t = await getDoc(doc(db, 'users', tid));
                if (t.exists()) names[tid] = t.data().name || 'Teacher';
            }));
            setTeacherNames(names);

            // PHASE 2: Compute mastery in background (won't block the page)
            loadMasteries(uid, classesData);
        } catch (error) {
            console.error('Error loading classes:', error);
            setLoading(false);
        }
    };

    const loadMasteries = async (uid: string, classesData: Class[]) => {
        const masteriesData: Record<string, MasteryInfo> = {};
        await Promise.all(classesData.map(async (cls) => {
            try {
                const topicsSnap = await getDocs(
                    query(collection(db, 'topics'), where('classIds', 'array-contains', cls.id))
                );
                const topics = topicsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Topic));

                let earned = 0;
                let anyAttempted = false;
                const total = topics.length * 3;

                await Promise.all(topics.map(async (topic) => {
                    await Promise.all(QUIZ_TYPES.map(async (qt) => {
                        const scoreDoc = await getDoc(doc(db, 'scores', `${uid}_${topic.id}_${qt}`));
                        if (scoreDoc.exists()) {
                            anyAttempted = true;
                            const s = scoreDoc.data() as Score;
                            const pct = ((s.bestScore ?? s.score) / s.maxScore) * 100;
                            if (pct >= 100) earned += 3;
                            else if (pct >= 50) earned += 2;
                        }
                    }));
                }));

                masteriesData[cls.id] = getMastery(earned, total, anyAttempted);
            } catch {
                masteriesData[cls.id] = getMastery(0, 0, false);
            }
        }));
        setMasteries(masteriesData); // Update mastery badges once ready
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl font-medium text-indigo-600 animate-pulse">Loading classes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar userRole="student" userName={user?.name} />
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'Student'}! 👋</h1>
                    <p className="text-gray-600 text-lg">Choose a class to start learning</p>
                </div>

                {classes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-700">No Classes Available</h2>
                        <p className="text-gray-500">Your teacher hasn't created any classes yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {classes.map((cls) => {
                            const m = masteries[cls.id];
                            return (
                                <div
                                    key={cls.id}
                                    onClick={() => router.push(`/student/class/${cls.id}`)}
                                    className="bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group overflow-hidden"
                                >
                                    {/* Top row: class info */}
                                    <div className="flex items-center gap-5 p-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all flex-shrink-0">
                                            <Users className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 truncate">{cls.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                                {cls.level && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{cls.level}</span>
                                                )}
                                                {teacherNames[cls.teacherId] && (
                                                    <span>👨‍🏫 {teacherNames[cls.teacherId]}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </div>

                                    {/* Mastery bar */}
                                    {m && (
                                        <div className={`px-5 pb-4 flex items-center gap-3 ${m.bg} border-t border-gray-100`}>
                                            <span className="text-2xl">{m.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm ${m.color}`}>{m.title}</div>
                                                <div className={`text-xs ${m.color} opacity-75 truncate`}>{m.message}</div>
                                            </div>
                                            <div className={`text-xs font-bold ${m.color} flex-shrink-0`}>{m.starText}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
