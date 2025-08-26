
import React, { useState } from 'react';

const KNOWLEDGE_BASE_CONTENT = {
  articles: [
    {
      id: 'mision-vision',
      title: 'Misión, Visión y Objetivos del Proyecto SAAP',
      content: `**Misión:**\nOptimizar y transparentar la gestión documental del GAD Municipal del Cantón Pastaza mediante la automatización del proceso de creación de actas de sesión, asegurando la precisión, accesibilidad y preservación de las deliberaciones y decisiones institucionales.\n\n**Visión:**\nSer la herramienta de referencia a nivel nacional para la generación de actas en el sector público, impulsando la modernización, la eficiencia y la gobernanza digital en todas las instituciones gubernamentales.\n\n**Objetivos:**\n- Reducir en un 80% el tiempo dedicado a la transcripción y redacción manual de actas.\n- Asegurar una fidelidad del 95% en las transcripciones automáticas mediante el uso de tecnologías de IA de vanguardia.\n- Proporcionar una plataforma segura, auditable y centralizada para todo el ciclo de vida de las actas, desde su creación hasta su publicación y archivo.\n- Facilitar el acceso público a la información de manera estructurada y eficiente, promoviendo la transparencia.`
    },
    {
        id: 'flujo-trabajo',
        title: 'Guía de Usabilidad y Flujo de Trabajo',
        content: `El Sistema de Actas Automatizadas (SAAP) sigue un flujo lógico e intuitivo de 7 pasos:\n\n1. **Carga y Contexto:** Sube el archivo de audio de la sesión y proporciona los datos básicos como el título, la fecha y los participantes. Puedes añadir participantes manualmente o seleccionarlos desde la lista de usuarios del sistema.\n\n2. **Configuración:** Elige los modelos de IA que se utilizarán para la transcripción y la generación del acta. Además, designa a los usuarios que deberán aprobar el documento final.\n\n3. **Procesando:** La IA procesa el audio para generar una transcripción detallada, identificando quién habló y cuándo.\n\n4. **Verificación:** Revisa y corrige la transcripción generada. Puedes editar el texto, ajustar los tiempos y reasignar hablantes para asegurar la máxima precisión.\n\n5. **Plantilla:** Selecciona una de las plantillas predefinidas que determinará la estructura y las secciones de tu acta final.\n\n6. **Generando Acta:** La IA utiliza la transcripción verificada y la plantilla seleccionada para redactar cada sección del acta.\n\n7. **Editor:** Realiza los ajustes finales en el editor de texto enriquecido. Desde aquí, puedes guardar el borrador, enviarlo para aprobación o exportarlo a PDF.`
    },
    {
      id: 'arquitectura',
      title: 'Arquitectura del Sistema y Tecnologías Clave',
      content: `El SAAP está construido sobre un stack tecnológico moderno y robusto para garantizar rendimiento, escalabilidad y seguridad.\n\n**Frontend:**\n- **React & TypeScript:** Para una interfaz de usuario interactiva, robusta y mantenible.\n- **TailwindCSS:** Para un diseño rápido, moderno y adaptable a cualquier dispositivo.\n\n**Backend (Simulado):**\n- **FastAPI (Python):** Proporciona una API de alto rendimiento para gestionar la lógica de negocio.\n- **Celery & Redis:** Gestionan tareas asíncronas y pesadas en segundo plano, como la transcripción y la generación de contenido, sin bloquear la interfaz de usuario.\n- **PostgreSQL:** Como base de datos relacional para almacenar de forma persistente toda la información sobre actas, usuarios, roles y configuraciones.\n\n**Tecnologías de IA:**\n- **Transcripción:** Integración con modelos de la familia **Whisper** de OpenAI para una transcripción de alta precisión.\n- **Diarización (Reconocimiento de Hablantes):** Uso de librerías como **Pyannote** para identificar y separar las intervenciones de cada participante.\n- **Generación de Contenido:** Conexión con LLMs (Modelos de Lenguaje Grandes) de vanguardia como **Gemini 2.5 Flash** de Google y **GPT-4o** de OpenAI para la redacción inteligente de los segmentos del acta.`
    },
     {
      id: 'administracion',
      title: 'Procedimientos de Administración',
      content: `El panel de Administración centraliza el control total sobre la plataforma.\n\n- **Gestión de Usuarios y Roles:** Permite crear roles con permisos granulares (ej: ver, crear, editar, aprobar) y asignar múltiples roles a un mismo usuario para una gestión de acceso flexible.\n\n- **Configuración de Modelos de IA:** Puedes añadir, editar y eliminar los modelos de IA disponibles en el sistema. Para cada modelo, puedes configurar su nombre, proveedor, identificador específico, clave de API y URL base (ideal para modelos autoalojados como Ollama).\n\n- **Configuración SMTP:** Parametriza el servidor de correo saliente para el envío de notificaciones del sistema (ej: actas listas para revisión). Se pueden configurar todos los detalles: host, puerto, seguridad y credenciales.`
    },
    {
      id: 'db-schema',
      title: 'Esquema de la Base de Datos (PostgreSQL)',
      content: `Este artículo contiene el script SQL completo para crear la estructura de la base de datos del sistema SAAP en PostgreSQL. Ejecutar este script creará todas las tablas, relaciones, tipos y índices necesarios.\n\n<pre class="bg-gray-900 text-sm text-cyan-300 p-4 rounded-md overflow-x-auto"><code>-- PostgreSQL Schema for SAAP (Sistema de Actas Automatizadas del Pastaza)

-- Drop existing tables in reverse order of dependency to avoid foreign key conflicts
DROP TABLE IF EXISTS user_roles, role_permissions, approvals, audit_log, actas, users, permissions, roles, templates, generation_models, transcription_models, system_config;
DROP TYPE IF EXISTS acta_status_enum, visibility_enum;

-- Create custom ENUM types for data integrity
CREATE TYPE acta_status_enum AS ENUM ('Borrador', 'Pendiente de Aprobación', 'Aprobada', 'Publicada', 'Rechazada');
CREATE TYPE visibility_enum AS ENUM ('public', 'private', 'specific');

-- Table for Roles
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Table for Permissions
CREATE TABLE permissions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL
);

-- Join table for Roles and Permissions (Many-to-Many)
CREATE TABLE role_permissions (
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Table for Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cedula TEXT,
    cargo TEXT,
    institucion TEXT
);

-- Join table for Users and Roles (Many-to-Many)
CREATE TABLE user_roles (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Table for Actas
CREATE TABLE actas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "date" DATE NOT NULL,
    status acta_status_enum NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    url TEXT,
    rejection_reason TEXT,
    full_acta_data JSONB,
    created_by TEXT NOT NULL,
    tags TEXT[],
    designated_approver_ids TEXT[],
    visibility visibility_enum,
    allowed_user_ids TEXT[]
);

-- Table for Approvals
CREATE TABLE approvals (
    acta_id TEXT NOT NULL REFERENCES actas(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (acta_id, user_id)
);

-- Table for Templates
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    segments JSONB NOT NULL
);

-- Table for Audit Log
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    "timestamp" TIMESTAMPTZ NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL
);

-- NEW TABLES FOR SYSTEM CONFIGURATION --

-- Table for Generation AI Models
CREATE TABLE generation_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    model_identifier TEXT NOT NULL,
    api_key TEXT,
    base_url TEXT
);

-- Table for Transcription AI Models
CREATE TABLE transcription_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    diarization TEXT NOT NULL,
    api_key TEXT,
    base_url TEXT
);

-- Table for System Configuration (single row)
CREATE TABLE system_config (
    id INT PRIMARY KEY DEFAULT 1,
    institution_name TEXT NOT NULL,
    institution_logo TEXT,
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    session_timeout INT NOT NULL DEFAULT 30,
    smtp_host TEXT,
    smtp_port INT,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_security TEXT,
    smtp_from_name TEXT,
    smtp_from_email TEXT,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Add indexes for performance
CREATE INDEX idx_actas_status ON actas(status);
CREATE INDEX idx_actas_date ON actas("date");
CREATE INDEX idx_audit_log_timestamp ON audit_log("timestamp");
CREATE INDEX idx_users_email ON users(email);

-- Add comments for clarity
COMMENT ON TABLE actas IS 'Stores summary and full data for each meeting minute.';
COMMENT ON COLUMN actas.full_acta_data IS 'Stores the entire ActaProcessState JSON object for drafts and in-progress actas.';
COMMENT ON TABLE system_config IS 'Stores global system settings. Designed to hold only one row.';
COMMENT ON COLUMN generation_models.api_key IS 'API key for the model provider. Should be encrypted at rest in a real production environment.';
COMMENT ON COLUMN system_config.smtp_pass IS 'SMTP password. Should be encrypted at rest in a real production environment.';
</code></pre>`
    },
    {
      id: 'db-population',
      title: 'Población Inicial de Datos (SQL)',
      content: `Después de crear el esquema, ejecuta este script para poblar la base de datos con los datos iniciales necesarios para la demostración, incluyendo roles, usuarios de ejemplo, permisos, plantillas y configuraciones del sistema.\n\n<pre class="bg-gray-900 text-sm text-cyan-300 p-4 rounded-md overflow-x-auto"><code>-- Población Inicial de Datos para el Sistema SAAP

-- 1. Insertar Permisos
INSERT INTO permissions (id, description) VALUES
('viewDashboard', 'Ver el repositorio de actas'),
('viewAllActas', 'Ver todas las actas (incluyendo borradores)'),
('viewPublishedActas', 'Ver solo actas publicadas'),
('createActas', 'Crear nuevas actas'),
('editActas', 'Editar borradores de actas'),
('approveActas', 'Aprobar o rechazar actas'),
('viewAdminDashboard', 'Acceder al panel de administración'),
('manageUsersAndRoles', 'Gestionar usuarios y roles'),
('manageTemplates', 'Gestionar plantillas de actas'),
('manageSystemConfig', 'Gestionar configuración del sistema'),
('viewMetrics', 'Ver dashboard de métricas'),
('viewAuditLog', 'Ver registro de auditoría');

-- 2. Insertar Roles
INSERT INTO roles (id, name) VALUES
('admin', 'Administrador'),
('editor', 'Editor / Generador'),
('viewer', 'Visor / Público');

-- 3. Asignar Permisos a Roles
-- Administrador tiene todos los permisos
INSERT INTO role_permissions (role_id, permission_id) SELECT 'admin', id FROM permissions;
-- Editor tiene permisos de creación y edición
INSERT INTO role_permissions (role_id, permission_id) VALUES
('editor', 'viewDashboard'), ('editor', 'createActas'),
('editor', 'editActas'), ('editor', 'viewAllActas');
-- Visor solo puede ver actas publicadas
INSERT INTO role_permissions (role_id, permission_id) VALUES
('viewer', 'viewDashboard'), ('viewer', 'viewPublishedActas');

-- 4. Insertar Usuarios de Ejemplo
INSERT INTO users (id, name, email, cedula, cargo, institucion) VALUES
('admin-01', 'Germán Llerena', 'admin@puyo.gob.ec', '1600123456', 'Alcalde', 'GAD Municipal del Cantón Pastaza'),
('editor-01', 'Patricia Sánchez', 'editor@puyo.gob.ec', '1600789012', 'Secretaria General', 'GAD Municipal del Cantón Pastaza'),
('approver-01', 'Roberto Villavicencio', 'approver@puyo.gob.ec', '1600345678', 'Concejal Principal', 'GAD Municipal del Cantón Pastaza'),
('approver-02', 'Mariana Acosta', 'approver2@puyo.gob.ec', '1600456789', 'Concejal Suplente', 'GAD Municipal del Cantón Pastaza'),
('viewer-01', 'Ana Torres', 'viewer@puyo.gob.ec', '1600901234', 'Analista de Comunicación', 'GAD Municipal del Cantón Pastaza');

-- 5. Asignar Roles a Usuarios
INSERT INTO user_roles (user_id, role_id) VALUES
('admin-01', 'admin'),
('editor-01', 'editor'),
('approver-01', 'viewer'),
('approver-02', 'viewer'),
('viewer-01', 'viewer');

-- 6. Insertar Actas de Ejemplo
INSERT INTO actas (id, title, "date", status, version, url, created_by, tags, designated_approver_ids, visibility, rejection_reason) VALUES
('ACTA-001', 'Sesión Ordinaria de Concejo 01-08-2024', '2024-08-01', 'Publicada', 2, '#', 'Patricia Sánchez', '{"concejo", "ordinaria"}', '{"approver-01"}', 'public', NULL),
('ACTA-002', 'Comisión de Planificación Territorial', '2024-08-05', 'Pendiente de Aprobación', 1, '#', 'Patricia Sánchez', '{"comisión", "planificación"}', '{"approver-01", "approver-02"}', NULL, NULL),
('ACTA-003', 'Reunión de Presupuesto Participativo', '2024-08-10', 'Borrador', 1, '#', 'Germán Llerena', '{"presupuesto"}', '{}', NULL, NULL),
('ACTA-004', 'Sesión Extraordinaria 15-08-2024', '2024-08-15', 'Rechazada', 3, '#', 'Patricia Sánchez', '{"concejo", "extraordinaria"}', '{"approver-01"}', NULL, 'Faltan detalles en los puntos de acción.'),
('ACTA-005', 'Reunión de Obras Públicas', '2024-08-20', 'Aprobada', 2, '#', 'Patricia Sánchez', '{"obras", "comisión"}', '{"approver-01"}', NULL, NULL);

-- 7. Insertar Aprobaciones de Ejemplo
INSERT INTO approvals (acta_id, user_id, user_name, approved_at) VALUES
('ACTA-001', 'approver-01', 'Roberto Villavicencio', '2024-07-31T10:00:00Z'),
('ACTA-005', 'approver-01', 'Roberto Villavicencio', '2024-08-19T14:00:00Z');

-- 8. Insertar Plantillas de Ejemplo
INSERT INTO templates (id, name, description, segments) VALUES
('formal_meeting', 'Acta de Reunión Formal', 'Una plantilla completa para reuniones de directorio, comités o sesiones formales.', '[{"id": "summary", "title": "Resumen Ejecutivo", "type": "ai", "prompt": "Basado en la transcripción, escribe un resumen ejecutivo conciso de la reunión, destacando los temas principales y las conclusiones clave."}]'),
('project_standup', 'Minuta de Stand-up de Proyecto', 'Plantilla ágil para reuniones diarias o semanales de seguimiento de proyectos.', '[{"id": "progress", "title": "Progreso", "type": "ai", "prompt": "Resume el progreso reportado por cada participante."}]');

-- 9. Insertar Configuración del Sistema
INSERT INTO system_config (id, institution_name, institution_logo, is_mfa_enabled, session_timeout, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_security, smtp_from_name, smtp_from_email) VALUES
(1, 'GAD Municipal del Cantón Pastaza', NULL, TRUE, 30, 'smtp.example.com', 587, 'user@example.com', '', 'tls', 'Sistema de Actas', 'no-reply@example.com');

-- 10. Insertar Modelos de IA de Generación
INSERT INTO generation_models (id, name, provider, model_identifier, api_key) VALUES
('gen_gemini_flash', 'Gemini 2.5 Flash', 'Gemini', 'gemini-2.5-flash', NULL),
('gen_openai_gpt4o', 'OpenAI GPT-4o', 'OpenAI', 'gpt-4o', '');

-- 11. Insertar Modelos de IA de Transcripción
INSERT INTO transcription_models (id, name, type, details, diarization) VALUES
('trans_whisper_large', 'Whisper (preciso)', 'Whisper', 'large-v3', 'Pyannote'),
('trans_whisper_base', 'Whisper (rápido)', 'Whisper', 'base', 'Pyannote');

</code></pre>`
    },
    {
      id: 'stack-despliegue',
      title: 'Stack Tecnológico y Guía de Despliegue (Dev/Prod)',
      content: `Este documento detalla todas las tecnologías utilizadas en el proyecto SAAP y proporciona una guía paso a paso para su despliegue en entornos de desarrollo y producción.\n\n**I. Stack Tecnológico**\n\n**Frontend:**\n- **Framework:** React 19 con TypeScript para una UI robusta y escalable.\n- **Estilos:** TailwindCSS para un diseño moderno y responsivo.\n- **Librerías Clave:**\n  - \`wavesurfer.js\`: Visualización y control de audio.\n  - \`html2canvas\` & \`jspdf\`: Exportación de actas a formato PDF.\n\n**Backend (Simulado):**\n- **Framework API:** FastAPI (Python) para un servicio de alto rendimiento.\n- **Servidor ASGI:** Uvicorn para ejecutar la aplicación FastAPI.\n- **Base de Datos:** PostgreSQL para el almacenamiento persistente de datos.\n- **Cola de Tareas Asíncronas:** Celery con Redis como broker para procesar tareas largas (transcripción, generación IA) en segundo plano.\n\n**Modelos de IA y Servicios:**\n- **Transcripción de Audio:** OpenAI Whisper (modelos \`base\`, \`small\`, \`large-v3\`).\n- **Diarización (Identificación de Hablantes):** Pyannote.audio.\n- **Generación de Contenido (LLMs):**\n  - Google Gemini 2.5 Flash\n  - OpenAI GPT-4o\n  - Soporte para modelos autoalojados como Ollama.\n\n**Infraestructura y Orquestación:**\n- **Contenerización:** Docker y Docker Compose para crear entornos de desarrollo y producción consistentes y aislados.\n\n**II. Guía de Despliegue**\n\n**Requisitos Previos:**\n- Git\n- Docker\n- Docker Compose\n- Node.js y npm (para desarrollo del frontend)\n\n**A. Entorno de Desarrollo (Local)**\n\n1.  **Clonar el Repositorio:**\n    \`git clone <URL_DEL_REPOSITORIO>\`\n    \`cd <CARPETA_DEL_PROYECTO>\`\n\n2.  **Configurar Variables de Entorno:**\n    Crea un archivo \`.env\` en la raíz del proyecto y añade las claves de API necesarias.\n    \`# .env\`\n    \`API_KEY=sk-tu-api-key-de-openai\`\n    \`# Otras variables como credenciales de la base de datos...\`\n\n3.  **Levantar Servicios de Backend:**\n    Ejecuta Docker Compose para iniciar la base de datos, Redis y la API del backend.\n    \`docker-compose up -d\`\n\n4.  **Ejecutar el Frontend:**\n    Navega a la carpeta del frontend, instala las dependencias y arranca el servidor de desarrollo.\n    \`cd frontend\`\n    \`npm install\`\n    \`npm start\`\n    La aplicación estará disponible en \`http://localhost:3000\`.\n\n**B. Entorno de Producción**\n\nEl despliegue en producción sigue un principio similar pero con consideraciones de seguridad y rendimiento adicionales.\n\n1.  **Imagen de Frontend Optimizada:**\n    En lugar de ejecutar el servidor de desarrollo, se crea una compilación estática del frontend (\`npm run build\`) y un servidor web ligero como Nginx sirve estos archivos.\n\n2.  **Gestión de Secretos:**\n    Las claves de API y contraseñas **NUNCA** deben estar hardcodeadas. Se deben gestionar a través de los "secrets" del orquestador de contenedores (ej. Docker Secrets) y pasarse como variables de entorno.\n\n3.  **Ejemplo de \`docker-compose.yml\` para Producción (Simplificado):**\n\n<pre class="bg-gray-900 text-sm text-cyan-300 p-4 rounded-md overflow-x-auto"><code>version: '3.8'

services:
  postgres:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=saap_db
      - POSTGRES_USER=saap_user
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    restart: always

  redis:
    image: redis:6-alpine
    restart: always

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    environment:
      - DATABASE_URL=postgresql://saap_user:\${POSTGRES_PASSWORD}@postgres/saap_db
      - REDIS_URL=redis://redis:6379/0
      - API_KEY=\${API_KEY}
    depends_on:
      - postgres
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"

volumes:
  postgres_data:
</code></pre>`
    },
    {
      id: 'readme-proyecto',
      title: 'README: Sistema de Actas Automatizadas del Pastaza (SAAP)',
      content: `**1. Introducción**
El Sistema de Actas Automatizadas del Pastaza (SAAP) es una plataforma integral diseñada para modernizar y optimizar la creación, gestión y publicación de actas de sesión para el GAD Municipal del Cantón Pastaza. Utilizando tecnologías de inteligencia artificial de vanguardia, SAAP transforma grabaciones de audio en documentos estructurados, precisos y auditables, promoviendo la eficiencia y la transparencia.\n
**2. Características Principales**
- **Transcripción Automática:** Convierte audio a texto con alta precisión.
- **Identificación de Hablantes (Diarización):** Reconoce y etiqueta automáticamente las intervenciones de cada participante.
- **Generación de Actas con IA:** Utiliza modelos de lenguaje avanzados para redactar resúmenes, decisiones y puntos de acción.
- **Plantillas Configurables:** Define la estructura de las actas según el tipo de reunión.
- **Flujo de Aprobación Dinámico:** Permite al creador del acta designar aprobadores específicos para cada documento.
- **Gestión de Roles y Permisos Granular:** Control total sobre quién puede ver, crear, editar y administrar contenido.
- **Repositorio Centralizado:** Un único lugar para buscar, filtrar y acceder a todas las actas.
- **Seguridad y Auditoría:** Autenticación de dos factores (MFA) y un registro detallado de todas las acciones del sistema.\n
**3. Módulos del Sistema**\n
**3.1. Login y Acceso Público**
- **Autenticación Segura:** Inicio de sesión con usuario/contraseña y soporte para MFA.
- **Recuperación de Contraseña:** Flujo simulado de recuperación vía email.
- **Acceso Público:** Un portal para que el público general pueda ver las actas publicadas sin necesidad de una cuenta.
- **Base de Conocimiento:** Acceso directo a la documentación completa del sistema.\n
**3.2. Dashboard / Repositorio de Actas**
- **Vista Centralizada:** Muestra todas las actas a las que el usuario tiene acceso.
- **Filtros Avanzados:** Permite buscar por título, contenido, estado, fecha o creador.
- **Acciones Rápidas:** Acceso directo para crear, editar, revisar, publicar o ver actas según los permisos del usuario.
- **Indicadores Visuales:** Chips de colores para identificar rápidamente el estado de cada acta (Borrador, Pendiente, Aprobada, etc.).\n
**3.3. Asistente de Generación de Actas (7 Pasos)**
1.  **Carga y Contexto:** Subir audio, definir metadatos y listar participantes.
2.  **Configuración:** Seleccionar modelos de IA y designar el circuito de aprobación.
3.  **Procesando:** La IA transcribe y diariza el audio. Se ofrece la opción de "Guardar y Salir" para procesos largos.
4.  **Verificación:** Interfaz de edición para corregir la transcripción y asegurar su fidelidad.
5.  **Plantilla:** Escoger la estructura del acta final.
6.  **Generando Acta:** La IA redacta el contenido de cada sección del acta.
7.  **Editor:** Editor de texto enriquecido para los ajustes finales antes de guardar o enviar a aprobación.\n
**3.4. Panel de Administración**
- **Configuración General:** Gestionar nombre de la institución, logo y políticas de seguridad (MFA, tiempo de sesión).
- **Configuración de IA:** Centro de mando para añadir y parametrizar modelos de IA (OpenAI, Gemini, Ollama, etc.) con sus respectivas API Keys y URLs.
- **Configuración SMTP:** Configurar el servidor de correo para notificaciones.
- **Gestión de Plantillas:** Crear y editar las plantillas que estructuran las actas.
- **Gestión de Usuarios y Roles:** Administrar el acceso de los usuarios a través de roles con permisos detallados. Soporta múltiples roles por usuario.
- **Métricas y Auditoría:** Visualizar estadísticas de uso y revisar un registro inmutable de todas las acciones realizadas en la plataforma.\n
**4. Conclusión**
SAAP es más que una herramienta de transcripción; es una solución completa de gobernanza digital que asegura que las decisiones y deliberaciones del GAD Municipal sean documentadas con precisión, gestionadas de forma segura y compartidas con transparencia.`
    }
  ],
  faqs: [
    {
      id: 'audio-files',
      title: '¿Qué tipo de archivos de audio puedo subir?',
      content: 'El sistema es compatible con los formatos de audio más comunes, incluyendo **MP3, WAV, M4A y WEBM**. Para obtener la máxima precisión en la transcripción, recomendamos utilizar grabaciones con la menor cantidad de ruido de fondo posible y con un audio claro y directo de los participantes.'
    },
    {
      id: 'asignar-hablantes',
      title: '¿Cómo se asignan los hablantes correctamente?',
      content: 'En el primer paso, debes listar a todos los participantes de la reunión. Puedes hacerlo de dos formas: **Entrada Manual**, donde escribes sus datos, o **Usuario del Sistema**, donde los seleccionas de una lista. Es crucial que todos los que hablaron en la sesión estén en esta lista para que la IA pueda identificarlos correctamente.'
    },
    {
      id: 'corregir-transcripcion',
      title: '¿Qué hago si la transcripción automática tiene errores?',
      content: 'Ninguna IA es perfecta. Por eso, el **Paso 4: Verificación** es fundamental. En esta pantalla, puedes escuchar el audio mientras lees la transcripción, editar cualquier palabra, corregir los tiempos de inicio y fin de cada intervención, y reasignar un hablante si la IA se equivocó. Todos los cambios se guardan automáticamente.'
    },
    {
      id: 'crear-plantillas',
      title: '¿Puedo crear mis propias plantillas de actas?',
      content: 'Sí. Los administradores pueden ir al **Panel de Administración > Gestión de Plantillas** para crear, editar o eliminar plantillas. Una plantilla se compone de varios segmentos, que pueden ser de texto estático o dinámicos, generados por IA a partir de un "prompt" (instrucción) que tú definas.'
    },
     {
      id: 'circuito-aprobacion',
      title: '¿Cómo funciona el circuito de aprobación?',
      content: 'El flujo es flexible y lo define el generador del acta. En el paso de configuración, el creador del documento elige a uno o varios usuarios del sistema para que sean los aprobadores. El acta no se considerará "Aprobada" hasta que **todos** los usuarios designados le den su visto bueno. Una vez aprobada, solo el generador o un administrador pueden publicarla.'
    },
    {
      id: 'seguridad',
      title: '¿Es seguro el sistema?',
      content: 'La seguridad es una prioridad. El sistema incluye:\n- **Autenticación de Dos Factores (MFA):** Configurable por el administrador para añadir una capa extra de seguridad al inicio de sesión.\n- **Roles y Permisos:** Un sistema granular que asegura que los usuarios solo puedan ver y hacer lo que su rol les permite.\n- **Registro de Auditoría:** Todas las acciones importantes (creación, edición, aprobación, publicación, cambios en configuración) quedan registradas para su posterior revisión.'
    }
  ]
};

