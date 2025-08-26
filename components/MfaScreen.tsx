import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface MfaScreenProps {
    user: User;
    onVerifySuccess: () => void;
    onCancel: () => void;
}

const MfaScreen: React.FC<MfaScreenProps> = ({ user, onVerifySuccess, onCancel }) => {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Move to next input
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
        
        // Handle paste
        if (value.length > 1) {
             const pastedCode = value.slice(0, 6).split('');
             setCode(pastedCode.concat(new Array(6 - pastedCode.length).fill('')));
             inputsRef.current[5]?.focus();
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    const handleSubmit = () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Por favor, ingresa el código de 6 dígitos.');
            return;
        }
        // Mock verification: any 6-digit code works
        console.log(`Verifying code ${fullCode} for ${user.email}`);
        setError('');
        onVerifySuccess();
    };

    return (
         <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
              <main className="w-full max-w-md">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
                    <i className="fas fa-shield-alt text-4xl text-purple-400 mb-4"></i>
                    <h2 className="text-2xl font-bold text-white mb-2">Verificación de Dos Pasos</h2>
                    <p className="text-gray-400 mb-6">
                        Se ha enviado un código de seguridad a <span className="font-semibold text-purple-300">{user.email}</span>. (Para esta demo, ingresa cualquier código de 6 dígitos).
                    </p>

                    <div className="flex justify-center gap-2 mb-4">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                // FIX: Wrapped the ref callback in a block statement to ensure it doesn't return a value, satisfying the Ref type.
                                ref={el => { inputsRef.current[index] = el }}
                                type="text"
                                maxLength={6}
                                value={digit}
                                onChange={e => handleChange(e, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        ))}
                    </div>
                    
                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                        Verificar Código
                    </button>

                    <button onClick={onCancel} className="mt-4 text-sm text-gray-400 hover:text-white">
                        Cancelar e ir atrás
                    </button>
                </div>
            </main>
         </div>
    );
};

export default MfaScreen;