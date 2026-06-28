'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Exercise, QuizType } from '@/types';
import UnscrambleQuiz from '@/components/quiz/UnscrambleQuiz';
import TrueFalseQuiz from '@/components/quiz/TrueFalseQuiz';
import MultipleChoiceQuiz from '@/components/quiz/MultipleChoiceQuiz';
import { ArrowLeft } from 'lucide-react';

interface Answer {
    questionIndex: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.topicId as string;
    const quizType = params.type as QuizType;

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [currentUserAnswer, setCurrentUserAnswer] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [topicName, setTopicName] = useState<string>('');

    useEffect(() => {
        loadExercises();
    }, [topicId, quizType]);

    const quizTypeLabel: Record<string, string> = {
        multipleChoice: 'Multiple Choice',
        unscramble: 'Unscramble',
        trueFalse: 'True or False',
    };

    const loadExercises = async () => {
        try {
            // Fetch topic name
            const topicDoc = await getDoc(doc(db, 'topics', topicId));
            if (topicDoc.exists()) {
                const data = topicDoc.data();
                const emoji = data.emoji ? `${data.emoji} ` : '';
                setTopicName(`${emoji}${data.name}`);
            }

            const exercisesQuery = query(
                collection(db, 'exercises'),
                where('topicId', '==', topicId),
                where('quizType', '==', quizType)
            );
            const exercisesSnapshot = await getDocs(exercisesQuery);
            const exercisesData = exercisesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exercise[];

            setExercises(exercisesData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading exercises:', error);
            setLoading(false);
        }
    };

    const handleAnswer = (answer: string | boolean) => {
        const currentExercise = exercises[currentIndex];
        let correctAnswer = '';
        let correct = false;

        // Get correct answer based on quiz type
        if (quizType === 'multipleChoice') {
            const correctIndex = currentExercise.mcCorrectAnswerIndex ?? 0;
            correctAnswer = currentExercise.mcOptions?.[correctIndex]?.text || '';
            correct = answer === correctAnswer;
        } else if (quizType === 'unscramble') {
            correctAnswer = currentExercise.unscrambleAnswer || '';
            correct = answer === correctAnswer;
        } else if (quizType === 'trueFalse') {
            correctAnswer = currentExercise.tfAnswer ? 'true' : 'false';
            correct = answer.toString() === correctAnswer;
        }

        setIsCorrect(correct);
        setShowResult(true);
        setCurrentUserAnswer(answer.toString());

        // Add to answers array
        const newAnswer: Answer = {
            questionIndex: currentIndex,
            userAnswer: answer.toString(),
            correctAnswer: correctAnswer,
            isCorrect: correct
        };
        setAnswers([...answers, newAnswer]);
    };

    const handleNext = async () => {
        if (currentIndex < exercises.length - 1) {
            // Move to next question
            setCurrentIndex(currentIndex + 1);
            setShowResult(false);
            setCurrentUserAnswer('');
        } else {
            // Quiz finished - save score and navigate to results
            const correctCount = answers.filter(a => a.isCorrect).length;
            const totalQuestions = exercises.length;

            await saveScore(correctCount, totalQuestions);

            // Navigate to results page with data
            const resultsData = {
                score: correctCount,
                total: totalQuestions,
                answers: JSON.stringify(answers)
            };
            const queryParams = new URLSearchParams(resultsData as any).toString();
            router.push(`/student/quiz/${topicId}/${quizType}/results?${queryParams}`);
        }
    };

    const saveScore = async (correctCount: number, totalQuestions: number) => {
        if (!auth.currentUser) return;

        try {
            // Score ID format: studentId_topicId_quizType
            const scoreId = `${auth.currentUser.uid}_${topicId}_${quizType}`;
            const scoreRef = doc(db, 'scores', scoreId);
            const existingScore = await getDoc(scoreRef);

            const previousBest = existingScore.exists() ? existingScore.data().bestScore : 0;
            const newBest = Math.max(previousBest, correctCount);

            const scoreData = {
                studentId: auth.currentUser.uid,
                topicId,
                quizType,
                bestScore: newBest,
                lastScore: correctCount,
                maxScore: totalQuestions,
                attempts: (existingScore.exists() ? existingScore.data().attempts : 0) + 1,
                lastAttempt: new Date()
            };

            await setDoc(scoreRef, scoreData, { merge: true });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600 }}>Loading quiz...</div>
                </div>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>No Exercises</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>
                        This topic doesn&apos;t have any {quizType} exercises yet.
                    </p>
                    <button className="btn-primary" onClick={() => router.push(`/student/topic/${topicId}`)}>
                        Back to Topic
                    </button>
                </div>
            </div>
        );
    }

    const currentExercise = exercises[currentIndex];
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: 32 }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 0' }}>

                {/* Back button */}
                <button
                    onClick={() => router.push(`/student/topic/${topicId}`)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        marginBottom: 20,
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                    }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Quiz Title */}
                {topicName && (
                    <div className="animate-fadeInUp" style={{ marginBottom: 20, textAlign: 'center' }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                            {topicName}
                        </h1>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 14px',
                            background: 'rgba(124,110,247,0.15)',
                            color: 'var(--accent-secondary)',
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                        }}>
                            {quizTypeLabel[quizType] ?? quizType}
                        </span>
                    </div>
                )}

                {/* Progress */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                            Question {currentIndex + 1} of {exercises.length}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--accent-success)', fontWeight: 700 }}>
                            Correct: {answers.filter(a => a.isCorrect).length}/{exercises.length}
                        </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                            borderRadius: 99,
                            transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                        }} />
                    </div>
                </div>

                {/* Quiz Card */}
                <div className="animate-fadeInUp" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px 20px',
                }}>
                    {quizType === 'unscramble' && currentExercise.unscrambleAnswer && (() => {
                        const words = currentExercise.unscrambleAnswer.split(' ');
                        const shuffled = [...words].sort(() => Math.random() - 0.5);
                        return (
                            <UnscrambleQuiz
                                question={currentExercise.unscrambleQuestion || 'Unscramble the sentence:'}
                                prompt={currentExercise.unscramblePrompt}
                                words={shuffled}
                                correctAnswer={currentExercise.unscrambleAnswer}
                                explanation={currentExercise.explanation}
                                onAnswer={handleAnswer}
                                showResult={showResult}
                                isCorrect={isCorrect}
                            />
                        );
                    })()}

                    {quizType === 'trueFalse' && currentExercise.tfStatement && (
                        <TrueFalseQuiz
                            question={currentExercise.tfStatement}
                            explanation={currentExercise.explanation}
                            onAnswer={handleAnswer}
                            showResult={showResult}
                            isCorrect={isCorrect}
                        />
                    )}

                    {quizType === 'multipleChoice' && currentExercise.mcQuestion && currentExercise.mcOptions && (
                        <MultipleChoiceQuiz
                            question={currentExercise.mcQuestion}
                            options={currentExercise.mcOptions}
                            correctAnswer={currentExercise.mcOptions[currentExercise.mcCorrectAnswerIndex ?? 0]?.text || ''}
                            explanation={currentExercise.explanation}
                            onAnswer={handleAnswer}
                            showResult={showResult}
                            isCorrect={isCorrect}
                        />
                    )}

                    {showResult && (
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            style={{ marginTop: 20 }}
                        >
                            {currentIndex < exercises.length - 1 ? 'Next Question →' : '🎉 Finish Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