const downloadAsTxt = (filename: string, content: string) => {
    // Create a temporary div to parse potential HTML content and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.replace(/[\s,]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

const AccordionItem: React.FC<{
    item: { id: string; title: string; content: string };
    isOpen: boolean;
    onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-700">
            <button onClick={onClick} className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-700/50">
                <span className="font-semibold text-white">{item.title}</span>
                <i className={`fas fa-chevron-down text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-900/50 animate-fade-in-fast">
                    <div 
                        className="text-gray-300 whitespace-pre-line prose prose-invert max-w-none" 
                        dangerouslySetInnerHTML={{__html: item.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}
                    ></div>
                    <button 
                        onClick={() => downloadAsTxt(item.title, item.content)}
                        className="mt-4 text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-2"
                    >
                        <i className="fas fa-download"></i> Descargar (.txt)
                    </button>
                </div>
            )}
        </div>
    );
};

interface KnowledgeBaseModalProps {
    onClose: () => void;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'articles' | 'faqs'>('articles');
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const handleAccordionClick = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const content = KNOWLEDGE_BASE_CONTENT[activeTab];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <i className="fas fa-book-open text-purple-400"></i>
                        Base de Conocimiento del SAAP
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </header>
                
                <div className="flex-shrink-0 border-b border-gray-700">
                    <nav className="flex space-x-4 px-4">
                        <button onClick={() => setActiveTab('articles')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'articles' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-white'}`}>
                            Artículos
                        </button>
                        <button onClick={() => setActiveTab('faqs')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'faqs' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-white'}`}>
                            Preguntas Frecuentes
                        </button>
                    </nav>
                </div>

                <main className="overflow-y-auto flex-grow p-2">
                    {content.map(item => (
                        <AccordionItem 
                            key={item.id} 
                            item={item} 
                            isOpen={openAccordion === item.id}
                            onClick={() => handleAccordionClick(item.id)}
                        />
                    ))}
                </main>

                <footer className="p-4 border-t border-gray-700 flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-5 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cerrar</button>
                </footer>
            </div>
        </div>
    );
};

export default KnowledgeBaseModal;