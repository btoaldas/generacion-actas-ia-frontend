
import React, { useState, useMemo } from 'react';
import { ActaSummary, ActaStatus, User, Permission, Approval } from '../types';
import VersionHistoryModal from './VersionHistoryModal';

interface DashboardProps {
    actas: ActaSummary[];
    users: User[];
    permissions: { [key in Permission]?: boolean };
    currentUser: User | null;
    onNewActa: () => void;
    onEdit: (actaId: string) => void;
    onView: (acta: ActaSummary) => void;
    onApprovalAction: (actaId: string, action: 'approve' | 'reject', approvingUser: User, reason?: string) => void;
    onPublish: (actaId: string, visibility: 'public' | 'private' | 'specific', allowedUserIds: string[]) => void;
}

const getStatusChip = (acta: ActaSummary) => {
    const status = acta.status;
    // FIX: Explicitly type `text` as a string to allow assigning a formatted string to it later.
    let text: string = status;
    if (status === ActaStatus.PendingApproval) {
        const total = acta.designatedApproverIds?.length || 0;
        const current = acta.approvals?.length || 0;
        if (total > 0) {
            text = `${status} (${current}/${total})`;
        }
    }

    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    switch (status) {
        case ActaStatus.Published:
            return <span className={`${baseClasses} bg-green-800 text-green-200`}>{text}</span>;
        case ActaStatus.PendingApproval:
            return <span className={`${baseClasses} bg-yellow-800 text-yellow-200`}>{text}</span>;
        case ActaStatus.Approved:
            return <span className={`${baseClasses} bg-blue-800 text-blue-200`}>{text}</span>;
        case ActaStatus.Draft:
            return <span className={`${baseClasses} bg-gray-700 text-gray-300`}>{text}</span>;
        case ActaStatus.Rejected:
            return <span className={`${baseClasses} bg-red-800 text-red-200`}>{text}</span>;
        default:
            return <span>{text}</span>;
    }
};

