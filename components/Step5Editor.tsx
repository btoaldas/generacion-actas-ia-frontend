import React, { useRef } from 'react';
import { GeneratedActa, SystemConfig } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Step5EditorProps {
    generatedActa: GeneratedActa;
    systemConfig: SystemConfig;
    onSaveDraft: () => void;
    onSubmitForApproval: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Step5Editor: React.FC<Step5EditorProps> = ({ generatedActa, systemConfig, onSaveDraft, onSubmitForApproval, addToast }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        contentRef.current?.focus();
    };

    const exportToPDF = () => {
        const input = editorRef.current;
        if (input) {
            html2canvas(input, {
                scale: 2,
                backgroundColor: '#111827',
                useCORS: true,
                windowWidth: input.scrollWidth,
                windowHeight: input.scrollHeight,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasAspectRatio = canvas.width / canvas.height;
                const imgHeight = pdfWidth / canvasAspectRatio;
                
                let heightLeft = imgHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = position - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
                
                pdf.save(`Acta-${generatedActa.title.replace(/\s/g, '_')}.pdf`);
                addToast('Acta exportada a PDF correctamente.', 'success');
            }).catch(err => {
                 addToast('Error al exportar a PDF.', 'error');
                 console.error(err);
            });
        }
    };
    
    const renderContent = (segment: typeof generatedActa.segments[0]) => {
        if (segment.type === 'static') {
             return { __html: segment.content.replace(/\n/g, '<br />') };
        }
        // AI content with Markdown
        let html = segment.content
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^- (.*)/gm, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>')
          .replace(/\n/g, '<br />');
        return { __html: html };
    };

    return (
        <div className="w-full animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Paso 7: Edita y Exporta tu Acta</h2>
            
             <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10 mb-4 p-2 rounded-lg border border-gray-700 flex justify-center gap-1 sm:gap-2">
                <button title="Negrita" onClick={() => applyFormat('bold')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-bold"></i></button>
                <button title="Cursiva" onClick={() => applyFormat('italic')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-italic"></i></button>
                <button title="Subrayado" onClick={() => applyFormat('underline')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-underline"></i></button>
                <button title="Título" onClick={() => applyFormat('formatBlock', '<h2>')} className="w-10 h-10 hover:bg-gray-700 rounded-md font-bold">H2</button>
                <button title="Cita" onClick={() => applyFormat('formatBlock', '<blockquote>')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-quote-left"></i></button>
                <button title="Lista" onClick={() => applyFormat('insertUnorderedList')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-list-ul"></i></button>
                <button title="Alinear Izquierda" onClick={() => applyFormat('justifyLeft')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-align-left"></i></button>
                <button title="Alinear Centro" onClick={() => applyFormat('justifyCenter')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-align-center"></i></button>
                <button title="Alinear Derecha" onClick={() => applyFormat('justifyRight')} className="w-10 h-10 hover:bg-gray-700 rounded-md"><i className="fas fa-align-right"></i></button>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 sm:p-8" ref={editorRef}>
                <div className="flex justify-between items-start mb-8">
                     <div className="flex-grow">
                        <h1 className="text-3xl font-bold border-b border-gray-600 pb-2 mb-4 text-white w-full">{generatedActa.title}</h1>
                        <p className="text-sm text-gray-400">{systemConfig.institutionName}</p>
                     </div>
                     <div className="w-24 h-24 bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-500 text-sm text-center ml-8 rounded-md overflow-hidden">
                        {systemConfig.institutionLogo ? <img src={systemConfig.institutionLogo} alt="Logo Institucional" className="h-full w-full object-contain"/> : <span>Logo</span>}
                     </div>
                </div>

                <div 
                    ref={contentRef} 
                    contentEditable={true} 
                    suppressContentEditableWarning={true} 
                    className="prose prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md p-6 sm:p-8 bg-gray-800 text-gray-200 border border-gray-700"
                    style={{ minHeight: '500px' }}
                >
                    <p><strong>Plantilla:</strong> {generatedActa.templateName}</p>
                    <p><strong>Fecha:</strong> {generatedActa.date}</p>
                    <p><strong>Participantes:</strong> {generatedActa.speakers.join(', ')}</p>
                    <hr className="my-6 border-gray-600"/>
                    {generatedActa.segments.map(segment => (
                        <div key={segment.id} className="mb-6">
                            <h2 className="text-xl font-semibold text-purple-400 mb-2">{segment.title}</h2>
                            <div dangerouslySetInnerHTML={renderContent(segment)} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={onSaveDraft} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                    <i className="fas fa-save"></i> Guardar Borrador y Salir
                </button>
                 <button onClick={onSubmitForApproval} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                    <i className="fas fa-paper-plane"></i> Enviar para Aprobación
                </button>
                 <button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                    <i className="fas fa-file-pdf"></i> Exportar a PDF
                </button>
            </div>
        </div>
    );
};

export default Step5Editor;