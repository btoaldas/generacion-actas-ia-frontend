import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types';

interface AuditLogScreenProps {
    logs: AuditLogEntry[];
    onBack: () => void;
}

const AuditLogScreen: React.FC<AuditLogScreenProps> = ({ logs, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs;
        const lowercasedTerm = searchTerm.toLowerCase();
        return logs.filter(log =>
            log.userName.toLowerCase().includes(lowercasedTerm) ||
            log.action.toLowerCase().includes(lowercasedTerm) ||
            log.details.toLowerCase().includes(lowercasedTerm)
        );
    }, [logs, searchTerm]);

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-EC', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Auditoría y Registros del Sistema
                </h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Aquí se registran cronológicamente todas las acciones importantes realizadas por los usuarios en la plataforma.
            </p>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                 <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar en registros (por usuario, acción o detalle)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-purple-500"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha y Hora</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acción</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{formatTimestamp(log.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{log.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">{log.action}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-file-alt text-4xl mb-2"></i>
                        <p>No se encontraron registros que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogScreen;