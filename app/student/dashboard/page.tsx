'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Class, Topic, Score } from '@/types';
import Navbar from '@/components/Navbar';
import { ChevronRight } from 'lucide-react';

const QUIZ_TYPES = ['multipleChoice', 'unscramble', 'trueFalse'] as const;

interface MasteryInfo {
    emoji: string;
    title: string;
    message: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    starText: string;
    pct: number;
}

function getMastery(earned: number, total: number, anyAttempted: boolean): MasteryInfo {
    if (total === 0 || !anyAttempted) return {
        emoji: '🐣', title: 'Just Getting Started',
        message: 'Complete your first quiz!',
        color: '#9DA3C8', gradientFrom: '#252840', gradientTo: '#1C1F33',
        starText: `0 / ${total} ⭐`, pct: 0,
    };
    const pct = (earned / total) * 100;
    const starText = `${earned} / ${total} ⭐`;
    if (pct <= 25) return {
        emoji: '🌱', title: 'Noob', message: "You're just getting started!",
        color: '#4ADE80', gradientFrom: '#14290A', gradientTo: '#1C1F33', starText, pct,
    };
    if (pct <= 50) return {
        emoji: '📖', title: 'Novice', message: "Good progress! Keep building.",
        color: '#60A5FA', gradientFrom: '#0D1A30', gradientTo: '#1C1F33', starText, pct,
    };
    if (pct <= 75) return {
        emoji: '🎯', title: 'Learner', message: "Halfway there! Keep going.",
        color: '#A78BFA', gradientFrom: '#1A0D30', gradientTo: '#1C1F33', starText, pct,
    };
    if (pct < 100) return {
        emoji: '🏆', title: 'Expert', message: "Almost a master!",
        color: '#FBBF24', gradientFrom: '#2A1A00', gradientTo: '#1C1F33', starText, pct,
    };
    return {
        emoji: '👑', title: 'Master', message: '🎉 You are a top student!',
        color: '#C084FC', gradientFrom: '#220D33', gradientTo: '#1C1F33', starText, pct: 100,
    };
}

function SkeletonCard() {
    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
        }}>
            <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 8, borderRadius: 99 }} />
        </div>
    );
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
            const snapshot = await getDocs(collection(db, 'classes'));
            const classesData = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Class))
                .sort((a, b) => a.name.localeCompare(b.name));
            setClasses(classesData);
            setLoading(false);

            const names: Record<string, string> = {};
            const teacherIds = [...new Set(classesData.map(c => c.teacherId).filter(Boolean))];
            await Promise.all(teacherIds.map(async (tid) => {
                const t = await getDoc(doc(db, 'users', tid));
                if (t.exists()) names[tid] = t.data().name || 'Teacher';
            }));
            setTeacherNames(names);
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
        setMasteries(masteriesData);
    };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 100 }}>
            <Navbar userRole="student" userName={user?.name} />

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
                {/* Hero greeting */}
                <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Your Classes
                    </p>
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        Hey {user?.name?.split(' ')[0] || 'Student'} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 15 }}>
                        {loading ? 'Loading your classes...' : `${classes.length} class${classes.length !== 1 ? 'es' : ''} available`}
                    </p>
                </div>

                {/* Loading skeletons */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : classes.length === 0 ? (
                    <div className="glass" style={{
                        borderRadius: 'var(--radius-lg)',
                        padding: '48px 24px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>No Classes Yet</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your teacher hasn't created any classes yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {classes.map((cls, i) => {
                            const m = masteries[cls.id];
                            const progressPct = m?.pct ?? 0;
                            return (
                                <div
                                    key={cls.id}
                                    className="animate-fadeInUp"
                                    onClick={() => router.push(`/student/class/${cls.id}`)}
                                    style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border-subtle)',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        animationDelay: `${i * 0.06}s`,
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card), var(--shadow-glow)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.transform = '';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                                    }}
                                >
                                    {/* Accent left bar */}
                                    <div style={{ display: 'flex' }}>
                                        <div style={{
                                            width: 4,
                                            background: m ? `linear-gradient(180deg, ${m.color}80, transparent)` : 'var(--accent-primary)',
                                            flexShrink: 0,
                                        }} />
                                        <div style={{ flex: 1, padding: '18px 18px 18px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{
                                                        fontSize: 17,
                                                        fontWeight: 700,
                                                        color: 'var(--text-primary)',
                                                        margin: 0,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {cls.name}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                                                        {cls.level && (
                                                            <span style={{
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: 'var(--accent-secondary)',
                                                                background: 'rgba(124,110,247,0.15)',
                                                                padding: '2px 8px',
                                                                borderRadius: 99,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: 0.5,
                                                            }}>
                                                                {cls.level}
                                                            </span>
                                                        )}
                                                        {teacherNames[cls.teacherId] && (
                                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                                👨‍🏫 {teacherNames[cls.teacherId]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                    {m && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: 24 }}>{m.emoji}</div>
                                                            <div style={{ fontSize: 10, color: m.color, fontWeight: 700 }}>{m.title}</div>
                                                        </div>
                                                    )}
                                                    <ChevronRight size={18} color="var(--text-muted)" />
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            {m && m.pct > 0 && (
                                                <div style={{ marginTop: 14 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.starText}</span>
                                                        <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{Math.round(progressPct)}%</span>
                                                    </div>
                                                    <div style={{
                                                        height: 6,
                                                        background: 'var(--bg-elevated)',
                                                        borderRadius: 99,
                                                        overflow: 'hidden',
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${progressPct}%`,
                                                            background: `linear-gradient(90deg, var(--accent-primary), ${m.color})`,
                                                            borderRadius: 99,
                                                            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                                                        }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
