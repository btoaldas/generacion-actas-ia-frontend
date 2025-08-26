import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Step, Transcription, Template, GeneratedActa, Speaker, ProcessingConfig, ParticipationType, ActaProcessState, SystemConfig, Permission, User, Role } from '../types';
import StepIndicator from './StepIndicator';
import Step1Upload from './Step1Upload';
import StepConfiguration from './StepConfiguration';
import Step2Processing from './Step2Processing';
import StepVerification from './StepVerification';
import Step3Template from './Step3Template';
import Step4Generating from './Step4Generating';
import Step5Editor from './Step5Editor';

interface ActaGeneratorProcessProps {
    actaId: string;
    initialState: ActaProcessState | null;
    onSaveDraft: (actaId: string, state: ActaProcessState) => void;
    onSubmitForApproval: (actaId: string, state: ActaProcessState) => void;
    onExit: () => void;
    permissions: { [key in Permission]?: boolean };
    templates: Template[];
    systemConfig: SystemConfig;
    users: User[];
    roles: Role[];
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ResumeSessionModal: React.FC<{ onConfirm: () => void, onDiscard: () => void }> = ({ onConfirm, onDiscard }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-4">Sesión Incompleta Encontrada</h3>
            <p className="text-gray-400 mb-6">Detectamos un proceso de generación de acta que no se completó. ¿Deseas continuar donde lo dejaste?</p>
            <div className="flex justify-center gap-4">
                <button onClick={onDiscard} className="px-4 py-2 bg-gray-600 rounded-md">Descartar</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-purple-600 rounded-md">Continuar Sesión</button>
            </div>
        </div>
    </div>
);


const ActaGeneratorProcess: React.FC<ActaGeneratorProcessProps> = ({ actaId, initialState, onSaveDraft, onSubmitForApproval, onExit, permissions, templates, systemConfig, users, roles, addToast }) => {
    
    const storageKey = useMemo(() => `actaGeneratorState-${actaId}`, [actaId]);

    const getInitialState = useCallback((): ActaProcessState => {
        const defaultState: ActaProcessState = {
            currentStep: Step.Upload,
            audioFile: null,
            audioFileName: '',
            speakers: [{ id: 1, name: '', cedula: '', role: '', participation: ParticipationType.VozYVoto, institution: 'GAD Municipal del Cantón Pastaza', entryMethod: 'manual' }],
            meetingData: { title: '', date: new Date().toISOString().split('T')[0], type: '', acta_type: '', observations: '' },
            processingConfig: { 
                transcriptionModelId: systemConfig.transcriptionModels[0]?.id || '', 
                generationModelId: systemConfig.generationModels[0]?.id || '', 
                audioEnhancement: false 
            },
            transcription: null,
            selectedTemplate: null,
            generatedActa: null,
            designatedApproverIds: [],
        };
        return initialState || defaultState;
    }, [initialState, systemConfig]);

    const [state, setState] = useState<ActaProcessState>(getInitialState);
    const [error, setError] = useState<string | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);

