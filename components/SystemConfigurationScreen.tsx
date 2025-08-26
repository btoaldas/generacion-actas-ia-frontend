import React, { useState } from 'react';
import { SystemConfig, AiModelConfig, TranscriptionModelConfig } from '../types';

interface AiConfigurationScreenProps {
    config: SystemConfig;
    onSave: (config: Partial<SystemConfig>) => void;
    onBack: () => void;
}

const AiModelModal: React.FC<{
    model: AiModelConfig | null,
    onClose: () => void,
    onSave: (model: AiModelConfig) => void
}> = ({ model, onClose, onSave }) => {
    const [formData, setFormData] = useState<AiModelConfig>(model || { id: `gen_${Date.now()}`, name: '', provider: 'Gemini', modelIdentifier: '', apiKey: '', baseUrl: '' });

    const handleSave = () => {
        if (!formData.name || !formData.modelIdentifier) {
            alert("El Nombre y el Identificador del Modelo son requeridos.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{model ? 'Editar' : 'Añadir'} Modelo de Generación</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre (Ej: Mi Modelo GPT)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                    <select value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value as AiModelConfig['provider'] })} className="w-full bg-gray-700 p-2 rounded">
                        <option>Gemini</option><option>OpenAI</option><option>DeepSeek</option><option>Ollama</option><option>Other</option>
                    </select>
                    <input type="text" placeholder="Identificador del Modelo (Ej: gpt-4o)" value={formData.modelIdentifier} onChange={e => setFormData({ ...formData, modelIdentifier: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                    <input type="text" placeholder="Clave de API (opcional)" value={formData.apiKey || ''} onChange={e => setFormData({ ...formData, apiKey: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                    <input type="text" placeholder="URL Base (opcional, para Ollama/locales)" value={formData.baseUrl || ''} onChange={e => setFormData({ ...formData, baseUrl: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 rounded">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const TranscriptionModelModal: React.FC<{
    model: TranscriptionModelConfig | null,
    onClose: () => void,
    onSave: (model: TranscriptionModelConfig) => void
}> = ({ model, onClose, onSave }) => {
    const [formData, setFormData] = useState<TranscriptionModelConfig>(model || { id: `trans_${Date.now()}`, name: '', type: 'Whisper', details: 'large-v3', diarization: 'Pyannote', apiKey: '', baseUrl: '' });
    
    const handleSave = () => {
        if (!formData.name || !formData.details) {
            alert("El Nombre y los Detalles son requeridos.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                 <h3 className="text-xl font-bold mb-4">{model ? 'Editar' : 'Añadir'} Modelo de Transcripción</h3>
                 <div className="space-y-4">
                     <input type="text" placeholder="Nombre (Ej: Whisper Preciso)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                     <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as TranscriptionModelConfig['type'] })} className="w-full bg-gray-700 p-2 rounded">
                        <option>Whisper</option><option>Other</option>
                    </select>
                     <input type="text" placeholder="Detalles (Ej: large-v3)" value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                     <select value={formData.diarization} onChange={e => setFormData({ ...formData, diarization: e.target.value as TranscriptionModelConfig['diarization'] })} className="w-full bg-gray-700 p-2 rounded">
                        <option>Pyannote</option><option>NeMo</option><option>Other</option>
                    </select>
                     <input type="text" placeholder="Clave de API (opcional)" value={formData.apiKey || ''} onChange={e => setFormData({ ...formData, apiKey: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                    <input type="text" placeholder="URL Base (opcional)" value={formData.baseUrl || ''} onChange={e => setFormData({ ...formData, baseUrl: e.target.value })} className="w-full bg-gray-700 p-2 rounded"/>
                 </div>
                 <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 rounded">Guardar</button>
                </div>
            </div>
        </div>
    )
};


const AiConfigurationScreen: React.FC<AiConfigurationScreenProps> = ({ config, onSave, onBack }) => {
    const [generationModels, setGenerationModels] = useState<AiModelConfig[]>(config.generationModels);
    const [transcriptionModels, setTranscriptionModels] = useState<TranscriptionModelConfig[]>(config.transcriptionModels);

    // Estados de los modales
    const [isGenModalOpen, setGenModalOpen] = useState(false);
    const [editingGenModel, setEditingGenModel] = useState<AiModelConfig | null>(null);
    const [isTransModalOpen, setTransModalOpen] = useState(false);
    const [editingTransModel, setEditingTransModel] = useState<TranscriptionModelConfig | null>(null);


    const handleSaveGenModel = (model: AiModelConfig) => {
        setGenerationModels(prev => {
            const exists = prev.some(m => m.id === model.id);
            return exists ? prev.map(m => m.id === model.id ? model : m) : [...prev, model];
        });
    };

    const handleDeleteGenModel = (id: string) => {
        setGenerationModels(prev => prev.filter(m => m.id !== id));
    };
    
    const handleSaveTransModel = (model: TranscriptionModelConfig) => {
        setTranscriptionModels(prev => {
            const exists = prev.some(m => m.id === model.id);
            return exists ? prev.map(m => m.id === model.id ? model : m) : [...prev, model];
        });
    };
    
    const handleDeleteTransModel = (id: string) => {
        setTranscriptionModels(prev => prev.filter(m => m.id !== id));
    };
    
    const handleSave = () => {
        onSave({ generationModels, transcriptionModels });
    };

    return (
        <div className="animate-fade-in">
            {isGenModalOpen && <AiModelModal model={editingGenModel} onClose={() => setGenModalOpen(false)} onSave={handleSaveGenModel} />}
            {isTransModalOpen && <TranscriptionModelModal model={editingTransModel} onClose={() => setTransModalOpen(false)} onSave={handleSaveTransModel} />}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Configuración de IA
                </h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Añade, edita y elimina los modelos de Inteligencia Artificial que se usarán para la transcripción y la generación de actas.
            </p>

            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* AI Models */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-300">Generación de Actas</h4>
                                <button onClick={() => { setEditingGenModel(null); setGenModalOpen(true); }} className="text-sm text-purple-400 hover:text-purple-300"><i className="fas fa-plus mr-1"></i>Añadir</button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                {generationModels.map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                                        <div>
                                            <p className="text-sm font-semibold">{m.name}</p>
                                            <p className="text-xs text-gray-400">{m.provider} - {m.modelIdentifier}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => { setEditingGenModel(m); setGenModalOpen(true); }} className="text-xs px-2 py-1 text-gray-300 hover:text-white">Editar</button>
                                            <button onClick={() => handleDeleteGenModel(m.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300">Borrar</button>
                                        </div>
                                    </div>
                                ))}
                                {generationModels.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No hay modelos de generación.</p>}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-300">Transcripción</h4>
                                <button onClick={() => { setEditingTransModel(null); setTransModalOpen(true); }} className="text-sm text-purple-400 hover:text-purple-300"><i className="fas fa-plus mr-1"></i>Añadir</button>
                            </div>
                             <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                {transcriptionModels.map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                                        <div>
                                            <p className="text-sm font-semibold">{m.name}</p>
                                            <p className="text-xs text-gray-400">{m.type} - {m.details}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => { setEditingTransModel(m); setTransModalOpen(true); }} className="text-xs px-2 py-1 text-gray-300 hover:text-white">Editar</button>
                                            <button onClick={() => handleDeleteTransModel(m.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300">Borrar</button>
                                        </div>
                                    </div>
                                ))}
                                {transcriptionModels.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No hay modelos de transcripción.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                        Guardar Configuración de IA
                    </button>
                </div>
            </div>
        </div>
    );
};

// FIX: Removed incorrect variable redeclaration and export statement.
export default AiConfigurationScreen;
