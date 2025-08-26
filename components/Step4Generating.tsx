import React, { useState, useEffect, useMemo } from 'react';
import { Transcription, Template, GeneratedActa, GeneratedSegment } from '../types';
import { generateSegmentContent } from '../services/geminiService';
import Spinner from './Spinner';

interface Step4GeneratingProps {
    transcription: Transcription;
    template: Template;
    aiEngine: string;
    onComplete: (acta: GeneratedActa) => void;
    onError: (error: string) => void;
    onSaveAndExit: () => void;
}

type SegmentStatus = 'pending' | 'generating' | 'completed' | 'error';

const Step4Generating: React.FC<Step4GeneratingProps> = ({ transcription, template, aiEngine, onComplete, onError, onSaveAndExit }) => {
    const [segmentStatuses, setSegmentStatuses] = useState<Record<string, SegmentStatus>>({});
    const [generatedSegments, setGeneratedSegments] = useState<GeneratedSegment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userChoice, setUserChoice] = useState<'pending' | 'waiting'>('pending');
    const processId = useMemo(() => Math.floor(20000 + Math.random() * 90000), []);

    useEffect(() => {
        const initialStatuses = template.segments.reduce((acc, segment) => {
            acc[segment.id] = 'pending';
            return acc;
        }, {} as Record<string, SegmentStatus>);
        setSegmentStatuses(initialStatuses);
        
        generateAllSegments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template, transcription]);

    const generateAllSegments = async () => {
        const results: GeneratedSegment[] = [];
        
        for (const segment of template.segments) {
            setSegmentStatuses(prev => ({ ...prev, [segment.id]: 'generating' }));
            try {
                let newSegment: GeneratedSegment;
                if (segment.type === 'static') {
                    newSegment = { 
                        id: segment.id, 
                        title: segment.title, 
                        type: 'static', 
                        content: segment.staticContent || '' 
                    };
                } else { // type is 'ai'
                    const content = await generateSegmentContent(transcription, segment.prompt);
                    newSegment = { id: segment.id, title: segment.title, type: 'ai', content };
                }
                
                results.push(newSegment);
                setGeneratedSegments(prev => [...prev, newSegment]);
                setSegmentStatuses(prev => ({ ...prev, [segment.id]: 'completed' }));

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Error al generar "${segment.title}": ${errorMessage}`);
                setSegmentStatuses(prev => ({ ...prev, [segment.id]: 'error' }));
                onError(`No se pudo generar el acta completa. Falló en el segmento "${segment.title}".`);
                return; // Stop processing on first error
            }
        }

        const finalActa: GeneratedActa = {
            templateName: template.name,
            title: transcription.meeting_title,
            date: transcription.meeting_date,
            speakers: transcription.speakers.map(s => `${s.name} (${s.role})`),
            segments: results,
        };

        onComplete(finalActa);
    };

    const getStatusIcon = (status: SegmentStatus) => {
        switch (status) {
            case 'pending':
                return <i className="fa-regular fa-clock text-gray-500"></i>;
            case 'generating':
                return <Spinner size="sm" />;
            case 'completed':
                return <i className="fa-solid fa-check-circle text-green-400"></i>;
            case 'error':
                return <i className="fa-solid fa-times-circle text-red-400"></i>;
        }
    };

    if (userChoice === 'waiting') {
        return (
            <div className="flex flex-col items-center animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Paso 6: Generando Acta con IA</h2>
                <p className="text-gray-400 mb-8 text-center max-w-2xl">
                    La inteligencia artificial (usando <span className="font-semibold text-purple-300">{aiEngine}</span>) está analizando la transcripción para crear cada sección.
                </p>

                <div className="w-full max-w-md bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <ul className="space-y-4">
                        {template.segments.map(segment => (
                            <li key={segment.id} className="flex items-center justify-between">
                                <span className="text-gray-300">{segment.title}</span>
                                <div className="w-6 h-6 flex items-center justify-center">
                                    {getStatusIcon(segmentStatuses[segment.id])}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center text-center animate-fade-in p-8">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6">Paso 6: Generación en Segundo Plano</h2>
            <i className="fas fa-robot text-5xl text-purple-400 mb-6 animate-pulse"></i>
            <p className="text-gray-300 mb-4 max-w-lg">
                La generación del acta ha comenzado y se está ejecutando en segundo plano.
            </p>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-400">Número de Ticket: <span className="font-mono text-white font-bold">{processId}</span></p>
                <p className="text-sm text-gray-400">Tiempo estimado: <span className="font-mono text-white font-bold">~2 minutos</span></p>
            </div>
             <p className="text-gray-400 mb-6 max-w-lg">
                Puedes guardar tu progreso y salir. Cuando vuelvas a este borrador, el acta estará lista para editar.
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

export default Step4Generating;