
import React, { useState, useRef } from 'react';
import { User } from '../types';
import KnowledgeBaseModal from './KnowledgeBaseModal';

interface LoginScreenProps {
    onLoginAttempt: (user: User) => void;
    users: User[];
    onViewPublic: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginAttempt, users, onViewPublic }) => {
    const [mode, setMode] = useState<'login' | 'forgot-email' | 'forgot-code' | 'forgot-reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isKnowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
    
    const quickAccessUser = (user: User) => {
         onLoginAttempt(user);
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.email === email);
        // Para la demo, cualquier contraseña es válida si el usuario existe
        if (user) {
            setError('');
            onLoginAttempt(user);
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    const handlePasswordRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            setError('');
            setMode('forgot-code');
        } else {
            setError('Si este correo está registrado, recibirás un código.');
        }
    };
    
    const renderLogin = () => (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-white mb-2">Iniciar Sesión</h2>
            <p className="text-center text-gray-400 mb-6">Ingresa a tu cuenta para continuar.</p>
             <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Ingresar</button>
            </form>
            <div className="text-center mt-4">
                <button onClick={() => setMode('forgot-email')} className="text-sm text-purple-400 hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
        </div>
    );
    
     const renderForgotEmail = () => (
        <div className="animate-fade-in">
             <h2 className="text-2xl font-bold text-center text-white mb-2">Recuperar Contraseña</h2>
             <p className="text-center text-gray-400 mb-6">Ingresa tu correo para recibir un código de verificación.</p>
             <form onSubmit={handlePasswordRecovery} className="space-y-4">
                 <div>
                     <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                     <input type="email" id="email-forgot" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                 </div>
                 {error && <p className="text-yellow-400 text-sm">{error}</p>}
                 <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Enviar Código</button>
             </form>
             <div className="text-center mt-4">
                 <button onClick={() => { setError(''); setMode('login'); }} className="text-sm text-gray-400 hover:underline">Volver a Inicio de Sesión</button>
             </div>
        </div>
    );

    const renderForgotCode = () => (
         <div className="animate-fade-in">
             <h2 className="text-2xl font-bold text-center text-white mb-2">Verificar Código</h2>
             <p className="text-center text-gray-400 mb-6">Ingresa el código de 6 dígitos que enviamos a tu correo. (Demo: cualquier código es válido)</p>
             <form onSubmit={(e) => { e.preventDefault(); setMode('forgot-reset'); }} className="space-y-4">
                 <input type="text" placeholder="------" maxLength={6} className="w-full text-center tracking-[1em] font-mono text-2xl bg-gray-700 border border-gray-600 rounded-md py-3 px-3 text-white"/>
                 <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Verificar</button>
             </form>
        </div>
    );

    const renderForgotReset = () => (
         <div className="animate-fade-in">
             <h2 className="text-2xl font-bold text-center text-white mb-2">Nueva Contraseña</h2>
             <p className="text-center text-gray-400 mb-6">Ingresa una nueva contraseña segura para tu cuenta.</p>
             <form onSubmit={(e) => { e.preventDefault(); alert("Contraseña cambiada (simulación)."); setMode('login'); }} className="space-y-4">
                 <input type="password" placeholder="Nueva contraseña" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                 <input type="password" placeholder="Confirmar nueva contraseña" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                 <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg">Cambiar Contraseña</button>
             </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
            <header className="text-center mb-10">
                 <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Sistema de Actas Automatizadas
                </h1>
                <p className="text-gray-400 mt-2 font-semibold text-lg">
                    GAD Municipal del Cantón Pastaza
                </p>
            </header>
            
            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto">
                    {mode === 'login' && renderLogin()}
                    {mode === 'forgot-email' && renderForgotEmail()}
                    {mode === 'forgot-code' && renderForgotCode()}
                    {mode === 'forgot-reset' && renderForgotReset()}
                </div>
                
                <div className="text-center lg:text-left">
                     <h3 className="text-2xl font-bold text-gray-200">Acceso Rápido (Demo)</h3>
                     <p className="text-gray-400 mt-2 mb-6">O selecciona un usuario para una demostración rápida.</p>
                    <div className="space-y-3 max-w-md mx-auto">
                        {users.map(user => (
                            <button key={user.id} onClick={() => quickAccessUser(user)} className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-purple-900/40 border border-gray-600 hover:border-purple-500 transition-colors">
                                <p className="font-bold text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </button>
                        ))}
                    </div>
                     <div className="mt-8 border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-bold text-gray-200">¿Solo quieres explorar?</h3>
                        <div className="mt-3 w-full max-w-md mx-auto space-y-3">
                            <button onClick={onViewPublic} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-transform transform hover:scale-105">
                                <i className="fas fa-eye"></i>
                                Ver Repositorio Público
                            </button>
                             <button onClick={() => setKnowledgeBaseOpen(true)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-transform transform hover:scale-105">
                                <i className="fas fa-book-open"></i>
                                Base de Conocimiento
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {isKnowledgeBaseOpen && <KnowledgeBaseModal onClose={() => setKnowledgeBaseOpen(false)} />}
        </div>
    );
};

export default LoginScreen;