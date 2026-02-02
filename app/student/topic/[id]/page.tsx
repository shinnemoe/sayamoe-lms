'use client';

import { useRouter, useParams } from 'next/navigation';
import { QuizType } from '@/types';

const quizTypes: { type: QuizType; emoji: string; title: string; description: string }[] = [
    {
        type: 'multipleChoice',
        emoji: '📝',
        title: 'Multiple Choice',
        description: 'Choose the correct answer'
    },
    {
        type: 'unscramble',
        emoji: '🔤',
        title: 'Unscramble',
        description: 'Put the words in the right order'
    }
];

export default function TopicPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.id as string;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/student/dashboard')}
                    className="mb-6 px-4 py-2 bg-white rounded-xl shadow hover:shadow-lg transition-all"
                >
                    ← Back
                </button>

                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Choose Quiz Type
                </h1>
                <p className="text-gray-600 mb-8">Select how you want to practice</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quizTypes.map((quiz) => (
                        <div
                            key={quiz.type}
                            onClick={() => router.push(`/student/quiz/${topicId}/${quiz.type}`)}
                            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center"
                        >
                            <div className="text-6xl mb-4">{quiz.emoji}</div>
                            <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
                            <p className="text-gray-600 text-sm">{quiz.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
