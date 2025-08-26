import React from 'react';
import { AdminView } from '../types';

interface AdministrationScreenProps {
    onNavigateTo: (view: AdminView) => void;
}

const AdministrationScreen: React.FC<AdministrationScreenProps> = ({ onNavigateTo }) => {
    
    const adminCards = [
        { view: 'generalConfig', title: "Configuración General", icon: "fa-cogs", description: "Ajustar nombre, logo y seguridad de la institución.", comingSoon: false },
        { view: 'aiConfig', title: "Configuración de IA", icon: "fa-robot", description: "Gestionar los modelos de IA para transcripción y generación de actas.", comingSoon: false },
        { view: 'smtpConfig', title: "Configuración SMTP", icon: "fa-envelope", description: "Configurar el servidor de correo para notificaciones.", comingSoon: false },
        { view: 'templates', title: "Gestión de Plantillas", icon: "fa-file-alt", description: "Crear, editar y administrar las plantillas de actas y sus prompts.", comingSoon: false },
        { view: 'users', title: "Gestión de Usuarios", icon: "fa-users-cog", description: "Añadir, eliminar y modificar usuarios y sus roles en el sistema.", comingSoon: false },
        { view: 'metrics', title: "Dashboard de Métricas", icon: "fa-chart-line", description: "Visualizar estadísticas de uso, costos y rendimiento.", comingSoon: false },
        { view: 'auditLog', title: "Auditoría y Registros", icon: "fa-history", description: "Revisar los registros de todas las acciones realizadas en la plataforma.", comingSoon: false },
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100">Panel de Administración</h2>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Desde aquí puedes configurar y parametrizar todos los aspectos de la plataforma SAAP, desde los modelos de IA hasta la gestión de usuarios y plantillas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map(card => (
                    <div key={card.title} className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col hover:border-purple-500 transition-colors relative">
                        {card.comingSoon && <span className="absolute top-3 right-3 text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded-full">Próximamente</span>}
                        <div className="flex items-center mb-4">
                            <i className={`fas ${card.icon} text-2xl text-purple-400 mr-4`}></i>
                            <h3 className="text-lg font-bold text-white">{card.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm flex-grow">{card.description}</p>
                        <button 
                            onClick={() => onNavigateTo(card.view as AdminView)}
                            className={`mt-6 text-sm font-semibold py-2 px-4 rounded-md w-full ${card.comingSoon ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`} 
                            disabled={card.comingSoon}
                        >
                            {card.comingSoon ? 'No Disponible' : 'Gestionar'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdministrationScreen;
