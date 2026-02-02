'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Exercise, QuizType } from '@/types';
import { generateQuizVariations, checkAnswer } from '@/lib/quizGenerator';
import UnscrambleQuiz from '@/components/quiz/UnscrambleQuiz';
import TrueFalseQuiz from '@/components/quiz/TrueFalseQuiz';
import MultipleChoiceQuiz from '@/components/quiz/MultipleChoiceQuiz';

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.topicId as string;
    const quizType = params.type as QuizType;

    const [exercises, setExercises] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExercises();
    }, [topicId, quizType]);

    const loadExercises = async () => {
        try {
            const exercisesQuery = query(
                collection(db, 'exercises'),
                where('topicId', '==', topicId)
            );
            const exercisesSnapshot = await getDocs(exercisesQuery);
            const exercisesData = exercisesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exercise[];

            // Generate quiz variations
            const quizData = exercisesData.map(ex => {
                const variations = generateQuizVariations(ex);
                return variations.find(v => v.type === quizType);
            }).filter(Boolean);

            setExercises(quizData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading exercises:', error);
            setLoading(false);
        }
    };

    const handleAnswer = (answer: string | boolean) => {
        const currentExercise = exercises[currentIndex];
        const correct = checkAnswer(answer, currentExercise.correctAnswer, quizType);

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowResult(false);
        } else {
            saveScore();
            router.push('/student/dashboard');
        }
    };

    const saveScore = async () => {
        if (!auth.currentUser) return;

        try {
            const scoreId = `${auth.currentUser.uid}_${topicId}`;
            const scoreRef = doc(db, 'scores', scoreId);
            const existingScore = await getDoc(scoreRef);

            const newScore = {
                studentId: auth.currentUser.uid,
                topicId,
                score,
                maxScore: exercises.length,
                attempts: (existingScore.exists() ? existingScore.data().attempts : 0) + 1,
                lastAttempt: new Date()
            };

            await setDoc(scoreRef, newScore, { merge: true });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl animate-pulse">Loading quiz...</div>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold mb-2">No Exercises</h2>
                    <p className="text-gray-600 mb-6">This topic doesn't have any exercises yet.</p>
                    <button
                        onClick={() => router.push('/student/dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentExercise = exercises[currentIndex];
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {currentIndex + 1} of {exercises.length}</span>
                        <span>Score: {score}/{exercises.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Quiz Component */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {quizType === 'unscramble' && (
                        <UnscrambleQuiz
                            question={currentExercise.question}
                            words={currentExercise.options}
                            onAnswer={handleAnswer}
                            showResult={showResult}
                            isCorrect={isCorrect}
                        />
                    )}

                    {quizType === 'trueFalse' && (
                        <TrueFalseQuiz
                            question={currentExercise.question}
                            onAnswer={handleAnswer}
                            showResult={showResult}
                            isCorrect={isCorrect}
                        />
                    )}

                    {quizType === 'multipleChoice' && (
                        <MultipleChoiceQuiz
                            question={currentExercise.question}
                            options={currentExercise.options}
                            onAnswer={handleAnswer}
                            showResult={showResult}
                            isCorrect={isCorrect}
                        />
                    )}

                    {showResult && (
                        <button
                            onClick={handleNext}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            {currentIndex < exercises.length - 1 ? 'Next Question →' : '🎉 Finish Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
