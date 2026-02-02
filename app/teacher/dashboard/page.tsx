'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Topic, Class } from '@/types';

export default function TeacherDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDesc, setNewTopicDesc] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login?role=teacher');
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();

            if (userData?.role !== 'teacher') {
                router.push('/login?role=teacher');
                return;
            }

            setUser({ ...currentUser, ...userData });
            await loadData(currentUser.uid);
        });

        return () => unsubscribe();
    }, [router]);

    const loadData = async (teacherId: string) => {
        try {
            const topicsQuery = query(collection(db, 'topics'), where('teacherId', '==', teacherId));
            const topicsSnapshot = await getDocs(topicsQuery);
            setTopics(topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topic[]);

            const classesQuery = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
            const classesSnapshot = await getDocs(classesQuery);
            setClasses(classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[]);

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const createTopic = async () => {
        if (!newTopicName || !auth.currentUser) return;

        try {
            await addDoc(collection(db, 'topics'), {
                name: newTopicName,
                description: newTopicDesc,
                teacherId: auth.currentUser.uid,
                classIds: [],
                createdAt: new Date()
            });

            setNewTopicName('');
            setNewTopicDesc('');
            setShowNewTopic(false);
            await loadData(auth.currentUser.uid);
        } catch (error) {
            console.error('Error creating topic:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-xl animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Teacher Dashboard 👨‍🏫
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your topics and classes</p>
                </div>

                {/* Topics Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Topics</h2>
                        <button
                            onClick={() => setShowNewTopic(!showNewTopic)}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                            + New Topic
                        </button>
                    </div>

                    {showNewTopic && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <input
                                type="text"
                                placeholder="Topic Name"
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <textarea
                                placeholder="Description"
                                value={newTopicDesc}
                                onChange={(e) => setNewTopicDesc(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={3}
                            />
                            <button
                                onClick={createTopic}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                            >
                                Create Topic
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => (
                            <div
                                key={topic.id}
                                onClick={() => router.push(`/teacher/topic/${topic.id}`)}
                                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                <div className="text-4xl mb-4">📖</div>
                                <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                                <p className="text-gray-600 text-sm">{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-2">📚</div>
                        <div className="text-3xl font-bold text-indigo-600">{topics.length}</div>
                        <div className="text-gray-600">Topics</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-2">🏫</div>
                        <div className="text-3xl font-bold text-purple-600">{classes.length}</div>
                        <div className="text-gray-600">Classes</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-2">👨‍🎓</div>
                        <div className="text-3xl font-bold text-pink-600">
                            {classes.reduce((sum, c) => sum + (c.studentIds?.length || 0), 0)}
                        </div>
                        <div className="text-gray-600">Students</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
