import React, { useMemo } from 'react';
import { ProcessingConfig, Permission, SystemConfig, User, Role } from '../types';

interface StepConfigurationProps {
    config: ProcessingConfig;
    setConfig: (config: ProcessingConfig) => void;
    permissions: { [key in Permission]?: boolean };
    onNext: () => void;
    systemConfig: SystemConfig;
    designatedApproverIds: string[];
    setDesignatedApproverIds: (ids: string[]) => void;
    users: User[];
    roles: Role[];
}

const StepConfiguration: React.FC<StepConfigurationProps> = ({ config, setConfig, permissions, onNext, systemConfig, designatedApproverIds, setDesignatedApproverIds, users, roles }) => {
    const canManageConfig = permissions.manageSystemConfig;

    const handleConfigChange = (field: keyof ProcessingConfig, value: string | boolean) => {
        setConfig({ ...config, [field]: value });
    };
    
    const selectedGenModel = useMemo(() => {
        return systemConfig.generationModels.find(m => m.id === config.generationModelId);
    }, [config.generationModelId, systemConfig.generationModels]);

    const modelRequiresApiKey = selectedGenModel?.provider === 'OpenAI' || selectedGenModel?.provider === 'DeepSeek';
    const isModelConfigured = !modelRequiresApiKey || (selectedGenModel?.apiKey && selectedGenModel.apiKey.length > 0);
    const canProceed = isModelConfigured;


    const availableApprovers = useMemo(() => {
        return users;
    }, [users]);

    const handleApproverChange = (userId: string, isChecked: boolean) => {
        if (isChecked) {
            setDesignatedApproverIds([...designatedApproverIds, userId]);
        } else {
            setDesignatedApproverIds(designatedApproverIds.filter(id => id !== userId));
        }
    };

    const OptionCard: React.FC<{
        id: string;
        label: string;
        description: string;
        field: keyof ProcessingConfig;
    }> = ({ id, label, description, field }) => {
        const isSelected = config[field] === id;
        const isDisabled = !canManageConfig;
        return (
            <div
                onClick={() => !isDisabled && handleConfigChange(field, id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                        ? 'bg-purple-900/40 border-purple-500 shadow-md'
                        : `bg-gray-700/50 border-gray-600 ${!isDisabled ? 'cursor-pointer hover:border-gray-500' : 'cursor-not-allowed opacity-60'}`
                }`}
            >
                <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${isSelected ? 'border-purple-400 bg-purple-500' : 'border-gray-400'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-400">{description}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-100 mb-2 text-center">Paso 2: Configuración del Procesamiento</h2>
            <p className="text-gray-400 mb-8 text-center max-w-2xl">
                Define los modelos de IA que se utilizarán y el circuito de aprobación para esta acta.
            </p>

            <div className="w-full max-w-4xl space-y-8">
                {/* Approval Circuit */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Circuito de Aprobación</h3>
                    <div className="p-4 bg-gray-700/50 rounded-lg border-2 border-gray-600">
                        <p className="font-semibold text-white">Seleccionar Aprobadores</p>
                        <p className="text-xs text-gray-400 mb-4">Elige qué usuario(s) debe(n) aprobar esta acta antes de que pueda ser publicada.</p>
                        {availableApprovers.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {availableApprovers.map(user => (
                                    <label key={user.id} className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-md cursor-pointer hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={designatedApproverIds.includes(user.id)}
                                            onChange={e => handleApproverChange(user.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-300">{user.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-yellow-400">No hay usuarios en el sistema para designar.</p>
                        )}
                    </div>
                </div>

                {/* Audio Enhancement */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Pre-procesamiento de Audio</h3>
                    <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${config.audioEnhancement ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-700/50 border-gray-600'} ${!canManageConfig && 'opacity-60'}`}>
                        <div>
                            <p className="font-semibold text-white">Mejora de Audio Automática</p>
                            <p className="text-xs text-gray-400">Elimina ruido de fondo y silencios para mejorar la precisión.</p>
                        </div>
                         <button
                            type="button"
                            onClick={() => canManageConfig && handleConfigChange('audioEnhancement', !config.audioEnhancement)}
                            className={`${config.audioEnhancement ? 'bg-purple-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed`}
                            disabled={!canManageConfig}
                        >
                            <span className={`${config.audioEnhancement ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                        </button>
                    </div>
                </div>
                
                {/* Transcription Model */}
                <div>
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Modelo de Transcripción y Diarización</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {systemConfig.transcriptionModels.map(model => 
                            <OptionCard 
                                key={model.id} 
                                id={model.id} 
                                label={model.name} 
                                description={`${model.type} (${model.details}) con Diarización ${model.diarization}`} 
                                field="transcriptionModelId" 
                            />
                        )}
                    </div>
                </div>

                {/* AI Engine */}
                <div>
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Motor de IA para Generación de Acta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {systemConfig.generationModels.map(model => 
                            <OptionCard 
                                key={model.id} 
                                id={model.id} 
                                label={model.name} 
                                description={`Proveedor: ${model.provider} - Modelo: ${model.modelIdentifier}`} 
                                field="generationModelId" 
                            />
                        )}
                    </div>
                     {!isModelConfigured && selectedGenModel && (
                        <div className="md:col-span-2 mt-2 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md text-sm text-center">
                           El modelo <span className="font-bold">{selectedGenModel.name}</span> requiere una clave de API. Por favor, pídale a un administrador que la configure en la sección de <span className="font-bold">Configuración de IA</span>.
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!canProceed}
                className="mt-12 w-full max-w-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
            >
                Iniciar Procesamiento
            </button>
        </div>
    );
};

export default StepConfiguration;
