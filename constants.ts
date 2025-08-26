import { Template, Permission, Role } from './types';

export const ALL_PERMISSIONS: { id: Permission; description: string }[] = [
    { id: 'viewDashboard', description: 'Ver el repositorio de actas' },
    { id: 'viewAllActas', description: 'Ver todas las actas (incluyendo borradores)' },
    { id: 'viewPublishedActas', description: 'Ver solo actas publicadas' },
    { id: 'createActas', description: 'Crear nuevas actas' },
    { id: 'editActas', description: 'Editar borradores de actas' },
    { id: 'approveActas', description: 'Aprobar o rechazar actas' },
    { id: 'viewAdminDashboard', description: 'Acceder al panel de administración' },
    { id: 'manageUsersAndRoles', description: 'Gestionar usuarios y roles' },
    { id: 'manageTemplates', description: 'Gestionar plantillas de actas' },
    { id: 'manageSystemConfig', description: 'Gestionar configuración del sistema' },
    { id: 'viewMetrics', description: 'Ver dashboard de métricas' },
    { id: 'viewAuditLog', description: 'Ver registro de auditoría' },
];

export const ROLES: Role[] = [
    {
        id: 'admin',
        name: 'Administrador',
        permissions: ALL_PERMISSIONS.map(p => p.id),
    },
    {
        id: 'editor',
        name: 'Editor / Generador',
        permissions: ['viewDashboard', 'createActas', 'editActas', 'viewAllActas'],
    },
    {
        id: 'viewer',
        name: 'Visor / Público',
        permissions: ['viewDashboard', 'viewPublishedActas'],
    },
];


export const TEMPLATES: Template[] = [
    {
        id: 'formal_meeting',
        name: 'Acta de Reunión Formal',
        description: 'Una plantilla completa para reuniones de directorio, comités o sesiones formales.',
        segments: [
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'summary', title: 'Resumen Ejecutivo', type: 'ai', prompt: 'Basado en la transcripción, escribe un resumen ejecutivo conciso de la reunión, destacando los temas principales y las conclusiones clave.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'decisions', title: 'Decisiones Tomadas', type: 'ai', prompt: 'Enumera todas las decisiones explícitas que se tomaron durante la reunión, indicando quién las propuso y el resultado de la votación si lo hubo.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'action_items', title: 'Puntos de Acción', type: 'ai', prompt: 'Extrae una lista de todos los puntos de acción o tareas asignadas. Para cada tarea, especifica claramente a quién se le asignó y cualquier fecha de vencimiento mencionada.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'key_topics', title: 'Temas Clave Discutidos', type: 'ai', prompt: 'Detalla los temas más importantes que se discutieron, resumiendo los diferentes puntos de vista expresados por los participantes.' },
        ],
    },
    {
        id: 'project_standup',
        name: 'Minuta de Stand-up de Proyecto',
        description: 'Plantilla ágil para reuniones diarias o semanales de seguimiento de proyectos.',
        segments: [
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'progress', title: 'Progreso Desde la Última Reunión', type: 'ai', prompt: 'Resume el progreso reportado por cada participante sobre sus tareas desde la última reunión.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'blockers', title: 'Bloqueos y Obstáculos', type: 'ai', prompt: 'Identifica y lista todos los bloqueos, impedimentos o problemas mencionados por los participantes que están afectando su progreso.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'next_steps', title: 'Próximos Pasos', type: 'ai', prompt: 'Resume los planes y las tareas que cada participante se comprometió a realizar antes de la próxima reunión.' },
        ],
    },
    {
        id: 'client_call',
        name: 'Resumen de Llamada con Cliente',
        description: 'Ideal para documentar interacciones con clientes, enfocada en requerimientos y feedback.',
        segments: [
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'client_needs', title: 'Necesidades y Requerimientos del Cliente', type: 'ai', prompt: 'Extrae y resume todas las necesidades, deseos y requerimientos específicos mencionados por el cliente durante la llamada.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'feedback', title: 'Feedback del Cliente', type: 'ai', prompt: 'Documenta cualquier feedback, positivo o negativo, que el cliente haya proporcionado sobre el producto, servicio o proyecto.' },
            // FIX: Property 'type' was missing in type 'Segment'.
            { id: 'commitments', title: 'Compromisos Acordados', type: 'ai', prompt: 'Lista los compromisos y próximos pasos acordados tanto por parte del equipo como por parte del cliente.' },
        ],
    },
];