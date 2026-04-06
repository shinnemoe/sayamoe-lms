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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl font-medium text-indigo-600 animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        className="text-indigo-600 hover:underline"
                    >
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar userRole="student" userName={userName} />

            <div className="max-w-4xl mx-auto p-6">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow hover:shadow-lg transition-all text-gray-700 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{topic.name}</h1>
                    <p className="text-gray-600">{topic.description}</p>
                </div>

                {availableQuizTypes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">No Quizzes Available</h2>
                        <p className="text-gray-600">Your teacher hasn't added any exercises to this topic yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Quiz Type</h2>
                        {availableQuizTypes.map((quizType) => {
                            const config = quizTypeConfig[quizType];
                            const Icon = config.icon;
                            const count = quizTypeCounts[quizType];
                            const score = scores[quizType];
                            const percentage = score?.bestScore
                                ? Math.round((score.bestScore / score.maxScore) * 100)
                                : 0;

                            const stars = getStars(score);

                            return (
                                <div
                                    key={quizType}
                                    onClick={() => router.push(`/student/quiz/${topicId}/${quizType}`)}
                                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-200 transition-all">
                                            <Icon className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{config.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-500">{count} {count === 1 ? 'question' : 'questions'}</span>
                                                {score ? (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-green-600 font-medium">
                                                            Best: {score.bestScore ?? score.score}/{score.maxScore} ({percentage}%)
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500">{score.attempts} {score.attempts === 1 ? 'attempt' : 'attempts'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500 italic">Not attempted</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {stars && <div className="text-xl">{stars}</div>}
                                            <div className="text-indigo-600 group-hover:translate-x-2 transition-transform">→</div>
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
