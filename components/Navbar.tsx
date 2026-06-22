'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { BookOpen, Home, LogOut, User } from 'lucide-react';

interface NavbarProps {
    userRole: 'teacher' | 'student';
    userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const navLinks = userRole === 'teacher'
        ? [
            { name: 'Home', href: '/teacher/dashboard', icon: Home },
        ]
        : [
            { name: 'Home', href: '/student/dashboard', icon: Home },
        ];

    const dashboardHref = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';

    return (
        <>
            {/* ── Top Header ────────────────────────── */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                background: 'rgba(13, 15, 26, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                paddingTop: 'max(0px, env(safe-area-inset-top))',
            }}>
                <div style={{
                    maxWidth: 640,
                    margin: '0 auto',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <button
                        onClick={() => router.push(dashboardHref)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <div style={{
                            width: 34,
                            height: 34,
                            background: 'linear-gradient(135deg, #7C6EF7, #C084FC)',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                        }}>
                            📚
                        </div>
                        <span style={{
                            fontWeight: 800,
                            fontSize: 16,
                            background: 'linear-gradient(135deg, #7C6EF7, #C084FC)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.3px',
                        }}>
                            Sayamoe
                        </span>
                    </button>

                    {/* User info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}>
                        <div style={{
                            width: 34,
                            height: 34,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <User size={16} color="var(--text-secondary)" />
                        </div>
                        <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            maxWidth: 100,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {userName || 'Student'}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Bottom Navigation ─────────────────── */}
            <nav className="bottom-nav">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '8px 16px 0',
                    maxWidth: 480,
                    margin: '0 auto',
                }}>
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname.startsWith(link.href.replace('/dashboard', ''));
                        return (
                            <button
                                key={link.name}
                                onClick={() => router.push(link.href)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '8px 20px',
                                    background: isActive ? 'rgba(124,110,247,0.15)' : 'transparent',
                                    border: 'none',
                                    borderRadius: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minWidth: 64,
                                    position: 'relative',
                                }}
                            >
                                {isActive && (
                                    <span style={{
                                        position: 'absolute',
                                        top: -1,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 32,
                                        height: 3,
                                        background: 'linear-gradient(90deg, #7C6EF7, #C084FC)',
                                        borderRadius: '0 0 4px 4px',
                                    }} />
                                )}
                                <Icon
                                    size={22}
                                    color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                                />
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    fontFamily: 'inherit',
                                }}>
                                    {link.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* Profile / Logout tab */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: '8px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: 64,
                        }}
                    >
                        <BookOpen size={22} color="var(--text-muted)" />
                        <span style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            fontFamily: 'inherit',
                        }}>
                            Logout
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
}
