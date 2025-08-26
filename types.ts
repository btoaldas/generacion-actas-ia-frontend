export enum Step {
    Upload = 1,
    Configuration,
    Processing,
    Verification,
    Template,
    Generating,
    Editor,
}

// Representa un permiso granular dentro del sistema.
export type Permission = 
    | 'viewDashboard'
    | 'createActas'
    | 'editActas'

    | 'approveActas'
    | 'viewAllActas'
    | 'viewPublishedActas'
    | 'viewAdminDashboard'
    | 'manageUsersAndRoles'
    | 'manageTemplates'
    | 'manageSystemConfig'
    | 'viewMetrics'
    | 'viewAuditLog';

// Define un Rol que agrupa un conjunto de permisos.
export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

// FIX: Se añade el enum UserRole para corregir un error de exportación que faltaba en VersionHistoryModal.tsx.
export enum UserRole {
    Editor = 'Editor / Generador',
    Approver = 'Aprobador',
}


export type AdminView = 'main' | 'templates' | 'users' | 'metrics' | 'generalConfig' | 'aiConfig' | 'smtpConfig' | 'auditLog';

// --- Nuevas Interfaces para Configuración del Sistema ---

export interface AiModelConfig {
    id: string;
    name: string;
    provider: 'Gemini' | 'OpenAI' | 'DeepSeek' | 'Ollama' | 'Other';
    modelIdentifier: string; // ej. 'gemini-2.5-flash', 'gpt-4o'
    apiKey?: string;
    baseUrl?: string; // Para modelos locales/personalizados
}

export interface TranscriptionModelConfig {
    id: string;
    name: string;
    type: 'Whisper' | 'Other';
    details: string; // ej. 'large-v3', 'API de Google Speech-to-Text'
    diarization: 'Pyannote' | 'NeMo' | 'Other';
    apiKey?: string;
    baseUrl?: string;
}

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string; // Contraseña
    security: 'none' | 'ssl' | 'tls';
    fromName: string;
    fromEmail: string;
}


// Configuración global del sistema, gestionada por el administrador.
export interface SystemConfig {
    institutionName: string;
    institutionLogo: string | null; // string base64 o URL
    isMfaEnabled: boolean;
    sessionTimeout: number; // en minutos
    generationModels: AiModelConfig[];
    transcriptionModels: TranscriptionModelConfig[];
    smtp: SmtpConfig;
}

// Representa a un usuario del sistema.
export interface User {
    id: string;
    name: string;
    email: string;
    roleIds: string[];
    // NUEVOS ATRIBUTOS OPCIONALES PARA EL USUARIO, ALINEADOS CON PARTICIPANTE
    cedula?: string;
    cargo?: string;
    institucion?: string;
}

export enum ActaStatus {
    Draft = 'Borrador',
    PendingApproval = 'Pendiente de Aprobación',
    Approved = 'Aprobada',
    Published = 'Publicada',
    Rejected = 'Rechazada',
}

// Guarda el estado completo del proceso de generación de un acta para poder guardarlo o reanudarlo.
export interface ActaProcessState {
    currentStep: Step;
    audioFile: File | null;
    audioFileName: string;
    speakers: Speaker[];
    meetingData: { title: string; date: string; type: string; acta_type: string; observations: string; };
    processingConfig: ProcessingConfig;
    transcription: Transcription | null;
    selectedTemplate: Template | null;
    generatedActa: GeneratedActa | null;
    designatedApproverIds: string[]; // IDs of users selected to approve
}

// Define la estructura de una entrada en el registro de auditoría.
export interface AuditLogEntry {
    id: string;
    timestamp: string; // formato ISO
    userId: string;
    userName: string;
    action: string;
    details: string;
}

// Estructura para una notificación (toast)
export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

// Representa una aprobación individual de un acta.
export interface Approval {
    userId: string;
    userName: string;
    approvedAt: string; // ISO String
}


// Representa un resumen de un acta para ser mostrado en el dashboard.
export interface ActaSummary {
    id: string;
    title: string;
    date: string;
    status: ActaStatus;
    version: number;
    url: string; // enlace al PDF publicado o a la página de visualización
    rejectionReason?: string;
    fullActaData?: ActaProcessState | null; // Para guardar el estado completo de los borradores
    createdBy: string;
    tags?: string[];
    // Nuevos campos para el circuito de aprobación y publicación
    designatedApproverIds?: string[]; // IDs de los usuarios que deben aprobar
    approvals?: Approval[]; // Lista de aprobaciones recibidas
    visibility?: 'public' | 'private' | 'specific';
    allowedUserIds?: string[];
}

export enum ParticipationType {
    VozYVoto = 'Voz y Voto',
    SoloVoz = 'Solo Voz',
    Firma = 'Solo Firma',
    Asistente = 'Asistente',
}

// Representa a un participante (hablante) en una reunión.
export interface Speaker {
    id: number;
    name: string;
    cedula: string;
    role: string; // Cargo del participante
    participation: ParticipationType;
    institution: string;
    // NUEVOS ATRIBUTOS PARA VINCULAR CON USUARIOS DEL SISTEMA
    entryMethod?: 'manual' | 'system'; // Método de ingreso del participante
    linkedUserId?: string; // ID del usuario del sistema si fue seleccionado
}

export interface DialogueEntry {
    speaker_id: number;
    start_time: string; // "HH:MM:SS"
    end_time: string;
    text: string;
}

export interface TranscriptionStats {
    total_words: number;
    total_duration_seconds: number;
    speaking_time_per_speaker: Record<number, number>; // speaker_id -> segundos
    transcription_model: string;
    diarization_model: string;
}

export interface ProcessingConfig {
    transcriptionModelId: string;
    generationModelId: string;
    audioEnhancement: boolean;
}

// Estructura del JSON que resulta del procesamiento del audio.
export interface Transcription {
    // Contexto
    meeting_title: string;
    meeting_date: string; // "YYYY-MM-DD"
    acta_type: string; // Ej: Ordinaria, Extraordinaria
    session_type: string; // Ej: Sesión de Concejo, Comisión
    municipality: string;
    observations: string;
    
    // Datos principales
    speakers: Speaker[];
    dialogue: DialogueEntry[];
    statistics: TranscriptionStats;
}

// Define un segmento dentro de una plantilla de acta.
export interface Segment {
    id: string;
    title: string;
    type: 'ai' | 'static';
    prompt: string; // Usado si el tipo es 'ai'
    staticContent?: string; // Usado si el tipo es 'static'
}

// Define la estructura de una plantilla de acta.
export interface Template {
    id:string;
    name: string;
    description: string;
    segments: Segment[];
}

// Representa un segmento ya procesado y generado.
export interface GeneratedSegment {
    id: string;
    title: string;
    type: 'ai' | 'static';
    content: string; // Para tipo 'ai', es el texto generado. Para 'static', es el contenido estático.
}

// Representa el acta final generada lista para el editor.
export interface GeneratedActa {
    templateName: string;
    title: string;
    date: string;
    speakers: string[];
    segments: GeneratedSegment[];
}
