'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

function Spinner() {
    return (
        <span style={{
            display: 'inline-block',
            width: 18,
            height: 18,
            border: '2.5px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            verticalAlign: 'middle',
            marginRight: 8,
        }} />
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const enrollInAllClasses = async (uid: string) => {
        try {
            const snapshot = await getDocs(collection(db, 'classes'));
            await Promise.all(
                snapshot.docs.map((classDoc) =>
                    updateDoc(doc(db, 'classes', classDoc.id), {
                        studentIds: arrayUnion(uid),
                    })
                )
            );
        } catch (error) {
            console.error('Error enrolling in classes:', error);
        }
    };

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
                if (role === 'student') {
                    await enrollInAllClasses(userCredential.user.uid);
                }
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
            setError(err.message?.replace('Firebase: ', '')?.replace(/\(.*\)\.?/, '') || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const userCredential = await signInAnonymously(auth);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: '',
                role: 'student',
                name: 'Guest Student',
                isGuest: true,
                createdAt: new Date()
            });
            await enrollInAllClasses(userCredential.user.uid);
            router.push('/student/dashboard');
        } catch (err: any) {
            setError('Failed to create guest session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            background: 'var(--bg-base)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated background orbs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div className="animate-float" style={{
                    position: 'absolute', top: '-10%', left: '-10%',
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(124,110,247,0.18) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div className="animate-float" style={{
                    position: 'absolute', bottom: '-5%', right: '-5%',
                    width: 350, height: 350,
                    background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animationDelay: '-3s',
                }} />
                <div className="animate-float" style={{
                    position: 'absolute', top: '40%', right: '15%',
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(34,211,94,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animationDelay: '-1.5s',
                }} />
            </div>

            {/* Card */}
            <div className="glass animate-fadeInUp" style={{
                width: '100%',
                maxWidth: 420,
                borderRadius: 'var(--radius-xl)',
                padding: '40px 32px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div className="animate-pulse-ring" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 72, height: 72,
                        background: 'linear-gradient(135deg, #7C6EF7, #C084FC)',
                        borderRadius: 20,
                        marginBottom: 20,
                        fontSize: 32,
                    }}>
                        📚
                    </div>
                    <h1 className="gradient-text" style={{
                        fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px',
                    }}>
                        Sayamoe Twante
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: 14 }}>
                        {isSignUp ? '✨ Create your account' : '👋 Welcome back, student'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="input-dark"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-dark"
                            required
                        />

                        {error && (
                            <div style={{
                                background: 'rgba(255,92,115,0.12)',
                                border: '1px solid rgba(255,92,115,0.3)',
                                borderRadius: 10,
                                padding: '10px 14px',
                                color: '#FF8FA3',
                                fontSize: 13,
                                textAlign: 'center',
                            }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
                            {loading ? <><Spinner />{isSignUp ? 'Creating account...' : 'Signing in...'}</> : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </div>
                </form>

                {/* Toggle sign up / login */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--accent-secondary)', fontSize: 13, fontWeight: 600,
                            fontFamily: 'inherit',
                        }}
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>

                {/* Guest */}
                <div style={{ marginTop: 16 }}>
                    <button onClick={handleGuestLogin} disabled={loading} className="btn-ghost">
                        {loading ? <><Spinner />Loading...</> : '👤 Continue as Guest'}
                    </button>
                </div>

                {/* Admin hint */}
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
                    Admin?{' '}
                    <a href="/admin" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Go to /admin
                    </a>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base)',
            }}>
                <div style={{ color: 'var(--accent-primary)', fontSize: 18, fontWeight: 600 }}>Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
