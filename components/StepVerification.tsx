import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Transcription, Speaker, DialogueEntry, ParticipationType } from '../types';
// @ts-ignore - wavesurfer.js is loaded from a script tag in index.html
const WaveSurfer = window.WaveSurfer;

const PALETTE = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#EC4899', '#22D3EE', '#F87171'];


const AddSpeakerModal: React.FC<{onClose: () => void; onAdd: (speaker: Omit<Speaker, 'id'>) => void}> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    
    const handleAdd = () => {
        if (name.trim() && role.trim()) {
            onAdd({ name, role, cedula: '', participation: ParticipationType.VozYVoto, institution: 'GAD Municipal del Cantón Pastaza' });
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Añadir Nuevo Hablante</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" className="w-full bg-gray-700 rounded-md p-2"/>
                    <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Cargo" className="w-full bg-gray-700 rounded-md p-2"/>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">Cancelar</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 rounded-md">Añadir</button>
                </div>
            </div>
        </div>
    );
};

interface StepVerificationProps {
    transcription: Transcription;
    setTranscription: (transcription: Transcription) => void;
    audioFile: File | null;
    onNext: () => void;
}


const StepVerification: React.FC<StepVerificationProps> = ({ transcription, setTranscription, audioFile, onNext }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null); // Use 'any' for WaveSurfer instance
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);

    // Speaker color coding
    const speakerColorMap = useMemo(() => {
        const map = new Map<number, string>();
        transcription.speakers.forEach((speaker, index) => {
            map.set(speaker.id, PALETTE[index % PALETTE.length]);
        });
        return map;
    }, [transcription.speakers]);

    useEffect(() => {
        if (waveformRef.current && audioFile) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4A5568',
                progressColor: '#8B5CF6',
                cursorColor: '#A78BFA',
                barWidth: 3,
                barRadius: 3,
                cursorWidth: 1,
                height: 100,
                barGap: 3,
            });

            wavesurferRef.current.load(URL.createObjectURL(audioFile));

            wavesurferRef.current.on('ready', () => {
                setAudioDuration(wavesurferRef.current.getDuration());
            });

            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));

            return () => {
                wavesurferRef.current.destroy();
            };
        }
    }, [audioFile]);

    const timeToSeconds = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number);
        return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
    };
    
    const handlePlayPause = () => {
        wavesurferRef.current.playPause();
    };

    const handlePlaySegment = (startTimeStr: string) => {
        const startTime = timeToSeconds(startTimeStr);
        if (audioDuration > 0) {
            const progress = startTime / audioDuration;
            wavesurferRef.current.seekTo(progress);
        }
        wavesurferRef.current.play();
    };
    
    // Handlers for editing, adding, deleting transcription lines
    const handleDialogueChange = (index: number, field: keyof DialogueEntry, value: string | number) => {
        const newDialogue = transcription.dialogue.map((entry, i) => i === index ? { ...entry, [field]: value } : entry);
        setTranscription({ ...transcription, dialogue: newDialogue });
    };
    
    const handleDeleteEntry = (index: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta intervención?")) {
            const newDialogue = transcription.dialogue.filter((_, i) => i !== index);
            setTranscription({ ...transcription, dialogue: newDialogue });
        }
    };
    
    const handleAddEntry = () => {
        const lastEntry = transcription.dialogue[transcription.dialogue.length - 1];
        const newEntry: DialogueEntry = {
            speaker_id: transcription.speakers.length > 0 ? transcription.speakers[0].id : 1,
            start_time: lastEntry?.end_time || '00:00:00',
            end_time: lastEntry?.end_time || '00:00:00',
            text: ''
        };
        const newDialogue = [...transcription.dialogue, newEntry];
        setTranscription({ ...transcription, dialogue: newDialogue });
    };

    const handleAddNewSpeaker = (newSpeakerData: Omit<Speaker, 'id'>) => {
        const newId = Math.max(...transcription.speakers.map(s => s.id), 0) + 1;
        const newSpeaker = { ...newSpeakerData, id: newId };
        setTranscription({ ...transcription, speakers: [...transcription.speakers, newSpeaker] });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, startTime: string) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handlePlaySegment(startTime);
        }
    }
    
    const filteredDialogue = useMemo(() => {
        if (!searchTerm) return transcription.dialogue.map((entry, index) => ({ ...entry, originalIndex: index }));

        const searchTermLower = searchTerm.toLowerCase();
        return transcription.dialogue
            .map((entry, index) => ({ ...entry, originalIndex: index }))
            .filter(entry => 
                entry.text.toLowerCase().includes(searchTermLower) || 
                entry.start_time.includes(searchTermLower) ||
                entry.end_time.includes(searchTermLower)
            );
    }, [searchTerm, transcription.dialogue]);


    return (
        <div className="flex flex-col items-center animate-fade-in w-full">
            {isModalOpen && <AddSpeakerModal onClose={() => setIsModalOpen(false)} onAdd={handleAddNewSpeaker} />}

            <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center">Paso 4: Verifica y Corrige la Transcripción</h2>
            <p className="text-gray-400 mb-6 text-center max-w-3xl">
                Usa el reproductor y los botones <i className="fas fa-play text-purple-400"></i> para escuchar. Edita el texto, reasigna hablantes o usa <kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Ctrl+Enter</kbd> para reproducir. Los cambios se guardan automáticamente.
            </p>

            <div className="w-full max-w-5xl mb-4 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm p-2 rounded-b-lg flex items-center gap-4">
                <button onClick={handlePlayPause} className="text-2xl text-purple-400 hover:text-purple-300 w-10 h-10 flex-shrink-0">
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </button>
                <div ref={waveformRef} className="w-full cursor-pointer h-[50px] flex-grow"></div>
                 <div className="relative flex-shrink-0 w-1/3">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por texto o tiempo..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-purple-500"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-gray-900 rounded-lg p-4 border border-gray-700 h-[55vh] overflow-y-auto">
                {filteredDialogue.map((entry) => {
                    const speakerColor = speakerColorMap.get(entry.speaker_id) || '#718096';
                    return (
                        <div 
                            key={entry.originalIndex} 
                            className="mb-4 p-3 rounded-lg bg-gray-800 border-l-4"
                            style={{ borderColor: speakerColor }}
                        >
                            <div className="flex justify-between items-start mb-2 gap-4">
                                 <div className="flex items-center gap-3 flex-wrap">
                                    <button onClick={() => handlePlaySegment(entry.start_time)} className="text-lg text-purple-400 hover:text-purple-300" title="Reproducir desde aquí">
                                        <i className="fas fa-play"></i>
                                    </button>
                                    <select 
                                        value={entry.speaker_id} 
                                        onChange={(e) => handleDialogueChange(entry.originalIndex, 'speaker_id', parseInt(e.target.value))} 
                                        className="bg-gray-700 text-white text-sm font-bold rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500 py-1"
                                    >
                                        {transcription.speakers.map(speaker => (
                                            <option key={speaker.id} value={speaker.id}>
                                                {speaker.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                                        <input
                                            type="text"
                                            value={entry.start_time}
                                            onChange={e => handleDialogueChange(entry.originalIndex, 'start_time', e.target.value)}
                                            className="bg-gray-700/50 p-1 w-20 rounded-md text-center focus:bg-gray-700"
                                            placeholder="HH:MM:SS"
                                        />
                                        <span>-</span>
                                         <input
                                            type="text"
                                            value={entry.end_time}
                                            onChange={e => handleDialogueChange(entry.originalIndex, 'end_time', e.target.value)}
                                            className="bg-gray-700/50 p-1 w-20 rounded-md text-center focus:bg-gray-700"
                                            placeholder="HH:MM:SS"
                                        />
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteEntry(entry.originalIndex)} className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0" title="Eliminar intervención">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <textarea 
                                value={entry.text} 
                                onChange={(e) => handleDialogueChange(entry.originalIndex, 'text', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, entry.start_time)}
                                className="w-full bg-gray-700/50 text-gray-300 p-2 rounded-md resize-y focus:bg-gray-700 focus:ring-1 focus:ring-purple-500"
                                rows={3}
                            />
                        </div>
                    );
                })}
                 {filteredDialogue.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron intervenciones que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 w-full max-w-5xl flex justify-between items-center">
                 <div>
                    <button onClick={() => setIsModalOpen(true)} className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                        <i className="fas fa-user-plus"></i> Añadir Hablante Omitido
                    </button>
                    <button onClick={handleAddEntry} className="ml-4 text-sm text-green-400 hover:text-green-300 font-medium flex items-center gap-2">
                        <i className="fas fa-plus-circle"></i> Añadir Intervención Manual
                    </button>
                </div>
                 <button onClick={onNext} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg">
                    Confirmar Transcripción y Continuar
                </button>
            </div>
        </div>
    );
};

export default StepVerification;