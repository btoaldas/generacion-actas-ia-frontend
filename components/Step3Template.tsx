import React, { useState, useEffect } from 'react';
import { Template } from '../types';

interface Step3TemplateProps {
    templates: Template[];
    onNext: (template: Template) => void;
}

const Step3Template: React.FC<Step3TemplateProps> = ({ templates, onNext }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates.length > 0 ? templates[0].id : '');

    useEffect(() => {
        if (!selectedTemplateId && templates.length > 0) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [templates, selectedTemplateId]);

    const handleNext = () => {
        const selected = templates.find(t => t.id === selectedTemplateId);
        if (selected) {
            onNext(selected);
        }
    };

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    if (templates.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">No hay plantillas disponibles</h2>
                <p className="text-gray-400">Un administrador debe crear al menos una plantilla para continuar.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Paso 5: Elige una Plantilla para tu Acta</h2>
            <p className="text-gray-400 mb-8 text-center max-w-2xl">
                Cada plantilla genera diferentes secciones en el acta final, adaptadas a distintos tipos de reuniones. Elige la que mejor se adapte a tus necesidades.
            </p>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="w-full space-y-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplateId(template.id)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                                selectedTemplateId === template.id
                                    ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20'
                                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${ selectedTemplateId === template.id ? 'bg-purple-500' : 'bg-gray-600'}`}>
                                    {selectedTemplateId === template.id ? 
                                      <i className="fa-solid fa-check-circle text-white"></i> : 
                                      <i className="fa-solid fa-file-alt text-gray-300"></i>}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-white">{template.name}</h3>
                                    <p className="text-sm text-gray-400">{template.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedTemplate && (
                    <div className="w-full mt-0 p-5 bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in sticky top-20">
                        <h3 className="text-lg font-bold text-purple-400 mb-4">Vista Previa de Segmentos</h3>
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedTemplate.segments.map(segment => (
                                <li key={segment.id} className="flex items-start p-3 bg-gray-700/50 rounded-md">
                                    <i className={`fas ${segment.type === 'ai' ? 'fa-robot text-cyan-400' : 'fa-file-alt text-gray-400'} mt-1 mr-4`}></i>
                                    <div>
                                        <p className="font-semibold text-white">{segment.title}</p>
                                        <p className="text-xs text-gray-400 italic">
                                            {segment.type === 'ai' ? `Contenido generado por IA.` : 'Contenido estático.'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                onClick={handleNext}
                disabled={!selectedTemplateId}
                className="mt-10 w-full max-w-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
            >
                Generar Acta con esta Plantilla
            </button>
        </div>
    );
};

export default Step3Template;