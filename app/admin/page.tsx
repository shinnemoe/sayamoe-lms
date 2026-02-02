'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Topic, Exercise } from '@/types';
import Papa from 'papaparse';

export default function AdminDashboard() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('');

    // New Topic Form
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDesc, setNewTopicDesc] = useState('');

    // New Exercise Form
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [newDistractors, setNewDistractors] = useState('');

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            loadExercises(selectedTopic);
        }
    }, [selectedTopic]);

    const loadTopics = async () => {
        const snapshot = await getDocs(collection(db, 'topics'));
        setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topic[]);
    };

    const loadExercises = async (topicId: string) => {
        const snapshot = await getDocs(collection(db, 'exercises'));
        const allExercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exercise[];
        setExercises(allExercises.filter(ex => ex.topicId === topicId));
    };

    const createTopic = async () => {
        if (!newTopicName) return;

        await addDoc(collection(db, 'topics'), {
            name: newTopicName,
            description: newTopicDesc,
            teacherId: 'admin',
            classIds: [],
            createdAt: new Date()
        });

        setNewTopicName('');
        setNewTopicDesc('');
        loadTopics();
    };

    const createExercise = async () => {
        if (!newQuestion || !newAnswer || !selectedTopic) return;

        const distractors = newDistractors.split(',').map(d => d.trim()).filter(Boolean);

        await addDoc(collection(db, 'exercises'), {
            topicId: selectedTopic,
            question: newQuestion,
            correctAnswer: newAnswer,
            distractors: distractors.length > 0 ? distractors : undefined,
            order: exercises.length,
            createdAt: new Date()
        });

        setNewQuestion('');
        setNewAnswer('');
        setNewDistractors('');
        loadExercises(selectedTopic);
    };

    const deleteTopic = async (id: string) => {
        if (confirm('Delete this topic?')) {
            await deleteDoc(doc(db, 'topics', id));
            loadTopics();
        }
    };

    const deleteExercise = async (id: string) => {
        if (confirm('Delete this exercise?')) {
            await deleteDoc(doc(db, 'exercises', id));
            loadExercises(selectedTopic);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `question,correctAnswer,wrongAnswer1,wrongAnswer2,wrongAnswer3
What is the capital of Myanmar?,Naypyidaw,Yangon,Mandalay,Bagan
မြန်မာနိုင်ငံ၏ မြို့တော်မှာ ဘယ်မြို့လဲ?,နေပြည်တော်,ရန်ကုန်,မန္တလေး,ပုဂံ
Translate 'Hello',မင်္ဂလာပါ,ဟယ်လို,ဟလို,ဟယ်လော`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'exercise_template.csv';
        link.click();
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTopic) return;

        Papa.parse(file, {
            complete: async (results: any) => {
                const data = results.data as string[][];
                let count = 0;

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    if (row.length < 2 || !row[0] || !row[1]) continue;

                    const question = row[0].trim();
                    const correctAnswer = row[1].trim();
                    const distractors = row.slice(2).map(d => d?.trim()).filter(Boolean);

                    await addDoc(collection(db, 'exercises'), {
                        topicId: selectedTopic,
                        question,
                        correctAnswer,
                        distractors: distractors.length > 0 ? distractors : undefined,
                        order: exercises.length + count,
                        createdAt: new Date()
                    });
                    count++;
                }

                alert(`✅ Imported ${count} exercises!`);
                loadExercises(selectedTopic);
                e.target.value = '';
            },
            error: (error: any) => {
                alert('❌ Error parsing CSV: ' + error.message);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold text-white mb-2">⚡ Admin Dashboard</h1>
                <p className="text-purple-300 mb-8">Manage topics and exercises</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Topics Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">📚 Topics</h2>

                        {/* Create Topic */}
                        <div className="bg-black/20 rounded-xl p-4 mb-4">
                            <input
                                type="text"
                                placeholder="Topic Name"
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newTopicDesc}
                                onChange={(e) => setNewTopicDesc(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-2"
                            />
                            <button
                                onClick={createTopic}
                                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                            >
                                + Create Topic
                            </button>
                        </div>

                        {/* Topics List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {topics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedTopic === topic.id
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedTopic(topic.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white">{topic.name}</h3>
                                            <p className="text-sm text-white/70">{topic.description}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTopic(topic.id);
                                            }}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exercises Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">📝 Exercises</h2>

                        {selectedTopic ? (
                            <>
                                {/* Create Exercise */}
                                <div className="bg-black/20 rounded-xl p-4 mb-4">
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-white/70 text-sm">📤 Upload CSV</label>
                                            <button
                                                onClick={downloadTemplate}
                                                className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs rounded-lg hover:shadow-lg transition-all"
                                            >
                                                ⬇️ Download Template
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-green-600 file:to-teal-600 file:text-white file:cursor-pointer hover:file:shadow-lg"
                                        />
                                        <p className="text-xs text-white/50 mt-1">Format: question,correctAnswer,wrongAnswer1,wrongAnswer2,wrongAnswer3</p>
                                    </div>
                                    <div className="border-t border-white/10 my-3 pt-3">
                                        <p className="text-white/70 text-sm mb-2">Or add manually:</p>
                                        <input
                                            type="text"
                                            placeholder="Question"
                                            value={newQuestion}
                                            onChange={(e) => setNewQuestion(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Correct Answer"
                                            value={newAnswer}
                                            onChange={(e) => setNewAnswer(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Wrong answers (comma separated)"
                                            value={newDistractors}
                                            onChange={(e) => setNewDistractors(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-2"
                                        />
                                        <button
                                            onClick={createExercise}
                                            className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                                        >
                                            + Add Exercise
                                        </button>
                                    </div>
                                </div>

                                {/* Exercises List */}
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {exercises.map((exercise, index) => (
                                        <div
                                            key={exercise.id}
                                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="text-xs text-purple-300 mb-1">Q{index + 1}</div>
                                                    <p className="text-white font-medium mb-1">{exercise.question}</p>
                                                    <p className="text-sm text-green-400">✓ {exercise.correctAnswer}</p>
                                                    {exercise.distractors && (
                                                        <p className="text-xs text-red-400">✗ {exercise.distractors.join(', ')}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteExercise(exercise.id)}
                                                    className="text-red-400 hover:text-red-300 ml-2"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {exercises.length === 0 && (
                                        <p className="text-white/50 text-center py-8">No exercises yet</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-white/50 text-center py-12">Select a topic to manage exercises</p>
                        )}
                    </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-purple-400">{topics.length}</div>
                        <div className="text-white/70 text-sm">Topics</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-blue-400">{exercises.length}</div>
                        <div className="text-white/70 text-sm">Exercises</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-3xl font-bold text-pink-400">3</div>
                        <div className="text-white/70 text-sm">Quiz Types</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
