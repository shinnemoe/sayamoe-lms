'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { QuizType, Exercise, Topic, Score } from '@/types';
import { ArrowLeft, CheckCircle2, FileText, List, CheckSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';

function getStars(score: Score | undefined): string {
    if (!score) return '';
    const pct = ((score.bestScore ?? score.score) / score.maxScore) * 100;
    if (pct >= 100) return '⭐⭐⭐';
    if (pct >= 50) return '⭐⭐☆';
    return '☆☆☆';
}

const quizTypeConfig: Record<QuizType, { icon: any; title: string; description: string }> = {
    multipleChoice: {
        icon: CheckCircle2,
        title: 'Multiple Choice',
        description: 'Choose the correct answer from options'
    },
    unscramble: {
        icon: List,
        title: 'Unscramble Sentences',
        description: 'Arrange words in the correct order'
    },
    trueFalse: {
        icon: CheckSquare,
        title: 'True/False',
        description: 'Determine if the statement is true or false'
    }
};

export default function TopicPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.id as string;

    const [topic, setTopic] = useState<Topic | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [quizTypeCounts, setQuizTypeCounts] = useState<Record<QuizType, number>>({
        multipleChoice: 0,
        unscramble: 0,
        trueFalse: 0
    });
    const [scores, setScores] = useState<Record<string, Score>>({});
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        loadTopicData();
    }, [topicId]);

    const loadTopicData = async () => {
        try {
            // Load topic
            const topicDoc = await getDoc(doc(db, 'topics', topicId));
            if (topicDoc.exists()) {
                setTopic({ id: topicDoc.id, ...topicDoc.data() } as Topic);
            }

            // Load exercises
            const exercisesQuery = query(
                collection(db, 'exercises'),
                where('topicId', '==', topicId)
            );
            const exercisesSnapshot = await getDocs(exercisesQuery);
            const exercisesData = exercisesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exercise[];

            setExercises(exercisesData);

            // Count exercises by quiz type
            const counts: Record<QuizType, number> = {
                multipleChoice: 0,
                unscramble: 0,
                trueFalse: 0
            };

            exercisesData.forEach(ex => {
                if (ex.quizType && counts[ex.quizType] !== undefined) {
                    counts[ex.quizType]++;
                }
            });

            setQuizTypeCounts(counts);

            // Load scores for each quiz type
            if (auth.currentUser) {
                const scoresData: Record<string, Score> = {};
                for (const quizType of Object.keys(counts) as QuizType[]) {
                    const scoreDoc = await getDoc(doc(db, 'scores', `${auth.currentUser.uid}_${topicId}_${quizType}`));
                    if (scoreDoc.exists()) {
                        scoresData[quizType] = scoreDoc.data() as Score;
                    }
                }
                setScores(scoresData);

                // Get user name
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name || '');
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading topic data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📖</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600 }}>Loading...</div>
                </div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Topic Not Found</h2>
                    <button className="btn-primary" onClick={() => router.push('/student/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const availableQuizTypes = (Object.keys(quizTypeCounts) as QuizType[]).filter(
        type => quizTypeCounts[type] > 0
    );

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 100 }}>
            <Navbar userRole="student" userName={userName} />

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>

                {/* Back button */}
                <button
                    onClick={() => {
                        const classId = topic?.classIds?.[0];
                        if (classId) {
                            router.push(`/student/class/${classId}`);
                        } else {
                            router.push('/student/dashboard');
                        }
                    }}
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
                        padding: '0 0 20px',
                        fontFamily: 'inherit',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Topic header */}
                <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-accent)',
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            flexShrink: 0,
                        }}>
                            {topic.emoji || '📖'}
                        </div>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                                {topic.name}
                            </h1>
                            {topic.description && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
                                    {topic.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quiz type selection */}
                {availableQuizTypes.length === 0 ? (
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
                        <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No Quizzes Available</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Your teacher hasn&apos;t added any exercises yet.</p>
                    </div>
                ) : (
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                            Choose Quiz Type
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {availableQuizTypes.map((quizType, i) => {
                                const config = quizTypeConfig[quizType];
                                const Icon = config.icon;
                                const count = quizTypeCounts[quizType];
                                const score = scores[quizType];
                                const percentage = score?.bestScore
                                    ? Math.round((score.bestScore / score.maxScore) * 100)
                                    : 0;
                                const stars = getStars(score);
                                const attempted = !!score;

                                return (
                                    <div
                                        key={quizType}
                                        className="animate-fadeInUp"
                                        onClick={() => router.push(`/student/quiz/${topicId}/${quizType}`)}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '18px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14,
                                            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            animationDelay: `${i * 0.07}s`,
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card), var(--shadow-glow)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.transform = '';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = '';
                                        }}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            background: 'rgba(124,110,247,0.15)',
                                            border: '1px solid var(--border-accent)',
                                            borderRadius: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon size={22} color="var(--accent-secondary)" />
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                                                {config.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                                {config.description}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {count} {count === 1 ? 'question' : 'questions'}
                                                </span>
                                                {score ? (
                                                    <>
                                                        <span style={{ color: 'var(--border-subtle)', fontSize: 10 }}>•</span>
                                                        <span style={{ fontSize: 11, color: 'var(--accent-success)', fontWeight: 700 }}>
                                                            Best: {score.bestScore ?? score.score}/{score.maxScore} ({percentage}%)
                                                        </span>
                                                        <span style={{ color: 'var(--border-subtle)', fontSize: 10 }}>•</span>
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                            {score.attempts} {score.attempts === 1 ? 'attempt' : 'attempts'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Not attempted</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stars + arrow */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                            {stars && <div style={{ fontSize: 16, letterSpacing: 1 }}>{stars}</div>}
                                            <span style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: attempted ? 'var(--accent-success)' : 'var(--accent-primary)',
                                                background: attempted ? 'rgba(34,211,94,0.1)' : 'rgba(124,110,247,0.1)',
                                                padding: '3px 10px',
                                                borderRadius: 99,
                                            }}>
                                                {attempted ? '▶ Continue' : '🚀 Start'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
