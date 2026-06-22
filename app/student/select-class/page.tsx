'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Class } from '@/types';
import { BookOpen, CheckCircle, Users } from 'lucide-react';

export default function SelectClassPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState<string | null>(null);
    const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) { router.push('/login'); return; }
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            if (!userData || userData.role !== 'student') { router.push('/login'); return; }
            if (userData.classId) { router.push('/student/dashboard'); return; }
            setUser({ ...currentUser, ...userData });
            await loadClasses();
        });
        return () => unsubscribe();
    }, [router]);

    const loadClasses = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'classes'));
            const classesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Class[];
            classesData.sort((a, b) => a.name.localeCompare(b.name));
            setClasses(classesData);
            const names: Record<string, string> = {};
            const teacherIds = [...new Set(classesData.map(c => c.teacherId))];
            await Promise.all(teacherIds.map(async (tid) => {
                const teacherDoc = await getDoc(doc(db, 'users', tid));
                if (teacherDoc.exists()) names[tid] = teacherDoc.data().name || 'Teacher';
            }));
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
            await updateDoc(doc(db, 'users', auth.currentUser.uid), { classId });
            await updateDoc(doc(db, 'classes', classId), { studentIds: arrayUnion(auth.currentUser.uid) });
            router.push('/student/dashboard');
        } catch (error) {
            console.error('Error joining class:', error);
            setJoining(null);
        }
    };

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'var(--bg-base)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 16px 80px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background orb */}
            <div className="animate-float" style={{
                position: 'absolute', top: '-15%', right: '-10%',
                width: 400, height: 400, pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(124,110,247,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
            }} />

            <div style={{ width: '100%', maxWidth: 560 }}>
                {/* Header */}
                <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 72, height: 72,
                        background: 'linear-gradient(135deg, #7C6EF7, #C084FC)',
                        borderRadius: 20,
                        marginBottom: 20,
                        fontSize: 32,
                    }}>
                        📚
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
                        Welcome, {user?.name || 'Student'}! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>
                        Choose your class to get started
                    </p>
                </div>

                {/* Classes list */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border-subtle)' }}>
                                <div className="skeleton" style={{ height: 18, width: '50%', marginBottom: 10 }} />
                                <div className="skeleton" style={{ height: 13, width: '30%' }} />
                            </div>
                        ))}
                    </div>
                ) : classes.length === 0 ? (
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
                        <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No Classes Available</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your teacher hasn't created any classes yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {classes.map((cls, i) => {
                            const isJoining = joining === cls.id;
                            return (
                                <div
                                    key={cls.id}
                                    className="animate-fadeInUp"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '18px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 16,
                                        animationDelay: `${i * 0.06}s`,
                                        transition: 'border-color 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: 48, height: 48,
                                            background: 'linear-gradient(135deg, rgba(124,110,247,0.2), rgba(192,132,252,0.1))',
                                            border: '1px solid var(--border-accent)',
                                            borderRadius: 14,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <BookOpen size={22} color="var(--accent-primary)" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {cls.name}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                                {cls.level && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700,
                                                        color: 'var(--accent-secondary)',
                                                        background: 'rgba(124,110,247,0.15)',
                                                        padding: '1px 7px', borderRadius: 99,
                                                        textTransform: 'uppercase', letterSpacing: 0.5,
                                                    }}>
                                                        {cls.level}
                                                    </span>
                                                )}
                                                {teacherNames[cls.teacherId] && (
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        👨‍🏫 {teacherNames[cls.teacherId]}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {cls.studentIds?.length || 0} students
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoinClass(cls.id)}
                                        disabled={!!joining}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '10px 18px',
                                            background: isJoining
                                                ? 'rgba(124,110,247,0.2)'
                                                : 'linear-gradient(135deg, var(--accent-primary), #9B59F7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 12,
                                            fontWeight: 700,
                                            fontSize: 13,
                                            cursor: joining ? 'not-allowed' : 'pointer',
                                            opacity: joining && !isJoining ? 0.5 : 1,
                                            flexShrink: 0,
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 12px rgba(124,110,247,0.3)',
                                        }}
                                    >
                                        <CheckCircle size={15} />
                                        {isJoining ? 'Joining...' : 'Join'}
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
