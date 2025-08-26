import React, { useState, useRef, useEffect } from 'react';
import { Speaker, ParticipationType, User } from '../types';

interface Step1UploadProps {
    setAudioFile: (file: File) => void;
    speakers: Speaker[];
    setSpeakers: (speakers: Speaker[]) => void;
    meetingData: { title: string; date: string; type: string; acta_type: string; observations: string };
    setMeetingData: (data: { title: string; date: string; type: string; acta_type: string; observations: string }) => void;
    onNext: () => void;
    users: User[]; // Lista de usuarios del sistema para la selección
}

const ROLES = ["Alcalde", "Vicealcalde", "Concejal", "Secretario/a", "Director/a Departamental", "Presidente", "Vocal", "Técnico", "Invitado", "Otro"];

const Step1Upload: React.FC<Step1UploadProps> = ({ setAudioFile, speakers, setSpeakers, meetingData, setMeetingData, onNext, users }) => {
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado para la grabación
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    // FIX: Changed NodeJS.Timeout to ReturnType<typeof setInterval> for browser compatibility.
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => { // Limpieza al desmontar el componente
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const recordedFile = new File([audioBlob], `grabacion-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
                setLocalFile(recordedFile);
                setAudioFile(recordedFile);
                stream.getTracks().forEach(track => track.stop()); // Libera el micrófono
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error al iniciar la grabación:", err);
            setError("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLocalFile(file);
            setAudioFile(file);
            setError('');
        }
    };

    const handleMeetingDataChange = (field: keyof typeof meetingData, value: string) => {
        setMeetingData({ ...meetingData, [field]: value });
    };

    const handleSpeakerChange = (index: number, field: keyof Omit<Speaker, 'id'>, value: string | ParticipationType) => {
        const newSpeakers = [...speakers];
        const currentSpeaker = newSpeakers[index];

        if (field === 'entryMethod') {
            const newMethod = value as 'manual' | 'system';
            if (newMethod === 'system') {
                // Al cambiar a "Usuario del Sistema", limpiar los campos hasta que se seleccione uno.
                newSpeakers[index] = { ...currentSpeaker, entryMethod: 'system', name: '', cedula: '', role: '', linkedUserId: undefined };
            } else {
                // Al volver a "Entrada Manual", limpiar el usuario vinculado.
                newSpeakers[index] = { ...currentSpeaker, entryMethod: 'manual', linkedUserId: undefined };
            }
        } else {
            newSpeakers[index] = { ...currentSpeaker, [field]: value };
        }
        
        setSpeakers(newSpeakers);
    };

    // Nueva función para manejar la selección de un usuario del sistema
    const handleSelectSystemUser = (speakerIndex: number, userId: string) => {
        const selectedUser = users.find(u => u.id === userId);
        if (!selectedUser) return;

        const newSpeakers = [...speakers];
        newSpeakers[speakerIndex] = {
            ...newSpeakers[speakerIndex],
            linkedUserId: selectedUser.id,
            name: selectedUser.name,
            cedula: selectedUser.cedula || '',
            role: selectedUser.cargo || '',
            institution: selectedUser.institucion || 'GAD Municipal del Cantón Pastaza',
        };
        setSpeakers(newSpeakers);
    };

    const addSpeaker = () => {
        setSpeakers([...speakers, { id: speakers.length + 1, name: '', cedula: '', role: '', participation: ParticipationType.VozYVoto, institution: 'GAD Municipal del Cantón Pastaza', entryMethod: 'manual' }]);
    };

    const removeSpeaker = (index: number) => {
        if (speakers.length > 1) {
            const newSpeakers = speakers.filter((_, i) => i !== index);
            setSpeakers(newSpeakers);
        }
    };

    const handleNext = () => {
        if (!localFile) {
            setError('Por favor, sube o graba un archivo de audio.');
            return;
        }
        // ... (añadir otras validaciones si es necesario)
        setError('');
        onNext();
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6">Paso 1: Carga de Audio y Contexto de la Sesión</h2>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Carga/Grabación de Audio */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">Audio de la Sesión</label>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div
                            className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition-colors"
                            onClick={() => !isRecording && fileInputRef.current?.click()}
                        >
                            <div className="space-y-1 text-center">
                                <i className="fas fa-file-audio text-4xl text-gray-500"></i>
                                <p className="text-sm text-gray-400">{localFile ? localFile.name : 'Sube un archivo o arrástralo'}</p>
                                <p className="text-xs text-gray-500">MP3, WAV, M4A, WEBM</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} disabled={isRecording}/>
                        <div className="text-center my-2 text-gray-500">O</div>
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-bold transition-colors ${
                                isRecording 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {isRecording ? (
                                <>
                                <i className="fas fa-stop-circle animate-pulse"></i>
                                <span>Detener Grabación ({formatTime(recordingTime)})</span>
                                </>
                            ) : (
                                <><i className="fas fa-microphone"></i><span>Grabar Audio</span></>
                            )}
                        </button>
                    </div>
                </div>
                {/* Datos de la Reunión */}
                <div className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">Título/Identificador</label>
                        <input type="text" id="title" value={meetingData.title} onChange={e => handleMeetingDataChange('title', e.target.value)} placeholder="Ej: Sesión Ordinaria 01-08-2024" className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Fecha</label>
                            <input type="date" id="date" value={meetingData.date} onChange={e => handleMeetingDataChange('date', e.target.value)} className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="acta_type" className="block text-sm font-medium text-gray-300">Tipo de Acta</label>
                             <input type="text" id="acta_type" value={meetingData.acta_type} onChange={e => handleMeetingDataChange('acta_type', e.target.value)} placeholder="Ej: Ordinaria, Extraordinaria" className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Tipo de Sesión</label>
                        <input type="text" id="type" value={meetingData.type} onChange={e => handleMeetingDataChange('type', e.target.value)} placeholder="Ej: Sesión de Concejo, Comisión" className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                    </div>
                    <div>
                        <label htmlFor="observations" className="block text-sm font-medium text-gray-300">Observaciones</label>
                         <textarea id="observations" value={meetingData.observations} onChange={e => handleMeetingDataChange('observations', e.target.value)} rows={2} placeholder="Añadir observaciones relevantes..." className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                    </div>
                </div>
            </div>

            {/* Entradas de Participantes */}
            <div className="w-full max-w-5xl mb-8">
                <h3 className="text-lg font-medium text-gray-300 mb-3">Participantes de la Sesión</h3>
                <div className="space-y-4">
                {speakers.map((speaker, index) => (
                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex gap-4 items-center">
                            <select 
                                value={speaker.entryMethod || 'manual'} 
                                onChange={(e) => handleSpeakerChange(index, 'entryMethod', e.target.value)} 
                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500 text-sm"
                            >
                                <option value="manual">Entrada Manual</option>
                                <option value="system">Usuario del Sistema</option>
                            </select>

                            {speaker.entryMethod === 'system' && (
                                <select 
                                    value={speaker.linkedUserId || ''} 
                                    onChange={(e) => handleSelectSystemUser(index, e.target.value)}
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500"
                                >
                                    <option value="" disabled>-- Seleccione un usuario --</option>
                                    {users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                                </select>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <input type="text" placeholder="Nombre Completo" value={speaker.name} onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)} disabled={speaker.entryMethod === 'system'} className="md:col-span-3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500 disabled:bg-gray-600 disabled:opacity-70"/>
                            <input type="text" placeholder="Cédula" value={speaker.cedula} onChange={(e) => handleSpeakerChange(index, 'cedula', e.target.value)} disabled={speaker.entryMethod === 'system'} className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500 disabled:bg-gray-600 disabled:opacity-70"/>
                            <select value={speaker.role} onChange={(e) => handleSpeakerChange(index, 'role', e.target.value)} disabled={speaker.entryMethod === 'system'} className="md:col-span-3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500 disabled:bg-gray-600 disabled:opacity-70">
                                 <option value="" disabled>Seleccione un Cargo...</option>
                                 {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <select value={speaker.participation} onChange={(e) => handleSpeakerChange(index, 'participation', e.target.value as ParticipationType)} className="md:col-span-3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-purple-500">
                                 {Object.values(ParticipationType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                            </select>
                            <div className="md:col-span-1 flex justify-end">
                                {speakers.length > 1 && (
                                    <button onClick={() => removeSpeaker(index)} className="p-2 text-gray-400 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                <button onClick={addSpeaker} className="mt-3 text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                    <i className="fas fa-plus-circle"></i> Añadir participante
                </button>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            <button onClick={handleNext} className="w-full max-w-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                Guardar y Continuar
            </button>
        </div>
    );
};

export default Step1Upload;