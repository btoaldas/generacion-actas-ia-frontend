import React, { useEffect, useState, useMemo } from 'react';
import { Transcription, Speaker, ProcessingConfig } from '../types';
import { processAudio } from '../services/audioProcessor';
import Spinner from './Spinner';

interface Step2ProcessingProps {
    audioFile: File | null;
    speakers: Speaker[];
    meetingData: { title: string; date: string; type: string; acta_type: string; observations: string; };
    // FIX: The processingConfig prop contains legacy properties for the mock audio processor.
    // The type has been updated to an intersection type to include these properties and fix type errors.
    processingConfig: ProcessingConfig & { transcriptionModel: string; diarizationModel: string; };
    onComplete: (transcription: Transcription) => void;
    onError: (error: string) => void;
    onSaveAndExit: () => void;
}

const Step2Processing: React.FC<Step2ProcessingProps> = ({ audioFile, speakers, meetingData, processingConfig, onComplete, onError, onSaveAndExit }) => {
    
    const [status, setStatus] = useState("Inicializando proceso...");
    const [userChoice, setUserChoice] = useState<'pending' | 'waiting'>('pending');
    const processId = useMemo(() => Math.floor(10000 + Math.random() * 90000), []);
    
    const processingSteps = useMemo(() => {
        const baseSteps = [
            "Inicializando proceso...",
            ...(processingConfig.audioEnhancement ? ["Mejorando calidad de audio (eliminación de ruido)..."] : []),
            // FIX: Accessing property from the legacy config object shape.
            `Aplicando modelo de transcripción (${processingConfig.transcriptionModel})...`,
            // FIX: Accessing property from the legacy config object shape.
            `Aplicando modelo de diarización (${processingConfig.diarizationModel})...`,
            "Segmentando intervenciones por hablante...",
            "Generando estadísticas de la conversación...",
            "Construyendo borrador de transcripción JSON...",
            "Finalizando..."
        ];
        return baseSteps;
    }, [processingConfig]);

    useEffect(() => {
        let stepIndex = 0;
        const totalDuration = processingConfig.audioEnhancement ? 5500 : 4000;
        const stepInterval = totalDuration / processingSteps.length;

        const interval = setInterval(() => {
            stepIndex++;
            if (stepIndex < processingSteps.length) {
                setStatus(processingSteps[stepIndex]);
            } else {
                clearInterval(interval);
            }
        }, stepInterval);

        const runProcessing = async () => {
            if (!audioFile) {
                onError("No se encontró el archivo de audio para procesar.");
                return;
            }
            try {
                const result = await processAudio(audioFile, speakers, meetingData, processingConfig);
                onComplete(result);
            } catch (error) {
                onError(typeof error === 'string' ? error : "Ocurrió un error inesperado durante el procesamiento.");
            }
        };

        runProcessing();

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (userChoice === 'waiting') {
        return (
            <div className="flex flex-col items-center text-center animate-fade-in p-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-6">Paso 3: Procesando Audio con IA</h2>
                <p className="text-gray-400 mb-8">
                    Nuestros modelos están analizando el audio. Este proceso puede tardar varios minutos dependiendo de la duración.
                </p>
                <div className="my-8">
                    <Spinner />
                </div>
                <p className="text-lg text-purple-300 font-medium">{status}</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center text-center animate-fade-in p-8">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6">Paso 3: Procesamiento en Segundo Plano</h2>
            <i className="fas fa-cogs text-5xl text-purple-400 mb-6 animate-spin" style={{ animationDuration: '3s' }}></i>
            <p className="text-gray-300 mb-4 max-w-lg">
                El proceso de transcripción ha comenzado y se está ejecutando en segundo plano.
            </p>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-400">Número de Proceso en Cola: <span className="font-mono text-white font-bold">{processId}</span></p>
                <p className="text-sm text-gray-400">Tiempo estimado: <span className="font-mono text-white font-bold">~5 minutos</span></p>
            </div>
            <p className="text-gray-400 mb-6 max-w-lg">
                Puedes cerrar esta ventana y regresar más tarde. Tu borrador estará disponible en el repositorio para continuar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => setUserChoice('waiting')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                >
                    <i className="fas fa-clock"></i> Esperar aquí
                </button>
                <button
                    onClick={onSaveAndExit}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                >
                    <i className="fas fa-save"></i> Guardar y Salir
                </button>
            </div>
        </div>
    );
};

export default Step2Processing;