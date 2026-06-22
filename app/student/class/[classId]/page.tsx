'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Topic, Score, Class } from '@/types';
import Navbar from '@/components/Navbar';
import { ArrowLeft, BookOpen } from 'lucide-react';

const QUIZ_TYPES = ['multipleChoice', 'unscramble', 'trueFalse'] as const;

function getAggregatePct(topicScores: Record<string, Score>): number | null {
    const values = Object.values(topicScores);
    if (values.length === 0) return null;
    const totalScored = values.reduce((sum, s) => sum + (s.bestScore ?? s.score), 0);
    const totalMax = values.reduce((sum, s) => sum + s.maxScore, 0);
    return totalMax > 0 ? (totalScored / totalMax) * 100 : null;
}

function getStarInfo(pct: number | null): { stars: string; color: string } {
    if (pct === null) return { stars: '☆☆☆', color: 'var(--text-muted)' };
    if (pct >= 100) return { stars: '⭐⭐⭐', color: '#FBBF24' };
    if (pct >= 50) return { stars: '⭐⭐☆', color: '#60A5FA' };
    return { stars: '⭐☆☆', color: '#4ADE80' };
}

function SkeletonTopicCard() {
    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 99 }} />
            </div>
            <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 4 }} />
            <div className="skeleton" style={{ height: 13, width: '60%' }} />
        </div>
    );
}

export default function ClassTopicsPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;

    const [user, setUser] = useState<any>(null);
    const [classInfo, setClassInfo] = useState<Class | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [scores, setScores] = useState<Record<string, Record<string, Score>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) { router.push('/login'); return; }
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();
            if (userData?.role !== 'student') { router.push('/login'); return; }
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

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 100 }}>
            <Navbar userRole="student" userName={user?.name} />

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
                {/* Back + header */}
                <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--accent-primary)',
                            fontSize: 14,
                            fontWeight: 600,
                            padding: '0 0 16px',
                            fontFamily: 'inherit',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Classes
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            background: 'linear-gradient(135deg, rgba(124,110,247,0.3), rgba(192,132,252,0.2))',
                            border: '1px solid var(--border-accent)',
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            flexShrink: 0,
                        }}>
                            📖
                        </div>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                                {classInfo?.name || 'Class Topics'}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                {classInfo?.level && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        color: 'var(--accent-secondary)',
                                        background: 'rgba(124,110,247,0.15)',
                                        padding: '2px 8px', borderRadius: 99,
                                        textTransform: 'uppercase', letterSpacing: 0.5,
                                    }}>
                                        {classInfo.level}
                                    </span>
                                )}
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {loading ? '...' : `${topics.length} topic${topics.length !== 1 ? 's' : ''}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {[1, 2, 3, 4].map(i => <SkeletonTopicCard key={i} />)}
                    </div>
                ) : topics.length === 0 ? (
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
                        <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No Topics Yet</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>The teacher hasn't added any topics yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {topics.map((topic, i) => {
                            const topicScores = scores[topic.id] || {};
                            const bestPct = getAggregatePct(topicScores);
                            const { stars, color } = getStarInfo(bestPct);
                            const attempted = Object.values(topicScores).length > 0;

                            return (
                                <div
                                    key={topic.id}
                                    className="animate-fadeInUp"
                                    onClick={() => router.push(`/student/topic/${topic.id}?from=${classId}`)}
                                    style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        animationDelay: `${i * 0.05}s`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card), var(--shadow-glow)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.transform = '';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                                    }}
                                >
                                    {/* Top row */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <div style={{
                                            width: 52,
                                            height: 52,
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: topic.emoji ? 28 : 20,
                                        }}>
                                            {topic.emoji || <BookOpen size={24} color="var(--text-muted)" />}
                                        </div>
                                        <div style={{
                                            fontSize: 20,
                                            letterSpacing: 2,
                                            color,
                                        }}>
                                            {stars}
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>
                                        {topic.name}
                                    </h3>
                                    {topic.description && (
                                        <p style={{
                                            fontSize: 13,
                                            color: 'var(--text-secondary)',
                                            margin: '0 0 14px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {topic.description}
                                        </p>
                                    )}

                                    {/* CTA */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: attempted ? 'var(--accent-success)' : 'var(--accent-primary)',
                                            background: attempted ? 'rgba(34,211,94,0.1)' : 'rgba(124,110,247,0.1)',
                                            padding: '4px 10px',
                                            borderRadius: 99,
                                        }}>
                                            {attempted ? '▶ Continue' : '🚀 Start'}
                                        </span>
                                        {bestPct !== null && (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {Math.round(bestPct)}%
                                            </span>
                                        )}
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
