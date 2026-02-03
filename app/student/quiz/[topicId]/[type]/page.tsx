'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Exercise, QuizType } from '@/types';
import UnscrambleQuiz from '@/components/quiz/UnscrambleQuiz';
import TrueFalseQuiz from '@/components/quiz/TrueFalseQuiz';
import MultipleChoiceQuiz from '@/components/quiz/MultipleChoiceQuiz';

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

    useEffect(() => {
        loadExercises();
    }, [topicId, quizType]);

    const loadExercises = async () => {
        try {
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
                    <p className="text-gray-600 mb-6">This topic doesn't have any {quizType} exercises yet.</p>
                    <button
                        onClick={() => router.push(`/student/topic/${topicId}`)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        Back to Topic
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
                        <span>Correct: {answers.filter(a => a.isCorrect).length}/{exercises.length}</span>
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
                    {quizType === 'unscramble' && currentExercise.unscrambleAnswer && (() => {
                        // Shuffle words so they're not in correct order
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
                            options={currentExercise.mcOptions.map(opt => opt.text)}
                            correctAnswer={currentExercise.mcOptions[currentExercise.mcCorrectAnswerIndex ?? 0]?.text || ''}
                            explanation={currentExercise.explanation}
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