    // Persiste el estado en localStorage en cada cambio
    useEffect(() => {
        try {
            const stateToSave = { ...state, audioFile: null }; // No se puede guardar el objeto File
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (e) {
            console.error("No se pudo guardar el estado en localStorage", e);
        }
    }, [state, storageKey]);

    // Revisa si hay un estado guardado al montar el componente
    useEffect(() => {
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON) as ActaProcessState;
            if (savedState && savedState.currentStep > (initialState?.currentStep || 0)) {
                setShowResumeModal(true);
            }
        }
    }, [storageKey, initialState]);

    const clearAndRestart = useCallback(() => {
        localStorage.removeItem(storageKey);
        setState(getInitialState());
        setShowResumeModal(false);
    }, [storageKey, getInitialState]);

    const resumeSession = () => {
        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON) as ActaProcessState;
            if(!savedState.audioFileName && savedState.currentStep > Step.Upload){
                 addToast('No se encontró el archivo de audio. Reiniciando proceso.', 'error');
                 clearAndRestart();
                 return;
            }
            if(savedState.audioFileName) {
                 addToast(`Por favor, vuelve a seleccionar el archivo: ${savedState.audioFileName}`, 'info');
                 savedState.currentStep = Step.Upload; 
            }
            setState(savedState);
        }
        setShowResumeModal(false);
    };

    
    const handleExit = () => {
        if (state.currentStep > Step.Upload && state.currentStep < Step.Editor) {
            if (window.confirm("¿Deseas guardar el progreso como un borrador antes de salir?")) {
                 onSaveDraft(actaId, state);
            }
        }
        localStorage.removeItem(storageKey);
        onExit();
    };

    const updateState = (updates: Partial<ActaProcessState>) => {
        setState(prev => ({...prev, ...updates}));
    }
    
    const handleBack = () => {
        const { currentStep } = state;
        
        if (currentStep <= Step.Upload) return;

        let newStep = currentStep;
        const updates: Partial<ActaProcessState> = {};

        switch (currentStep) {
            case Step.Configuration:
                newStep = Step.Upload;
                break;
            case Step.Verification:
                updates.transcription = null;
                newStep = Step.Configuration;
                break;
            case Step.Template:
                newStep = Step.Verification;
                break;
            case Step.Editor:
                updates.generatedActa = null;
                updates.selectedTemplate = null;
                newStep = Step.Template;
                break;
            default:
                newStep = currentStep - 1;
                break;
        }

        setError(null);
        updateState({ ...updates, currentStep: newStep });
    };
    
    const handleSaveAndExit = () => {
        onSaveDraft(actaId, state);
        localStorage.removeItem(storageKey);
    };
    
    const handleSubmit = () => {
        onSubmitForApproval(actaId, state);
        localStorage.removeItem(storageKey);
    };


    const renderStep = () => {
        // Find selected model names for display purposes
        const selectedTransModelName = systemConfig.transcriptionModels.find(m => m.id === state.processingConfig.transcriptionModelId)?.name || 'Desconocido';
        const selectedGenModelName = systemConfig.generationModels.find(m => m.id === state.processingConfig.generationModelId)?.name || 'Desconocido';

        switch (state.currentStep) {
            case Step.Upload:
                return <Step1Upload
                        setAudioFile={(file) => updateState({ audioFile: file, audioFileName: file.name })}
                        speakers={state.speakers}
                        setSpeakers={(speakers) => updateState({ speakers })}
                        meetingData={state.meetingData}
                        setMeetingData={(data) => updateState({ meetingData: data })}
                        onNext={() => updateState({ currentStep: Step.Configuration })}
                        users={users}
                    />;
            case Step.Configuration:
                return <StepConfiguration
                        config={state.processingConfig}
                        setConfig={(config) => updateState({ processingConfig: config })}
                        permissions={permissions}
                        onNext={() => updateState({ currentStep: Step.Processing })}
                        systemConfig={systemConfig}
                        designatedApproverIds={state.designatedApproverIds}
                        setDesignatedApproverIds={(ids) => updateState({ designatedApproverIds: ids })}
                        users={users}
                        roles={roles}
                    />;
            case Step.Processing:
                 // The audioProcessor mock still expects the old string format. We adapt to it here.
                // FIX: The legacyProcessingConfig object was missing properties required by the ProcessingConfig type.
                // Spreading state.processingConfig ensures all required properties are present.
                const legacyProcessingConfig = {
                    ...state.processingConfig,
                    transcriptionModel: selectedTransModelName,
                    diarizationModel: systemConfig.transcriptionModels.find(m => m.id === state.processingConfig.transcriptionModelId)?.diarization || 'Pyannote',
                    aiEngine: selectedGenModelName,
                };
                return <Step2Processing
                        audioFile={state.audioFile}
                        speakers={state.speakers}
                        meetingData={state.meetingData}
                        processingConfig={legacyProcessingConfig}
                        onComplete={(res) => updateState({ transcription: res, currentStep: Step.Verification })}
                        onError={(err) => { setError(err); updateState({ currentStep: Step.Configuration }); }}
                        onSaveAndExit={handleSaveAndExit}
                    />;
            case Step.Verification:
                if (!state.transcription) return null;
                return <StepVerification
                        transcription={state.transcription}
                        setTranscription={(transcription) => updateState({ transcription })}
                        audioFile={state.audioFile}
                        onNext={() => updateState({ currentStep: Step.Template })}
                    />;
            case Step.Template:
                return <Step3Template
                        templates={templates}
                        onNext={(template) => updateState({ selectedTemplate: template, currentStep: Step.Generating })}
                    />;
            case Step.Generating:
                 if (!state.transcription || !state.selectedTemplate) return null;
                return <Step4Generating
                        transcription={state.transcription}
                        template={state.selectedTemplate}
                        aiEngine={selectedGenModelName}
                        onComplete={(acta) => updateState({ generatedActa: acta, currentStep: Step.Editor })}
                        onError={(err) => { setError(err); updateState({ currentStep: Step.Template }); }}
                        onSaveAndExit={handleSaveAndExit}
                    />;
            case Step.Editor:
                 if (!state.generatedActa) return null;
                return <Step5Editor generatedActa={state.generatedActa} systemConfig={systemConfig} onSaveDraft={handleSaveAndExit} onSubmitForApproval={handleSubmit} addToast={addToast}/>;
            default:
                return <div>Paso desconocido</div>;
        }
    };

    const showBackButton = state.currentStep > Step.Upload && 
                           state.currentStep !== Step.Processing && 
                           state.currentStep !== Step.Generating;

    return (
         <div className="w-full bg-gray-800 rounded-2xl shadow-2xl shadow-purple-500/10 border border-gray-700 relative animate-fade-in">
             {showResumeModal && <ResumeSessionModal onConfirm={resumeSession} onDiscard={clearAndRestart} />}
             <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
                {showBackButton && (
                     <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors" title="Paso Anterior">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                )}
                 <button onClick={handleExit} className="text-gray-400 hover:text-white transition-colors" title="Salir del Asistente">
                    <i className="fas fa-times-circle text-2xl"></i>
                 </button>
             </div>
            <div className="p-6 md:p-10">
                <div className="mb-12">
                    <StepIndicator currentStep={state.currentStep} />
                </div>
                {error && (
                    <div className="my-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center flex justify-between items-center">
                        <span><strong>Error:</strong> {error}</span>
                        <button onClick={() => setError(null)} className="ml-4 font-bold text-2xl leading-none">&times;</button>
                    </div>
                )}
                <div className="mt-8">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ActaGeneratorProcess;