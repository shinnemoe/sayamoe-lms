'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Class } from '@/types';
import { Users, BookOpen, CheckCircle } from 'lucide-react';

export default function SelectClassPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState<string | null>(null);
    const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login?role=student');
                return;
            }

            // Check if already assigned to a class
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== 'student') {
                router.push('/login?role=student');
                return;
            }

            // If already has a class, go to dashboard
            if (userData.classId) {
                router.push('/student/dashboard');
                return;
            }

            setUser({ ...currentUser, ...userData });
            await loadClasses();
        });

        return () => unsubscribe();
    }, [router]);

    const loadClasses = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'classes'));
            const classesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Class[];

            // Sort by name
            classesData.sort((a, b) => a.name.localeCompare(b.name));
            setClasses(classesData);

            // Load teacher names
            const names: Record<string, string> = {};
            const teacherIds = [...new Set(classesData.map(c => c.teacherId))];
            await Promise.all(
                teacherIds.map(async (tid) => {
                    const teacherDoc = await getDoc(doc(db, 'users', tid));
                    if (teacherDoc.exists()) {
                        names[tid] = teacherDoc.data().name || 'Teacher';
                    }
                })
            );
            setTeacherNames(names);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (classId: string) => {
        if (!auth.currentUser || joining) return;
        setJoining(classId);

        try {
            // Write classId to student's user doc
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                classId: classId,
            });

            // Add student to class's studentIds array
            await updateDoc(doc(db, 'classes', classId), {
                studentIds: arrayUnion(auth.currentUser.uid),
            });

            router.push('/student/dashboard');
        } catch (error) {
            console.error('Error joining class:', error);
            setJoining(null);
        }
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
            <div className="max-w-3xl mx-auto p-6 pt-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'Student'}! 👋</h1>
                    <p className="text-gray-600 text-lg">Choose your class to get started</p>
                </div>

                {classes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-700 mb-2">No Classes Available</h2>
                        <p className="text-gray-500">Your teacher hasn't created any classes yet. Please check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classes.map((cls) => {
                            const isJoining = joining === cls.id;
                            return (
                                <div
                                    key={cls.id}
                                    className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all flex-shrink-0">
                                            <Users className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                                {cls.level && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                                        {cls.level}
                                                    </span>
                                                )}
                                                {teacherNames[cls.teacherId] && (
                                                    <span>👨‍🏫 {teacherNames[cls.teacherId]}</span>
                                                )}
                                                <span>{cls.studentIds?.length || 0} students</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoinClass(cls.id)}
                                        disabled={!!joining}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex-shrink-0"
                                    >
                                        {isJoining ? (
                                            <>
                                                <span className="animate-spin text-base">⏳</span>
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Join
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
