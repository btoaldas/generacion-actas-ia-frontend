import React, { useState, useRef, useEffect } from 'react';
import { User, AdminView, Role, Permission } from '../types';

interface MainLayoutProps {
    user: User;
    roles: Role[];
    permissions: { [key in Permission]?: boolean };
    onLogout: () => void;
    children: React.ReactNode;
    onNavigate: (view: 'dashboard' | 'administration') => void;
    currentView: 'dashboard' | 'generator' | 'administration' | 'publicViewer';
    adminView: AdminView;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, roles, permissions, onLogout, children, onNavigate, currentView, adminView }) => {
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userRoleName = roles.find(r => r.id === user.roleIds[0])?.name || 'Rol Desconocido';
    
    const getNavClasses = (view: 'dashboard' | 'administration') => {
        const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
        const isActive = (currentView === view);
        return isActive 
            ? `${base} text-white bg-gray-700`
            : `${base} text-gray-400 hover:bg-gray-700 hover:text-white`;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                             <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                SAAP
                            </div>
                            <nav className="hidden md:flex space-x-4">
                                {permissions.viewDashboard && <button onClick={() => onNavigate('dashboard')} className={getNavClasses('dashboard')}>Repositorio</button>}
                                {permissions.viewAdminDashboard && (
                                     <button onClick={() => onNavigate('administration')} className={getNavClasses('administration')}>Administración</button>
                                )}
                            </nav>
                        </div>
                        <div className="relative" ref={profileMenuRef}>
                            <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-white">{user.name}</span>
                                    <span className="text-xs text-gray-400">{userRoleName}</span>
                                </div>
                                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 animate-fade-in-fast z-30">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Mi Perfil</a>
                                    <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
             <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} GAD Municipal del Cantón Pastaza. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default MainLayout;