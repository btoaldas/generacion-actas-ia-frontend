import React, { useState } from 'react';
import { SmtpConfig, SystemConfig } from '../types';

interface SmtpConfigurationScreenProps {
    config: SmtpConfig;
    onSave: (config: Partial<SystemConfig>) => void;
    onBack: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SmtpConfigurationScreen: React.FC<SmtpConfigurationScreenProps> = ({ config, onSave, onBack, addToast }) => {
    const [formData, setFormData] = useState<SmtpConfig>(config);

    const handleChange = (field: keyof SmtpConfig, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSendTestEmail = () => {
        // Simulación
        addToast(`Enviando correo de prueba a ${formData.user}...`, 'info');
        setTimeout(() => {
            addToast('Correo de prueba enviado exitosamente (simulación).', 'success');
        }, 2000);
    };
    
    const handleSave = () => {
        onSave({ smtp: formData });
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Configuración SMTP
                </h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Configura los parámetros del servidor de correo saliente (SMTP) para el envío de notificaciones y otras comunicaciones del sistema.
            </p>

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Parámetros del Servidor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="text-sm text-gray-400">Servidor SMTP (Host)</label>
                            <input type="text" placeholder="smtp.example.com" value={formData.host} onChange={e => handleChange('host', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Puerto</label>
                            <input type="number" placeholder="587" value={formData.port} onChange={e => handleChange('port', parseInt(e.target.value))} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Usuario / Correo</label>
                            <input type="text" placeholder="usuario@example.com" value={formData.user} onChange={e => handleChange('user', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Contraseña</label>
                            <input type="password" placeholder="••••••••" value={formData.pass} onChange={e => handleChange('pass', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Seguridad</label>
                             <select value={formData.security} onChange={e => handleChange('security', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1">
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="none">Ninguna</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Información del Remitente</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="text-sm text-gray-400">Nombre del Remitente</label>
                            <input type="text" placeholder="Sistema de Actas" value={formData.fromName} onChange={e => handleChange('fromName', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                         <div>
                            <label className="text-sm text-gray-400">Email del Remitente</label>
                            <input type="email" placeholder="no-reply@example.com" value={formData.fromEmail} onChange={e => handleChange('fromEmail', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                        </div>
                    </div>
                    <button onClick={handleSendTestEmail} className="mt-6 text-sm bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded">Enviar Correo de Prueba</button>
                </div>


                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                        Guardar Configuración SMTP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmtpConfigurationScreen;
