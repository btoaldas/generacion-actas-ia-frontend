import React, { useState } from 'react';
import { Template, Segment } from '../types';

interface TemplateManagerProps {
    templates: Template[];
    onSave: (template: Template) => void;
    onDelete: (templateId: string) => void;
    onBack: () => void;
}

const TemplateModal: React.FC<{ 
    template: Template | null; 
    onClose: () => void; 
    onSave: (template: Template) => void;
}> = ({ template, onClose, onSave }) => {
    const [formData, setFormData] = useState<Template>(
        template || { 
            id: `template_${Date.now()}`, 
            name: '', 
            description: '', 
            segments: [{id: `seg_${Date.now()}`, title: '', type: 'ai', prompt: '', staticContent: ''}] 
        }
    );

    const handleMainChange = (field: 'name' | 'description', value: string) => {
        setFormData({ ...formData, [field]: value });
    };
    
    const handleSegmentChange = (index: number, field: keyof Omit<Segment, 'id'>, value: string) => {
        const newSegments = [...formData.segments];
        const newSegment = { ...newSegments[index], [field]: value };

        // Reset the other content type when switching
        if(field === 'type') {
            if(value === 'ai') newSegment.staticContent = '';
            if(value === 'static') newSegment.prompt = '';
        }

        newSegments[index] = newSegment;
        setFormData({ ...formData, segments: newSegments });
    };

    const addSegment = () => {
        setFormData({ ...formData, segments: [...formData.segments, {id: `seg_${Date.now()}`, title: '', type: 'ai', prompt: '', staticContent: ''}] });
    };

    const removeSegment = (index: number) => {
        if (formData.segments.length > 1) {
            setFormData({ ...formData, segments: formData.segments.filter((_, i) => i !== index) });
        }
    };
    
    const handleSave = () => {
        // Basic validation
        if (formData.name.trim() === '' || formData.segments.some(s => s.title.trim() === '' || (s.type === 'ai' && s.prompt.trim() === '') || (s.type === 'static' && s.staticContent?.trim() === ''))) {
            alert("Por favor, completa todos los campos requeridos en la plantilla y sus segmentos.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4">{template ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>
                <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
                    <input type="text" placeholder="Nombre de la Plantilla" value={formData.name} onChange={e => handleMainChange('name', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                    <textarea placeholder="Descripción" value={formData.description} onChange={e => handleMainChange('description', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white h-20 resize-y" />
                    
                    <h4 className="text-lg font-semibold text-gray-300 pt-2">Segmentos del Acta</h4>
                    {formData.segments.map((segment, index) => (
                        <div key={index} className="p-3 bg-gray-900/50 rounded-lg border border-gray-600 space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-400">Segmento {index + 1}</label>
                                {formData.segments.length > 1 && <button onClick={() => removeSegment(index)} className="text-red-400 hover:text-red-300 text-xs"><i className="fas fa-trash-alt"></i> Eliminar</button>}
                            </div>
                            <input type="text" placeholder="Título del Segmento (Ej: Resumen Ejecutivo)" value={segment.title} onChange={e => handleSegmentChange(index, 'title', e.target.value)} className="w-full bg-gray-700 rounded p-2"/>
                            
                             <div>
                                <label className="text-xs font-medium text-gray-400">Tipo de Contenido</label>
                                <select value={segment.type} onChange={e => handleSegmentChange(index, 'type', e.target.value)} className="w-full bg-gray-700 rounded p-2 mt-1">
                                    <option value="ai">Generado por IA</option>
                                    <option value="static">Texto Estático</option>
                                </select>
                             </div>

                             {segment.type === 'ai' ? (
                                <textarea placeholder="Prompt para la IA (Ej: 'Genera un resumen de la reunión...')" value={segment.prompt} onChange={e => handleSegmentChange(index, 'prompt', e.target.value)} className="w-full bg-gray-700 rounded p-2 h-24 resize-y"/>
                             ) : (
                                <textarea placeholder="Escribe aquí el texto fijo para este segmento." value={segment.staticContent} onChange={e => handleSegmentChange(index, 'staticContent', e.target.value)} className="w-full bg-gray-700 rounded p-2 h-24 resize-y"/>
                             )}
                        </div>
                    ))}
                     <button onClick={addSegment} className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                        <i className="fas fa-plus-circle"></i> Añadir Segmento
                    </button>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Guardar Plantilla</button>
                </div>
            </div>
        </div>
    );
};


const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, onSave, onDelete, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };
    
    const handleDelete = (templateId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta plantilla?")) {
            onDelete(templateId);
        }
    };

    return (
        <div className="animate-fade-in">
            {isModalOpen && <TemplateModal template={editingTemplate} onClose={() => setIsModalOpen(false)} onSave={onSave} />}
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Gestión de Plantillas
                </h2>
                <button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <i className="fas fa-plus"></i> Nueva Plantilla
                </button>
            </div>
             <p className="text-gray-400 mb-8 max-w-3xl">
                Crea, edita y administra las plantillas de actas que estarán disponibles para todos los generadores. Cada plantilla define la estructura del acta final.
            </p>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-400 mb-4 h-16 overflow-hidden">{template.description}</p>
                            <div className="border-t border-gray-700 pt-3">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Segmentos: {template.segments.length}</h4>
                                <ul className="text-xs text-gray-400 list-disc list-inside">
                                    {template.segments.slice(0, 3).map(s => <li key={s.id}>{s.title} ({s.type === 'ai' ? 'IA' : 'Estático'})</li>)}
                                    {template.segments.length > 3 && <li>...y más</li>}
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => handleDelete(template.id)} className="p-2 text-gray-400 hover:text-red-500 text-sm"><i className="fas fa-trash-alt"></i></button>
                            <button onClick={() => handleEdit(template)} className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Editar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateManager;