'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { BookOpen, Home, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
    userRole: 'teacher' | 'student';
    userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const navLinks = userRole === 'teacher'
        ? [
            { name: 'Dashboard', href: '/teacher/dashboard', icon: Home },
            { name: 'Classes', href: '/teacher/classes', icon: Users },
        ]
        : [
            { name: 'Dashboard', href: '/student/dashboard', icon: Home },
        ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <button
                            onClick={() => router.push(userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')}
                            className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                        >
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                            <span>Sayamoe Twante</span>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => router.push(link.href)}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.name}</span>
                                </button>
                            );
                        })}

                        {/* User Menu */}
                        <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-gray-900"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => {
                                        router.push(link.href);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.name}</span>
                                </button>
                            );
                        })}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="px-3 py-2">
                                <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-2 px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
