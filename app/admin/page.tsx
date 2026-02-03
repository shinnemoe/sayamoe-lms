'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Topic, Exercise, User } from '@/types';
import Papa from 'papaparse';
import { Download, Upload, Plus, Trash2, Users, BookOpen, GraduationCap, Package } from 'lucide-react';

interface Class {
    id: string;
    name: string;
    teacherId: string;
    createdAt: Date;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'classes' | 'topics' | 'exercises'>('classes');

    // Classes
    const [classes, setClasses] = useState<Class[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('');

    // Students
    const [allStudents, setAllStudents] = useState<User[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<User[]>([]);
    const [selectedClassForStudent, setSelectedClassForStudent] = useState<Record<string, string>>({});

    // Topics
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDesc, setNewTopicDesc] = useState('');
    const [topicClassIds, setTopicClassIds] = useState<string[]>([]);
    const [editingTopic, setEditingTopic] = useState<string | null>(null);
    const [editingClassIds, setEditingClassIds] = useState<string[]>([]);

    // Exercises
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        loadClasses();
        loadStudents();
        loadTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            loadExercises(selectedTopic);
        }
    }, [selectedTopic]);

    const loadClasses = async () => {
        const snapshot = await getDocs(collection(db, 'classes'));
        setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[]);
    };

    const loadStudents = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const snapshot = await getDocs(q);
        const students = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: doc.id,
                email: data.email,
                role: data.role,
                name: data.name,
                classId: data.classId,
                createdAt: data.createdAt
            } as User;
        });
        setAllStudents(students);
        setUnassignedStudents(students.filter(s => !s.classId));
    };

    const loadTopics = async () => {
        const snapshot = await getDocs(collection(db, 'topics'));
        setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topic[]);
    };

    const loadExercises = async (topicId: string) => {
        const snapshot = await getDocs(collection(db, 'exercises'));
        const allExercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exercise[];
        setExercises(allExercises.filter(ex => ex.topicId === topicId));
    };

    const createClass = async () => {
        if (!newClassName) return;
        await addDoc(collection(db, 'classes'), {
            name: newClassName,
            teacherId: 'admin',
            createdAt: new Date()
        });
        setNewClassName('');
        loadClasses();
    };

    const deleteClass = async (id: string) => {
        if (confirm('Delete this class? Students will be unassigned.')) {
            // Unassign students from this class
            const studentsInClass = allStudents.filter(s => s.classId === id);
            for (const student of studentsInClass) {
                await updateDoc(doc(db, 'users', student.uid), { classId: null });
            }

            await deleteDoc(doc(db, 'classes', id));
            loadClasses();
            loadStudents();
        }
    };

    const assignStudentToClass = async (studentId: string, classId: string) => {
        await updateDoc(doc(db, 'users', studentId), { classId });
        loadStudents();
    };

    const removeStudentFromClass = async (studentId: string) => {
        await updateDoc(doc(db, 'users', studentId), { classId: null });
        loadStudents();
    };

    const createTopic = async () => {
        if (!newTopicName) return;
        await addDoc(collection(db, 'topics'), {
            name: newTopicName,
            description: newTopicDesc,
            teacherId: 'admin',
            classIds: topicClassIds,
            createdAt: new Date()
        });
        setNewTopicName('');
        setNewTopicDesc('');
        setTopicClassIds([]);
        loadTopics();
    };

    const updateTopicClasses = async (topicId: string, classIds: string[]) => {
        await updateDoc(doc(db, 'topics', topicId), { classIds });
        loadTopics();
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

    const deleteBatch = async (batchId: string, count: number) => {
        if (confirm(`Delete all ${count} exercises from this upload batch?`)) {
            const exercisesQuery = query(
                collection(db, 'exercises'),
                where('uploadBatchId', '==', batchId)
            );
            const snapshot = await getDocs(exercisesQuery);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            loadExercises(selectedTopic);
            alert(`✅ Deleted ${count} exercises!`);
        }
    };

    const downloadTemplate = (quizType: 'multipleChoice' | 'unscramble' | 'trueFalse') => {
        let csvContent = '';
        let filename = '';

        switch (quizType) {
            case 'multipleChoice':
                csvContent = 'question,answer,distractor1,distractor2,distractor3,explanation\n' +
                    'What is the capital of France?,Paris,London,Berlin,Madrid,Paris is the capital and largest city of France\n' +
                    'What color is the sky?,Blue,Red,Green,Yellow,The sky appears blue due to Rayleigh scattering';
                filename = 'multiple_choice_template.csv';
                break;
            case 'unscramble':
                csvContent = 'question,prompt,answer,explanation\n' +
                    'What does this mean in English?,Arrange the words,I love learning English,Subject + Verb + Object order in English\n' +
                    'Translate to English,Put in correct order,The cat is sleeping,Article + Noun + Verb structure';
                filename = 'unscramble_template.csv';
                break;
            case 'trueFalse':
                csvContent = 'statement,answer,explanation\n' +
                    'The Earth is flat,false,The Earth is a sphere (oblate spheroid)\n' +
                    'Water boils at 100 degrees Celsius,true,At sea level atmospheric pressure water boils at 100°C';
                filename = 'true_false_template.csv';
                break;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTopic) {
            alert('Please select a topic first!');
            return;
        }

        // Use FileReader with UTF-8 encoding to read the file first
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;

            Papa.parse(text, {
                header: true,
                complete: async (results: any) => {
                    try {
                        const rows = results.data.filter((row: any) =>
                            Object.values(row).some(val => val && String(val).trim())
                        );

                        if (rows.length === 0) {
                            alert('❌ No valid data found in CSV');
                            return;
                        }

                        const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
                        let quizType: 'multipleChoice' | 'unscramble' | 'trueFalse' | null = null;

                        if (headers.includes('distractor1') || headers.includes('option1')) {
                            quizType = 'multipleChoice';
                        } else if (headers.includes('prompt')) {
                            quizType = 'unscramble';
                        } else if (headers.includes('statement')) {
                            quizType = 'trueFalse';
                        }

                        if (!quizType) {
                            alert('❌ Could not detect quiz type. Use templates!');
                            return;
                        }

                        let count = 0;

                        // Generate unique batch ID for this upload
                        const uploadBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                        for (const row of rows) {
                            let exerciseData: any = {
                                topicId: selectedTopic,
                                quizType,
                                order: exercises.length + count,
                                uploadBatchId,  // Track which upload this exercise belongs to
                                createdAt: new Date()
                            };

                            if (quizType === 'multipleChoice') {
                                const question = row.question || row.Question;
                                const correctAnswer = row.answer || row.correctAnswer;

                                if (!question || !correctAnswer) continue;

                                const options: string[] = [correctAnswer.trim()];

                                for (let i = 1; i <= 10; i++) {
                                    const distractor = row[`distractor${i}`] || row[`option${i}`];
                                    if (distractor && String(distractor).trim()) {
                                        options.push(String(distractor).trim());
                                    }
                                }

                                const shuffled = [...options].sort(() => Math.random() - 0.5);
                                const correctIndex = shuffled.indexOf(correctAnswer.trim());

                                exerciseData.mcQuestion = question.trim();
                                exerciseData.mcOptions = shuffled.map((text: string) => ({ text }));
                                exerciseData.mcCorrectAnswerIndex = correctIndex;

                                // Optional explanation
                                if (row.explanation) {
                                    exerciseData.explanation = String(row.explanation).trim();
                                }

                            } else if (quizType === 'unscramble') {
                                const question = row.question || row.Question;
                                const prompt = row.prompt || row.Prompt || 'Arrange the words in the correct order';
                                const answer = row.answer || row.sentence;

                                if (!answer) continue;

                                // Optional question for context
                                if (question) {
                                    exerciseData.unscrambleQuestion = String(question).trim();
                                }
                                exerciseData.unscramblePrompt = String(prompt).trim();
                                exerciseData.unscrambleAnswer = String(answer).trim();

                                // Optional explanation
                                if (row.explanation) {
                                    exerciseData.explanation = String(row.explanation).trim();
                                }

                            } else if (quizType === 'trueFalse') {
                                const statement = row.statement || row.Statement;
                                const answer = row.answer || row.Answer;

                                if (!statement || !answer) continue;

                                exerciseData.tfStatement = String(statement).trim();
                                exerciseData.tfAnswer = String(answer).toLowerCase() === 'true' ||
                                    String(answer).toLowerCase() === 't' ||
                                    answer === '1';

                                // Optional explanation
                                if (row.explanation) {
                                    exerciseData.explanation = String(row.explanation).trim();
                                }
                            }

                            await addDoc(collection(db, 'exercises'), exerciseData);
                            count++;
                        }

                        alert(`✅ Imported ${count} ${quizType} exercises!`);
                        loadExercises(selectedTopic);
                        e.target.value = '';
                    } catch (error: any) {
                        console.error(error);
                        alert('❌ Error importing: ' + error.message);
                    }
                },
                error: (error: any) => {
                    alert('❌ Error parsing CSV: ' + error.message);
                }
            });
        };

        reader.onerror = () => {
            alert('❌ Error reading file');
        };

        // Read the file as UTF-8 text
        reader.readAsText(file, 'UTF-8');
    };

    const getStudentsInClass = (classId: string) => {
        return allStudents.filter(s => s.classId === classId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">⚡ Teacher Dashboard</h1>
                <p className="text-gray-600 mb-8">Manage classes, topics, and exercises</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'classes'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        Classes & Students
                    </button>
                    <button
                        onClick={() => setActiveTab('topics')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'topics'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        Topics
                    </button>
                    <button
                        onClick={() => setActiveTab('exercises')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'exercises'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <GraduationCap className="w-5 h-5" />
                        Exercises
                    </button>
                </div>

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Create Class */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">📚 Classes</h2>

                            <div className="mb-4 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Class name (e.g., Grade 10A)"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={createClass}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Class
                                </button>
                            </div>

                            <div className="space-y-2">
                                {classes.map(cls => {
                                    const studentsInClass = getStudentsInClass(cls.id);
                                    return (
                                        <div key={cls.id} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                                                    <p className="text-sm text-gray-600">{studentsInClass.length} students</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedClass(selectedClass === cls.id ? '' : cls.id)}
                                                        className={`px-3 py-1 rounded-lg text-sm ${selectedClass === cls.id
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            }`}
                                                    >
                                                        {selectedClass === cls.id ? 'Hide' : 'Manage'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteClass(cls.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {selectedClass === cls.id && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Students in this class:</p>
                                                    {studentsInClass.length === 0 ? (
                                                        <p className="text-sm text-gray-500 italic">No students assigned</p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {studentsInClass.map(student => (
                                                                <div key={student.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                                                    <span>{student.name} ({student.email})</span>
                                                                    <button
                                                                        onClick={() => removeStudentFromClass(student.uid)}
                                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Unassigned Students */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">👥 Unassigned Students</h2>

                            {unassignedStudents.length === 0 ? (
                                <p className="text-gray-500 text-center py-12">No unassigned students</p>
                            ) : (
                                <div className="space-y-3">
                                    {unassignedStudents.map(student => (
                                        <div key={student.uid} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                                <p className="text-sm text-gray-600">{student.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={selectedClassForStudent[student.uid] || ''}
                                                    onChange={(e) => setSelectedClassForStudent({
                                                        ...selectedClassForStudent,
                                                        [student.uid]: e.target.value
                                                    })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">Select a class...</option>
                                                    {classes.map(cls => (
                                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        const classId = selectedClassForStudent[student.uid];
                                                        if (classId) {
                                                            assignStudentToClass(student.uid, classId);
                                                            // Clear selection after assignment
                                                            const newSelection = { ...selectedClassForStudent };
                                                            delete newSelection[student.uid];
                                                            setSelectedClassForStudent(newSelection);
                                                        }
                                                    }}
                                                    disabled={!selectedClassForStudent[student.uid]}
                                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Topics Tab */}
                {activeTab === 'topics' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">📖 Topics</h2>

                        <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
                            <h3 className="font-semibold mb-3 text-gray-900">Create New Topic</h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Topic name"
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newTopicDesc}
                                    onChange={(e) => setNewTopicDesc(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Assign to classes:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {classes.map(cls => (
                                            <label key={cls.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={topicClassIds.includes(cls.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setTopicClassIds([...topicClassIds, cls.id]);
                                                        } else {
                                                            setTopicClassIds(topicClassIds.filter(id => id !== cls.id));
                                                        }
                                                    }}
                                                    className="rounded text-indigo-600"
                                                />
                                                <span className="text-sm">{cls.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={createTopic}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Topic
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {topics.map(topic => {
                                const assignedClasses = classes.filter(c => topic.classIds?.includes(c.id));
                                return (
                                    <div key={topic.id} className="p-4 border border-gray-200 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {assignedClasses.length === 0 ? (
                                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Not assigned to any class</span>
                                                    ) : (
                                                        assignedClasses.map(cls => (
                                                            <span key={cls.id} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                                                {cls.name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingTopic(topic.id);
                                                        setEditingClassIds(topic.classIds || []);
                                                    }}
                                                    className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                >
                                                    Edit Classes
                                                </button>
                                                <button
                                                    onClick={() => deleteTopic(topic.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Edit Topic Classes Modal */}
                        {editingTopic && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditingTopic(null)}>
                                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">Assign Classes to Topic</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Topic: <span className="font-semibold">{topics.find(t => t.id === editingTopic)?.name}</span>
                                    </p>
                                    <div className="space-y-2 mb-6">
                                        {classes.map(cls => (
                                            <label key={cls.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={editingClassIds.includes(cls.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditingClassIds([...editingClassIds, cls.id]);
                                                        } else {
                                                            setEditingClassIds(editingClassIds.filter(id => id !== cls.id));
                                                        }
                                                    }}
                                                    className="rounded text-indigo-600 w-4 h-4"
                                                />
                                                <span className="font-medium">{cls.name}</span>
                                            </label>
                                        ))}
                                        {classes.length === 0 && (
                                            <p className="text-gray-500 text-sm text-center py-4">No classes created yet. Go to Classes tab to create one.</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingTopic(null)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateTopicClasses(editingTopic, editingClassIds);
                                                setEditingTopic(null);
                                            }}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Exercises Tab */}
                {activeTab === 'exercises' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">📝 Exercises</h2>

                        {/* Topic Selector */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select a topic to manage exercises:
                            </label>
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Choose a topic...</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name} ({topic.description})
                                    </option>
                                ))}
                            </select>
                            {topics.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">No topics created yet. Go to Topics tab to create one.</p>
                            )}
                        </div>

                        {selectedTopic ? (
                            <>
                                <div className="mb-4 p-3 bg-indigo-50 rounded-xl">
                                    <p className="text-sm text-gray-700">
                                        Managing exercises for: <span className="font-semibold">{topics.find(t => t.id === selectedTopic)?.name}</span>
                                    </p>
                                </div>

                                <div className="mb-4 space-y-2">
                                    <h3 className="font-semibold text-gray-700">Download CSV Templates:</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => downloadTemplate('multipleChoice')}
                                            className="flex items-center justify-center gap-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                        >
                                            <Download className="w-3 h-3" />
                                            Multiple Choice
                                        </button>
                                        <button
                                            onClick={() => downloadTemplate('unscramble')}
                                            className="flex items-center justify-center gap-1 text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                        >
                                            <Download className="w-3 h-3" />
                                            Unscramble
                                        </button>
                                        <button
                                            onClick={() => downloadTemplate('trueFalse')}
                                            className="flex items-center justify-center gap-1 text-sm px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                        >
                                            <Download className="w-3 h-3" />
                                            True/False
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl cursor-pointer hover:shadow-lg">
                                        <Upload className="w-5 h-5" />
                                        <span>Upload CSV (Auto-detect type)</span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {exercises.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No exercises yet. Upload a CSV!</p>
                                    ) : (() => {
                                        // Group exercises by batch
                                        const batchGroups: { [key: string]: Exercise[] } = {};
                                        exercises.forEach(ex => {
                                            const batch = ex.uploadBatchId || 'unbatched';
                                            if (!batchGroups[batch]) batchGroups[batch] = [];
                                            batchGroups[batch].push(ex);
                                        });

                                        return Object.entries(batchGroups).map(([batchId, batchExercises]) => (
                                            <div key={batchId} className="border-2 border-indigo-200 rounded-xl p-3 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-indigo-600" />
                                                        <span className="font-semibold text-sm text-indigo-700">
                                                            {batchId === 'unbatched' ? 'Individual Exercises' : `Upload Batch (${batchExercises.length} exercises)`}
                                                        </span>
                                                        <span className="text-xs bg-indigo-100 px-2 py-1 rounded">
                                                            {batchExercises[0]?.quizType}
                                                        </span>
                                                    </div>
                                                    {batchId !== 'unbatched' && (
                                                        <button
                                                            onClick={() => deleteBatch(batchId, batchExercises.length)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-semibold"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete Batch
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {batchExercises.map(ex => (
                                                        <div key={ex.id} className="flex items-start justify-between p-2 bg-gray-50 rounded-lg">
                                                            <div className="flex-1">
                                                                <p className="text-sm">
                                                                    {ex.mcQuestion || ex.unscramblePrompt || ex.tfStatement}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteExercise(ex.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                                                                title="Delete single exercise"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-2">Please select a topic from the dropdown above</p>
                                <p className="text-sm text-gray-400">Choose a topic to upload exercises and manage content</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
