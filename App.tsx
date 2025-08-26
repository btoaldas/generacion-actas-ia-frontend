
import React, { useState, useMemo } from 'react';
import { ActaSummary, ActaStatus, User, AdminView, Template, ActaProcessState, SystemConfig, AuditLogEntry, Role, Permission, Toast as ToastType, Approval } from './types';
import { TEMPLATES as initialTemplates, ROLES as initialRoles } from './constants';
import Dashboard from './components/Dashboard';
import ActaGeneratorProcess from './components/ActaGeneratorProcess';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';
import AdministrationScreen from './components/AdministrationScreen';
import TemplateManager from './components/TemplateManager';
import UserManager from './components/UserManager';
import MetricsDashboard from './components/MetricsDashboard';
import MfaScreen from './components/MfaScreen';
import PublicActaViewer from './components/PublicActaViewer';
import AuditLogScreen from './components/AuditLogScreen';
import ToastContainer from './components/ToastContainer';
import GeneralConfigurationScreen from './components/GeneralConfigurationScreen';
// FIX: Corrected the import path for AiConfigurationScreen.
import AiConfigurationScreen from './components/SystemConfigurationScreen';
import SmtpConfigurationScreen from './components/SmtpConfigurationScreen';

// Se añaden los nuevos campos a los usuarios iniciales para que la data sea consistente.
const initialUsers: User[] = [
    { id: 'admin-01', name: 'Germán Llerena', email: 'admin@puyo.gob.ec', roleIds: ['admin'], cedula: '1600123456', cargo: 'Alcalde', institucion: 'GAD Municipal del Cantón Pastaza' },
    { id: 'editor-01', name: 'Patricia Sánchez', email: 'editor@puyo.gob.ec', roleIds: ['editor'], cedula: '1600789012', cargo: 'Secretaria General', institucion: 'GAD Municipal del Cantón Pastaza' },
    { id: 'approver-01', name: 'Roberto Villavicencio', email: 'approver@puyo.gob.ec', roleIds: ['viewer'], cedula: '1600345678', cargo: 'Concejal Principal', institucion: 'GAD Municipal del Cantón Pastaza' },
    { id: 'approver-02', name: 'Mariana Acosta', email: 'approver2@puyo.gob.ec', roleIds: ['viewer'], cedula: '1600456789', cargo: 'Concejal Suplente', institucion: 'GAD Municipal del Cantón Pastaza' },
    { id: 'viewer-01', name: 'Ana Torres', email: 'viewer@puyo.gob.ec', roleIds: ['viewer'], cedula: '1600901234', cargo: 'Analista de Comunicación', institucion: 'GAD Municipal del Cantón Pastaza' },
];


