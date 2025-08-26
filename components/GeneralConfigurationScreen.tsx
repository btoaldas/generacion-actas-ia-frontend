import React, { useState } from 'react';
import { SystemConfig } from '../types';

type GeneralConfig = Pick<SystemConfig, 'institutionName' | 'institutionLogo' | 'isMfaEnabled' | 'sessionTimeout'>;

interface GeneralConfigurationScreenProps {
    config: GeneralConfig;
    onSave: (config: Partial<SystemConfig>) => void;
    onBack: () => void;
}

const GeneralConfigurationScreen: React.FC<GeneralConfigurationScreenProps> = ({ config, onSave, onBack }) => {
    const [formData, setFormData] = useState<GeneralConfig>(config);
    const [logoPreview, setLogoPreview] = useState<string | null>(config.institutionLogo);

    const handleChange = (field: keyof Omit<GeneralConfig, 'isMfaEnabled' | 'institutionLogo'>, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = (field: 'isMfaEnabled') => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
                setFormData(prev => ({ ...prev, institutionLogo: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Configuración General
                </h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Ajusta los detalles de tu institución y las configuraciones de seguridad de la plataforma.
            </p>

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-400 mb-4">Identidad de la Institución</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400">Nombre de la Institución</label>
                                <input type="text" value={formData.institutionName} onChange={e => handleChange('institutionName', e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Logo Institucional</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                        {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain"/> : <span className="text-xs text-gray-500">Logo</span>}
                                    </div>
                                    <input type="file" id="logoUpload" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden"/>
                                    <label htmlFor="logoUpload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md text-sm">Cambiar Logo</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-400 mb-4">Seguridad</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700/50">
                                <label htmlFor="mfa-toggle" className="font-medium text-gray-300 text-sm cursor-pointer">Habilitar Autenticación de Dos Factores (MFA)</label>
                                <button id="mfa-toggle" type="button" onClick={() => handleToggle('isMfaEnabled')} className={`${formData.isMfaEnabled ? 'bg-purple-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent`}>
                                    <span className={`${formData.isMfaEnabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition`}/>
                                </button>
                            </div>
                            <div>
                               <label htmlFor="session-timeout" className="text-sm text-gray-400">Tiempo de Espera de Sesión (inactividad)</label>
                                <select id="session-timeout" value={formData.sessionTimeout} onChange={e => handleChange('sessionTimeout', parseInt(e.target.value))} className="w-full bg-gray-700 p-2 rounded mt-1">
                                    <option value={15}>15 Minutos</option> 
                                    <option value={30}>30 Minutos</option> 
                                    <option value={60}>1 Hora</option>
                                    <option value={120}>2 Horas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                        Guardar Configuración General
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralConfigurationScreen;
