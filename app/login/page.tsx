'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email,
                    role,
                    name: email.split('@')[0],
                    createdAt: new Date()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }

            const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
            const userData = userDoc.data();

            if (userData?.role === 'teacher') {
                router.push('/teacher/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');
        try {
            // Use Firebase Anonymous Authentication for guest access
            const userCredential = await signInAnonymously(auth);

            // Store guest user data in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: '',
                role: 'student',
                name: 'Guest Student',
                isGuest: true,
                createdAt: new Date()
            });

            router.push('/student/dashboard');
        } catch (err: any) {
            setError('Failed to create guest account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Sayamoe Twante
                    </h1>
                    <p className="text-gray-600">
                        {role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'} {isSignUp ? 'Sign Up' : 'Login'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-semibold"
                    >
                        {loading ? '⏳ Loading...' : (isSignUp ? '✨ Sign Up' : '🚀 Login')}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-indigo-600 hover:underline text-sm font-medium"
                    >
                        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </button>

                    {role === 'student' && (
                        <button
                            onClick={handleGuestLogin}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all font-semibold border-2 border-gray-200"
                        >
                            👤 Continue as Guest
                        </button>
                    )}

                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => router.push('/login?role=student')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${role === 'student'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            👨‍🎓 Student
                        </button>
                        <button
                            onClick={() => router.push('/login?role=teacher')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${role === 'teacher'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            👨‍🏫 Teacher
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="text-white text-xl animate-pulse">Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