const App: React.FC = () => {
    const [view, setView] = useState<'login' | 'publicDashboard' | 'dashboard' | 'generator' | 'administration' | 'publicViewer'>('login');
    const [adminView, setAdminView] = useState<AdminView>('main');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [pendingMfaUser, setPendingMfaUser] = useState<User | null>(null);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    
    // Estado para ver/editar actas específicas
    const [editingActaId, setEditingActaId] = useState<string | null>(null);
    const [viewingActa, setViewingActa] = useState<ActaSummary | null>(null);

    // Datos gestionados por el estado
    const [actas, setActas] = useState<ActaSummary[]>([
        { id: 'ACTA-001', title: 'Sesión Ordinaria de Concejo 01-08-2024', date: '2024-08-01', status: ActaStatus.Published, version: 2, url: '#', createdBy: 'Patricia Sánchez', tags: ['concejo', 'ordinaria'], designatedApproverIds: ['approver-01'], approvals: [{ userId: 'approver-01', userName: 'Roberto Villavicencio', approvedAt: '2024-07-31T10:00:00Z'}], visibility: 'public' },
        { id: 'ACTA-002', title: 'Comisión de Planificación Territorial', date: '2024-08-05', status: ActaStatus.PendingApproval, version: 1, url: '#', createdBy: 'Patricia Sánchez', tags: ['comisión', 'planificación'], designatedApproverIds: ['approver-01', 'approver-02'], approvals: [] },
        { id: 'ACTA-003', title: 'Reunión de Presupuesto Participativo', date: '2024-08-10', status: ActaStatus.Draft, version: 1, url: '#', fullActaData: null, createdBy: 'Germán Llerena', tags: ['presupuesto'], designatedApproverIds: [], approvals: [] },
        { id: 'ACTA-004', title: 'Sesión Extraordinaria 15-08-2024', date: '2024-08-15', status: ActaStatus.Rejected, version: 3, url: '#', rejectionReason: "Faltan detalles en los puntos de acción.", createdBy: 'Patricia Sánchez', tags: ['concejo', 'extraordinaria'], designatedApproverIds: ['approver-01'], approvals: [] },
        { id: 'ACTA-005', title: 'Reunión de Obras Públicas', date: '2024-08-20', status: ActaStatus.Approved, version: 2, url: '#', createdBy: 'Patricia Sánchez', tags: ['obras', 'comisión'], designatedApproverIds: ['approver-01'], approvals: [{userId: 'approver-01', userName: 'Roberto Villavicencio', approvedAt: '2024-08-19T14:00:00Z'}] },
    ]);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        institutionName: 'GAD Municipal del Cantón Pastaza',
        institutionLogo: null,
        isMfaEnabled: true,
        sessionTimeout: 30, // minutos
        generationModels: [
            { id: 'gen_gemini_flash', name: 'Gemini 2.5 Flash', provider: 'Gemini', modelIdentifier: 'gemini-2.5-flash' },
            { id: 'gen_openai_gpt4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', modelIdentifier: 'gpt-4o', apiKey: '' },
        ],
        transcriptionModels: [
            { id: 'trans_whisper_large', name: 'Whisper (preciso)', type: 'Whisper', details: 'large-v3', diarization: 'Pyannote' },
            { id: 'trans_whisper_base', name: 'Whisper (rápido)', type: 'Whisper', details: 'base', diarization: 'Pyannote' },
        ],
        smtp: {
            host: 'smtp.example.com',
            port: 587,
            user: 'user@example.com',
            pass: '',
            security: 'tls',
            fromName: 'Sistema de Actas',
            fromEmail: 'no-reply@example.com'
        }
    });
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    
    // --- Gestor de Notificaciones (Toasts) ---
    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    
    // --- Permisos ---
    const currentUserPermissions = useMemo(() => {
        const permissions: { [key in Permission]?: boolean } = {};
        if (!currentUser) return permissions;

        currentUser.roleIds.forEach(roleId => {
            const userRole = roles.find(r => r.id === roleId);
            if (userRole) {
                for (const p of userRole.permissions) {
                    permissions[p] = true;
                }
            }
        });
        
        return permissions;
    }, [currentUser, roles]);
    
    // --- Gestor de Logs ---
    const logAction = (action: string, details: string, user: User | null = currentUser) => {
        if (!user) return; // No registrar si no hay un usuario en contexto
        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: user.id,
            userName: user.name,
            action,
            details
        };
        setAuditLog(prev => [newLog, ...prev]);
    };

    // --- Gestores de Autenticación ---
    const handleLoginAttempt = (userToLogin: User) => {
        if (userToLogin) {
            if (systemConfig.isMfaEnabled) {
                setPendingMfaUser(userToLogin);
            } else {
                 setCurrentUser(userToLogin);
                 setView('dashboard');
                 logAction("Inicio de Sesión", `El usuario ${userToLogin.name} ha iniciado sesión.`, userToLogin);
            }
        }
    };
    
    const handleMfaSuccess = () => {
        if (pendingMfaUser) {
            setCurrentUser(pendingMfaUser);
            logAction("Inicio de Sesión", `El usuario ${pendingMfaUser.name} ha iniciado sesión.`, pendingMfaUser);
            setView('dashboard');
        }
        setPendingMfaUser(null);
    }

    const handleLogout = () => {
        setCurrentUser(null);
        setPendingMfaUser(null);
        setView('login'); 
    };
    
    // --- Gestores de Navegación ---
    const handleNavigation = (targetView: 'dashboard' | 'administration') => {
        setView(targetView);
        if (targetView === 'administration') {
            setAdminView('main');
        }
    }
    
    const handleNewActa = () => {
        const newActaId = `ACTA-TEMP-${Date.now()}`;
        setEditingActaId(newActaId);
        setView('generator');
    };
    
    const handleEditActa = (actaId: string) => {
        setEditingActaId(actaId);
        setView('generator');
    }
    
    const handleViewActa = (acta: ActaSummary) => {
        setViewingActa(acta);
        setView('publicViewer');
    }

    // --- Gestores CRUD y Flujo de Trabajo ---
    const handleSaveDraft = (actaId: string, processState: ActaProcessState) => {
        const existingActa = actas.find(a => a.id === actaId);
        if(existingActa) {
             setActas(actas.map(a => a.id === actaId ? {...a, title: processState.meetingData.title, date: processState.meetingData.date, fullActaData: processState, status: ActaStatus.Draft} : a));
             logAction("Guardar Borrador", `Se guardaron cambios en el borrador: ${processState.meetingData.title || existingActa.title}`);
        } else {
             const finalId = actaId.startsWith('ACTA-TEMP') ? `ACTA-00${actas.length + 1}` : actaId;
             const newActa: ActaSummary = {
                id: finalId,
                title: processState.meetingData.title || 'Nuevo Borrador',
                date: processState.meetingData.date || new Date().toISOString().split('T')[0],
                status: ActaStatus.Draft,
                version: 1,
                url: '#',
                fullActaData: processState,
                createdBy: currentUser!.name,
                tags: [],
                designatedApproverIds: processState.designatedApproverIds,
                approvals: [],
            };
            setActas([newActa, ...actas]);
            logAction("Crear Borrador", `Se creó un nuevo borrador de acta: ${newActa.title} (ID: ${newActa.id})`);
        }
        addToast('Borrador guardado exitosamente.', 'success');
        setEditingActaId(null);
        setView('dashboard');
    }
    
    const handleSubmitForApproval = (actaId: string, processState: ActaProcessState) => {
        const finalId = actaId.startsWith('ACTA-TEMP') ? `ACTA-00${actas.length + 1}` : actaId;
        logAction("Enviar a Aprobación", `El acta ${processState.meetingData.title} (ID: ${finalId}) se envió para aprobación.`);
        
        const isNew = actaId.startsWith('ACTA-TEMP');
        const commonData = {
            title: processState.meetingData.title || 'Nuevo Borrador',
            date: processState.meetingData.date || new Date().toISOString().split('T')[0],
            status: ActaStatus.PendingApproval,
            fullActaData: processState,
            createdBy: currentUser!.name,
            tags: [],
            designatedApproverIds: processState.designatedApproverIds,
            approvals: [], // Reset approvals on a new submission
        };
        
        if (isNew) {
            const newActa: ActaSummary = {
                id: finalId,
                version: 1,
                url: '#',
                ...commonData,
            };
            setActas([newActa, ...actas]);
        } else {
            setActas(prev => prev.map(a => a.id === finalId ? {...a, ...commonData, version: a.version + 1 } : a));
        }
        
        addToast('Acta enviada para aprobación.', 'info');
        setEditingActaId(null);
        setView('dashboard');
    }

    const handleActaApprovalAction = (actaId: string, action: 'approve' | 'reject', approvingUser: User, reason?: string) => {
        const acta = actas.find(a => a.id === actaId);
        if (!acta) return;

        let updatedActa = { ...acta };

        if (action === 'reject') {
            updatedActa.status = ActaStatus.Rejected;
            updatedActa.rejectionReason = reason;
            updatedActa.version = acta.version + 1;
            updatedActa.approvals = []; // Reset approvals on rejection
            logAction("Rechazo de Acta", `El acta "${acta.title}" fue rechazada por ${approvingUser.name}. Motivo: ${reason}`);
            addToast(`Acta "${acta.title}" rechazada.`, 'error');
        } else { // approve
            const alreadyApproved = acta.approvals?.some(appr => appr.userId === approvingUser.id);
            if (!alreadyApproved) {
                const newApproval: Approval = {
                    userId: approvingUser.id,
                    userName: approvingUser.name,
                    approvedAt: new Date().toISOString(),
                };
                updatedActa.approvals = [...(acta.approvals || []), newApproval];
            }

            const allApproved = updatedActa.designatedApproverIds?.every(id =>
                updatedActa.approvals?.some(appr => appr.userId === id)
            );

            if (allApproved) {
                updatedActa.status = ActaStatus.Approved;
                updatedActa.version = acta.version + 1;
                logAction("Aprobación Final de Acta", `El acta "${acta.title}" recibió todas las aprobaciones.`);
                addToast(`Acta "${acta.title}" aprobada y lista para publicar.`, 'success');
            } else {
                logAction("Aprobación Parcial de Acta", `El acta "${acta.title}" fue aprobada por ${approvingUser.name}.`);
                addToast(`Aprobación registrada para el acta "${acta.title}".`, 'info');
            }
        }
        setActas(actas.map(a => (a.id === actaId ? updatedActa : a)));
    };
    
    const handlePublishActa = (actaId: string, visibility: 'public' | 'private' | 'specific', allowedUserIds: string[]) => {
        const acta = actas.find(a => a.id === actaId);
        if (!acta) return;
        
        logAction("Publicación de Acta", `El acta "${acta.title}" fue publicada con visibilidad: ${visibility}.`);

        setActas(actas.map(a => a.id === actaId ? {
            ...a,
            status: ActaStatus.Published,
            version: a.version + 1,
            visibility,
            allowedUserIds,
        } : a));
        
        addToast(`Acta "${acta.title}" publicada exitosamente.`, 'success');
    };

    const handleSaveTemplate = (templateToSave: Template) => {
        const exists = templates.some(t => t.id === templateToSave.id);
        const action = exists ? "Actualizar Plantilla" : "Crear Plantilla";
        logAction(action, `Se guardó la plantilla: ${templateToSave.name}`);
        if (exists) {
            setTemplates(templates.map(t => t.id === templateToSave.id ? templateToSave : t));
        } else {
            setTemplates([...templates, templateToSave]);
        }
        addToast('Plantilla guardada correctamente.', 'success');
    };

    const handleDeleteTemplate = (templateId: string) => {
        const templateName = templates.find(t => t.id === templateId)?.name || templateId;
        logAction("Eliminar Plantilla", `Se eliminó la plantilla: ${templateName}`);
        setTemplates(templates.filter(t => t.id !== templateId));
        addToast('Plantilla eliminada.', 'info');
    };
    
    const handleSaveUser = (userToSave: User) => {
         const exists = users.some(u => u.id === userToSave.id);
         const roleNames = userToSave.roleIds.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(', ') || 'Desconocido';
         const action = exists ? "Actualizar Usuario" : "Crear Usuario";
         logAction(action, `Se guardó al usuario: ${userToSave.name} (Roles: ${roleNames})`);
        if (exists) {
            setUsers(users.map(u => u.id === userToSave.id ? userToSave : u));
        } else {
            setUsers([...users, userToSave]);
        }
        addToast('Usuario guardado correctamente.', 'success');
    };
    
    const handleDeleteUser = (userId: string) => {
        const userName = users.find(u => u.id === userId)?.name || userId;
        logAction("Eliminar Usuario", `Se eliminó al usuario: ${userName}`);
        setUsers(users.filter(u => u.id !== userId));
        addToast('Usuario eliminado.', 'info');
    };

    const handleSaveRole = (roleToSave: Role) => {
        const exists = roles.some(r => r.id === roleToSave.id);
        const action = exists ? "Actualizar Rol" : "Crear Rol";
        logAction(action, `Se guardó el rol: ${roleToSave.name}`);
        if (exists) {
            setRoles(roles.map(r => r.id === roleToSave.id ? roleToSave : r));
        } else {
            setRoles([...roles, roleToSave]);
        }
        addToast('Rol guardado correctamente.', 'success');
    };

    const handleDeleteRole = (roleId: string) => {
         if (users.some(u => u.roleIds.includes(roleId))) {
            addToast("No se puede eliminar un rol que está asignado a uno o más usuarios.", 'error');
            return;
        }
        const roleName = roles.find(r => r.id === roleId)?.name || roleId;
        logAction("Eliminar Rol", `Se eliminó el rol: ${roleName}`);
        setRoles(roles.filter(r => r.id !== roleId));
        addToast('Rol eliminado.', 'info');
    };
    
    const handleSaveSystemConfig = (newConfigSlice: Partial<SystemConfig>) => {
        logAction("Actualizar Configuración", `Se guardaron los cambios en la configuración del sistema.`);
        setSystemConfig(prev => ({ ...prev, ...newConfigSlice }));
        addToast('Configuración del sistema guardada.', 'success');
    };

    // --- Lógica de Renderizado ---

    const renderContent = () => {
        const exitPublicViewer = () => {
            setViewingActa(null);
            setView(currentUser ? 'dashboard' : 'publicDashboard');
        };

        if (view === 'publicViewer' && viewingActa) {
            return <PublicActaViewer acta={viewingActa} onExit={exitPublicViewer} />;
        }

        // Vistas no autenticadas
        if (!currentUser) {
            if (view === 'login') {
                if (pendingMfaUser) {
                    return <MfaScreen user={pendingMfaUser} onVerifySuccess={handleMfaSuccess} onCancel={() => { setPendingMfaUser(null); setView('login'); }} />;
                }
                return <LoginScreen onLoginAttempt={handleLoginAttempt} users={users} onViewPublic={() => setView('publicDashboard')} />;
            }

            if (view === 'publicDashboard') {
                return (
                    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
                        <header className="max-w-7xl mx-auto w-full flex justify-between items-center mb-6">
                             <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Repositorio Público</h1>
                             <button onClick={() => setView('login')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                                Volver al Login
                            </button>
                        </header>
                         <main className="max-w-7xl mx-auto w-full">
                            <Dashboard
                                actas={actas}
                                users={users}
                                currentUser={null}
                                permissions={{}}
                                onNewActa={() => { }}
                                onEdit={() => { }}
                                onView={handleViewActa}
                                onApprovalAction={() => { }}
                                onPublish={() => { }}
                            />
                        </main>
                    </div>
                );
            }
             return <LoginScreen onLoginAttempt={handleLoginAttempt} users={users} onViewPublic={() => setView('publicDashboard')} />;
        }

        // Vistas autenticadas
        const renderAdminView = () => {
            switch (adminView) {
                case 'templates':
                    return <TemplateManager templates={templates} onSave={handleSaveTemplate} onDelete={handleDeleteTemplate} onBack={() => setAdminView('main')} />;
                case 'users':
                    return <UserManager users={users} roles={roles} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} onSaveRole={handleSaveRole} onDeleteRole={handleDeleteRole} onBack={() => setAdminView('main')} />;
                case 'metrics':
                    return <MetricsDashboard actas={actas} onBack={() => setAdminView('main')} />;
                case 'auditLog':
                    return <AuditLogScreen logs={auditLog} onBack={() => setAdminView('main')} />;
                case 'generalConfig':
                     return <GeneralConfigurationScreen config={systemConfig} onSave={handleSaveSystemConfig} onBack={() => setAdminView('main')} />;
                case 'aiConfig':
                    return <AiConfigurationScreen config={systemConfig} onSave={handleSaveSystemConfig} onBack={() => setAdminView('main')} />;
                case 'smtpConfig':
                     return <SmtpConfigurationScreen config={systemConfig.smtp} onSave={handleSaveSystemConfig} onBack={() => setAdminView('main')} addToast={addToast} />;
                case 'main':
                default:
                    return <AdministrationScreen onNavigateTo={setAdminView} />;
            }
        }
        
        const actaToEdit = actas.find(a => a.id === editingActaId);

        const renderCurrentView = () => {
            switch (view) {
                case 'generator':
                    return (
                        <ActaGeneratorProcess 
                            actaId={editingActaId!}
                            initialState={actaToEdit?.fullActaData || null}
                            onSaveDraft={handleSaveDraft}
                            onSubmitForApproval={handleSubmitForApproval}
                            onExit={() => { setView('dashboard'); setEditingActaId(null); }} 
                            permissions={currentUserPermissions} 
                            templates={templates} 
                            systemConfig={systemConfig}
                            users={users}
                            roles={roles}
                            addToast={addToast}
                        />
                    );
                case 'administration':
                    return renderAdminView();
                case 'dashboard':
                default:
                    return (
                        <Dashboard 
                            actas={actas} 
                            users={users}
                            permissions={currentUserPermissions}
                            currentUser={currentUser}
                            onNewActa={handleNewActa}
                            onEdit={handleEditActa}
                            onView={handleViewActa}
                            onApprovalAction={handleActaApprovalAction}
                            onPublish={handlePublishActa}
                        />
                    );
            }
        }

        // FIX: Add a guard to handle logically unreachable states and satisfy TypeScript.
        // When a user is authenticated, the view should never be 'login' or 'publicDashboard'.
        // This check narrows the type of `view` for the MainLayout component.
        if (view === 'login' || view === 'publicDashboard') {
            return null;
        }

        return (
            <MainLayout user={currentUser} roles={roles} permissions={currentUserPermissions} onLogout={handleLogout} onNavigate={handleNavigation} currentView={view} adminView={adminView}>
                 {renderCurrentView()}
            </MainLayout>
        );
    }
    
    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            {renderContent()}
        </>
    );
};

export default App;
