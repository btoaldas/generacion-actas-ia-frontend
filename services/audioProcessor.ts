import { Transcription, Speaker, ProcessingConfig } from '../types';

// This is a MOCK function to simulate a complex backend process.
// In a real application, this would involve API calls to services like Whisper for transcription
// and Pyannote for speaker diarization.

export const processAudio = (
    audioFile: File, 
    speakers: Speaker[], 
    meetingData: { title: string; date: string; type: string; acta_type: string; observations: string; },
    // FIX: The config object passed to this mock function contains more properties than the base ProcessingConfig.
    // The type has been adjusted to reflect the actual shape of the object being passed.
    config: ProcessingConfig & { transcriptionModel: string; diarizationModel: string; },
): Promise<Transcription> => {
    return new Promise((resolve, reject) => {
        if (!audioFile) {
            return reject('No audio file provided.');
        }

        console.log(`Simulating processing for: ${audioFile.name}`);
        console.log(`With speakers: ${speakers.map(s => s.name).join(', ')}`);
        console.log(`Meeting Data:`, meetingData);
        console.log(`Processing Config:`, config);
        
        const baseProcessingTime = 4000; // 4 seconds
        const enhancementTime = config.audioEnhancement ? 1500 : 0; // add 1.5s if enhancement is on


        // Simulate a delay for processing
        setTimeout(() => {
            const speakerObjects = speakers.map((s, index) => ({ ...s, id: index + 1 }));

            const mockTranscription: Transcription = {
                meeting_title: meetingData.title || "Revisión Trimestral de Proyecto 'Phoenix'",
                meeting_date: meetingData.date || new Date().toISOString().split('T')[0],
                acta_type: meetingData.acta_type || "Ordinaria",
                session_type: meetingData.type || "Comité de Proyectos",
                municipality: "GAD Municipal del Cantón Pastaza",
                observations: meetingData.observations || "Sin observaciones.",
                speakers: speakerObjects,
                dialogue: [
                    { speaker_id: 1, start_time: "00:00:15", end_time: "00:00:28", text: "Buenos días a todos. Empecemos con la revisión del proyecto Phoenix. ¿Cuál es el estado actual del módulo de autenticación?" },
                    { speaker_id: 2, start_time: "00:00:29", end_time: "00:00:45", text: "Hola, buenos días. El módulo de autenticación está completo en un 90%. Hemos encontrado un pequeño problema con la integración de OAuth2, pero esperamos resolverlo para el final de la semana." },
                    { speaker_id: 1, start_time: "00:00:46", end_time: "00:00:55", text: "Entendido. Asegúrate de documentar la solución. ¿Qué hay del frontend? ¿Cómo vamos con la nueva interfaz de usuario?" },
                    { speaker_id: 3, start_time: "00:00:56", end_time: "00:01:18", text: "El equipo de frontend ha finalizado los componentes principales. Estamos ahora en la fase de pruebas de usabilidad. El feedback inicial es muy positivo, aunque algunos usuarios mencionaron que el contraste de colores podría mejorar para la accesibilidad. Lo estamos revisando." },
                    { speaker_id: 1, start_time: "00:01:19", end_time: "00:01:25", text: "Excelente. La accesibilidad es una prioridad. Por favor, asigna a alguien para que se encargue de eso." },
                    { speaker_id: 2, start_time: "00:01:26", end_time: "00:01:40", text: "Volviendo al backend, una vez solucionado lo de OAuth2, procederemos al despliegue en el entorno de staging. Necesitaré apoyo del equipo de DevOps para el viernes." },
                    { speaker_id: 1, start_time: "00:01:41", end_time: "00:01:50", text: "De acuerdo. Coordinaré con DevOps. El objetivo es tener todo en staging para el lunes. ¿Algún otro punto o bloqueo?" },
                    { speaker_id: 3, start_time: "00:01:51", end_time: "00:02:05", text: "Por nuestra parte no, estamos en camino. Solo pendientes de ese ajuste de accesibilidad. Para el próximo sprint, empezaremos a integrar los datos reales en la interfaz." }
                ],
                statistics: {
                    total_words: 258,
                    total_duration_seconds: 125,
                    speaking_time_per_speaker: {
                        1: 37,
                        2: 30,
                        3: 38,
                    },
                    // FIX: Accessing properties that exist on the legacy config object.
                    transcription_model: config.transcriptionModel,
                    // FIX: Accessing properties that exist on the legacy config object.
                    diarization_model: config.diarizationModel,
                },
            };
            
            // Adjust speaker names and count in the mock data
            const dialogueSpeakers = new Set(mockTranscription.dialogue.map(d => d.speaker_id));
            if (speakerObjects.length > 0 && speakerObjects.length !== dialogueSpeakers.size) {
                 mockTranscription.dialogue = mockTranscription.dialogue.map(d => ({
                     ...d,
                     speaker_id: (d.speaker_id - 1) % speakerObjects.length + 1
                 }));
            }
             mockTranscription.speakers = speakerObjects;


            console.log('Simulated processing complete.');
            resolve(mockTranscription);
        }, baseProcessingTime + enhancementTime); 
    });
};