const ReviewModal: React.FC<{ 
    acta: ActaSummary, 
    currentUser: User,
    onClose: () => void, 
    onApprovalAction: (actaId: string, action: 'approve' | 'reject', approvingUser: User, reason?: string) => void
}> = ({ acta, currentUser, onClose, onApprovalAction }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    
    const handleReject = () => {
        if(rejectionReason.trim() === '') {
            alert('Por favor, proporciona un motivo para el rechazo.');
            return;
        }
        onApprovalAction(acta.id, 'reject', currentUser, rejectionReason);
        onClose();
    };

    const handleApprove = () => {
        onApprovalAction(acta.id, 'approve', currentUser);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-lg w-full">
                <h3 className="text-lg font-bold text-white mb-2">Revisar Acta</h3>
                <p className="text-sm text-gray-400 mb-4">{acta.title}</p>
                
                {!showRejectionForm ? (
                    <>
                        <p className="text-sm text-gray-300 mb-6">El acta ha sido enviada para su revisión. ¿Deseas aprobarla para que el generador la publique, o rechazarla y devolverla?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cancelar</button>
                            <button onClick={() => setShowRejectionForm(true)} className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700">Rechazar</button>
                            <button onClick={handleApprove} className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700">Aprobar</button>
                        </div>
                    </>
                ) : (
                     <>
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-300 mb-2">Motivo del Rechazo</label>
                        <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"
                            placeholder="Ej: Faltan detalles en los puntos de acción..."
                        />
                        <div className="flex justify-end gap-3 mt-4">
                             <button onClick={() => setShowRejectionForm(false)} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Volver</button>
                             <button onClick={handleReject} className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700">Confirmar Rechazo</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const PublishModal: React.FC<{
    acta: ActaSummary;
    users: User[];
    onClose: () => void;
    onPublish: (actaId: string, visibility: 'public' | 'private' | 'specific', allowedUserIds: string[]) => void;
}> = ({ acta, users, onClose, onPublish }) => {
    const [visibility, setVisibility] = useState<'public' | 'private' | 'specific'>('public');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const handleUserSelect = (userId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedUserIds([...selectedUserIds, userId]);
        } else {
            setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
        }
    };

    const handleConfirmPublish = () => {
        onPublish(acta.id, visibility, visibility === 'specific' ? selectedUserIds : []);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in-fast p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-lg w-full">
                <h3 className="text-xl font-bold text-white mb-2">Publicar Acta</h3>
                <p className="text-sm text-gray-400 mb-6">{acta.title}</p>

                <div className="space-y-4">
                    <label className="flex items-start p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                        <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="mt-1" />
                        <div className="ml-3">
                            <p className="font-semibold text-white">Público</p>
                            <p className="text-xs text-gray-400">El acta será visible para todos, incluyendo el rol 'Visor'.</p>
                        </div>
                    </label>
                    <label className="flex items-start p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                        <input type="radio" name="visibility" value="specific" checked={visibility === 'specific'} onChange={() => setVisibility('specific')} className="mt-1" />
                        <div className="ml-3">
                            <p className="font-semibold text-white">Usuarios Específicos</p>
                            <p className="text-xs text-gray-400">Solo los usuarios seleccionados podrán ver el acta.</p>
                        </div>
                    </label>
                    <label className="flex items-start p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                        <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="mt-1" />
                        <div className="ml-3">
                            <p className="font-semibold text-white">Privado</p>
                            <p className="text-xs text-gray-400">Solo el creador y los administradores podrán ver el acta.</p>
                        </div>
                    </label>
                </div>

                {visibility === 'specific' && (
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Seleccionar Usuarios</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {users.map(user => (
                                <label key={user.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-700">
                                    <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={e => handleUserSelect(user.id, e.target.checked)} />
                                    <span className="text-sm text-gray-300">{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleConfirmPublish} className="px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Confirmar Publicación</button>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ actas, users, permissions, currentUser, onNewActa, onEdit, onView, onApprovalAction, onPublish }) => {
    const [reviewingActa, setReviewingActa] = useState<ActaSummary | null>(null);
    const [publishingActa, setPublishingActa] = useState<ActaSummary | null>(null);
    const [historyActa, setHistoryActa] = useState<ActaSummary | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ActaStatus | 'all'>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [creatorFilter, setCreatorFilter] = useState('all');

    const isPublicMode = !currentUser;

    const filteredActas = useMemo(() => {
        return actas.filter(acta => {
            // Permission-based filtering
            if (isPublicMode) {
                if (acta.visibility !== 'public') return false;
            } else {
                 const canView = permissions.viewAllActas || 
                          (permissions.viewPublishedActas && acta.status === ActaStatus.Published) ||
                          (acta.visibility === 'public') ||
                          (acta.visibility === 'specific' && acta.allowedUserIds?.includes(currentUser.id)) ||
                          (acta.createdBy === currentUser.name); // Creator can always see

                if (!canView && !permissions.viewAllActas) return false;
            }

            // Status
            if (statusFilter !== 'all' && acta.status !== statusFilter) return false;
            // Creator
            if (creatorFilter !== 'all' && acta.createdBy !== creatorFilter) return false;
            // Date Range
            if (startDate && acta.date < startDate) return false;
            if (endDate && acta.date > endDate) return false;

            // Search Term
            if (searchTerm.trim() !== '') {
                const lowercasedTerm = searchTerm.toLowerCase();
                const titleMatch = acta.title.toLowerCase().includes(lowercasedTerm);
                
                let contentMatch = false;
                if (acta.fullActaData) {
                    try {
                        const contentString = JSON.stringify(acta.fullActaData);
                        contentMatch = contentString.toLowerCase().includes(lowercasedTerm);
                    } catch (e) {
                        console.error("Error processing acta content for search:", e);
                    }
                }
                
                if (!titleMatch && !contentMatch) return false;
            }
            
            return true;
        });
    }, [actas, searchTerm, statusFilter, startDate, endDate, creatorFilter, permissions, currentUser, isPublicMode]);

    const Actions: React.FC<{ acta: ActaSummary }> = ({ acta }) => {
        const commonButton = "px-3 py-1 text-sm rounded-md transition-colors";
        const viewButton = `${commonButton} bg-blue-600 hover:bg-blue-700`;

        if (isPublicMode) {
            return <button onClick={() => onView(acta)} className={viewButton}>Ver Acta</button>;
        }
        
        const editButton = `${commonButton} bg-gray-600 hover:bg-gray-700`;
        const approveButton = `${commonButton} bg-yellow-600 hover:bg-yellow-700`;
        const publishButton = `${commonButton} bg-green-600 hover:bg-green-700`;
    
        if (permissions.editActas && (acta.status === ActaStatus.Draft || acta.status === ActaStatus.Rejected)) {
            return <button onClick={() => onEdit(acta.id)} className={editButton}>Editar Borrador</button>;
        }
        
        const hasUserApproved = acta.approvals?.some(appr => appr.userId === currentUser.id);
        const isDesignatedApprover = acta.designatedApproverIds?.includes(currentUser.id);
        if (acta.status === ActaStatus.PendingApproval && isDesignatedApprover && !hasUserApproved) {
            return <button onClick={() => setReviewingActa(acta)} className={approveButton}>Revisar</button>;
        }
        
        const allApproved = (acta.designatedApproverIds?.length || 0) > 0 && acta.designatedApproverIds?.every(id => acta.approvals?.some(appr => appr.userId === id));
        if (permissions.editActas && acta.status === ActaStatus.Approved && allApproved) {
            return <button onClick={() => setPublishingActa(acta)} className={publishButton}>Publicar</button>;
        }

        if (acta.status === ActaStatus.Published) {
             return <button onClick={() => onView(acta)} className={viewButton}>Ver Acta</button>;
        }
        
        if (permissions.viewAllActas) {
             return <button onClick={() => onView(acta)} className={viewButton}>Ver</button>;
        }
        
        return <span className="text-gray-500 text-sm">Sin acciones</span>;
    }

    return (
        <div className="animate-fade-in">
            {reviewingActa && currentUser && <ReviewModal acta={reviewingActa} currentUser={currentUser} onClose={() => setReviewingActa(null)} onApprovalAction={onApprovalAction} />}
            {publishingActa && <PublishModal acta={publishingActa} users={users} onClose={() => setPublishingActa(null)} onPublish={onPublish} />}
            {historyActa && <VersionHistoryModal acta={historyActa} onClose={() => setHistoryActa(null)} />}

            {!isPublicMode && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-gray-100">Repositorio de Actas</h2>
                    {permissions.createActas && (
                        <button 
                            onClick={onNewActa}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 flex-shrink-0 w-full sm:w-auto justify-center"
                        >
                            <i className="fas fa-plus"></i>
                            <span className="sm:hidden">Nueva Acta</span>
                            <span className="hidden sm:inline">Crear Acta</span>
                        </button>
                    )}
                </div>
            )}


            {/* Filter Section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="search-input" className="block text-sm font-medium text-gray-300 mb-1">Buscar por Título o Contenido</label>
                        <div className="relative">
                            <input 
                                id="search-input"
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-purple-500"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                        <div className="relative">
                             <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as ActaStatus | 'all')}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500 appearance-none pr-8"
                                aria-label="Filtrar por estado"
                            >
                                <option value="all">Todos los estados</option>
                                {Object.values(ActaStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-filter"></i>
                        {showAdvancedFilters ? 'Ocultar Filtros' : 'Más Filtros'}
                    </button>
                </div>

                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700 animate-fade-in-fast">
                        <div>
                             <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">Desde</label>
                             <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                        </div>
                        <div>
                             <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">Hasta</label>
                             <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500"/>
                        </div>
                        <div>
                             <label htmlFor="creator-filter" className="block text-sm font-medium text-gray-300 mb-1">Creado por</label>
                             <div className="relative">
                                 <select 
                                    id="creator-filter" 
                                    value={creatorFilter} 
                                    onChange={e => setCreatorFilter(e.target.value)} 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-purple-500 appearance-none pr-8"
                                >
                                    <option value="all">Todos los usuarios</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.name}>{user.name}</option>
                                    ))}
                                 </select>
                                 <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Título</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creado Por</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Versión</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredActas.map((acta) => (
                                <tr key={acta.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{acta.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{acta.createdBy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{acta.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusChip(acta)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                                         <button 
                                            onClick={() => acta.version > 1 && setHistoryActa(acta)}
                                            className={`font-semibold ${acta.version > 1 ? 'text-purple-400 hover:underline cursor-pointer' : 'text-gray-400 cursor-default'}`}
                                            title={acta.version > 1 ? "Ver historial de versiones" : "Sin historial"}
                                        >
                                            {acta.version}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Actions acta={acta} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredActas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-folder-open text-4xl mb-2"></i>
                        <p>No se encontraron actas que coincidan con los filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
