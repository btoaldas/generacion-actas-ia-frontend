import React from 'react';
import { ActaSummary, ActaStatus, UserRole } from '../types';

interface VersionHistoryModalProps {
    acta: ActaSummary;
    onClose: () => void;
}

const generateMockHistory = (acta: ActaSummary) => {
    const history: { version: number, status: ActaStatus, role: UserRole, date: string, reason?: string }[] = [];
    
    for (let i = 1; i <= acta.version; i++) {
        let newStatus: ActaStatus;
        let role: UserRole;
        let reason: string | undefined = undefined;

        const eventDate = new Date(acta.date);
        eventDate.setDate(eventDate.getDate() + i - 1);

        if (i === 1) {
            newStatus = ActaStatus.Draft;
            role = UserRole.Editor;
        } else if (i === acta.version) {
            newStatus = acta.status;
            role = (acta.status === ActaStatus.Published || acta.status === ActaStatus.Rejected || acta.status === ActaStatus.Approved) ? UserRole.Approver : UserRole.Editor;
            if (acta.status === ActaStatus.Rejected) {
                reason = acta.rejectionReason;
            }
        } else {
            // Simulate an alternating flow of submission and rejection
            if (i % 2 === 0) {
                 newStatus = ActaStatus.PendingApproval;
                 role = UserRole.Editor
            } else {
                 newStatus = ActaStatus.Rejected;
                 role = UserRole.Approver;
                 reason = "Se solicitaron correcciones menores.";
            }
        }
        
        history.push({ version: i, status: newStatus, role, date: eventDate.toISOString().split('T')[0], reason });
    }
    return history.reverse();
}

const getStatusInfo = (status: ActaStatus): { icon: string, color: string, text: string } => {
    switch (status) {
        case ActaStatus.Published:
            return { icon: 'fa-check-circle', color: 'text-green-400', text: 'Publicada' };
        case ActaStatus.Approved:
            return { icon: 'fa-user-check', color: 'text-blue-400', text: 'Aprobada' };
        case ActaStatus.PendingApproval:
            return { icon: 'fa-paper-plane', color: 'text-yellow-400', text: 'Enviada para Aprobación' };
        case ActaStatus.Draft:
            return { icon: 'fa-pencil-alt', color: 'text-gray-400', text: 'Borrador Guardado' };
        case ActaStatus.Rejected:
            return { icon: 'fa-times-circle', color: 'text-red-400', text: 'Rechazada' };
        default:
            return { icon: 'fa-question-circle', color: 'text-gray-500', text: 'Estado Desconocido' };
    }
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ acta, onClose }) => {
    const history = generateMockHistory(acta);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in-fast p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-md w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Historial de Versiones</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <p className="text-sm text-gray-400 mb-6 border-b border-gray-700 pb-4">{acta.title}</p>
                
                <div className="overflow-y-auto pr-2">
                    <ol className="relative border-l border-gray-600">
                        {history.map((item, index) => {
                             const { icon, color, text } = getStatusInfo(item.status);
                             return (
                                <li key={index} className="mb-8 ml-6">
                                    <span className={`absolute flex items-center justify-center w-6 h-6 bg-gray-700 rounded-full -left-3 ring-8 ring-gray-800 ${color}`}>
                                        <i className={`fas ${icon}`}></i>
                                    </span>
                                    <h4 className="flex items-center mb-1 text-md font-semibold text-white">
                                        Versión {item.version} - <span className="text-sm font-medium ml-2">{text}</span>
                                    </h4>
                                    <time className="block mb-2 text-xs font-normal leading-none text-gray-500">{item.date} por {item.role}</time>
                                    {item.reason && (
                                        <p className="text-sm p-2 bg-red-900/50 border border-red-800 rounded-md text-red-200">
                                            <strong>Motivo:</strong> {item.reason}
                                        </p>
                                    )}
                                </li>
                             );
                        })}
                    </ol>
                </div>
                 <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryModal;