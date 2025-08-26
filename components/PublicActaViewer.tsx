
import React, { useRef } from 'react';
import { ActaSummary, GeneratedSegment } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PublicActaViewerProps {
    acta: ActaSummary;
    onExit: () => void;
}

const PublicActaViewer: React.FC<PublicActaViewerProps> = ({ acta, onExit }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const generatedActa = acta.fullActaData?.generatedActa;

     const exportToPDF = () => {
        const input = contentRef.current;
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
                
                pdf.save(`Acta-${acta.title.replace(/\s/g, '_')}.pdf`);
            });
        }
    };
    
    const renderContent = (segment: GeneratedSegment) => {
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
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            Visor de Actas
                        </h1>
                        <p className="text-gray-400 text-sm">GAD Municipal del Cantón Pastaza</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToPDF} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                            <i className="fas fa-file-pdf"></i> Descargar
                        </button>
                        <button onClick={onExit} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            Volver
                        </button>
                    </div>
                </header>
                
                <main ref={contentRef} className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{acta.title}</h2>
                    <p className="text-gray-400 mb-6 border-b border-gray-700 pb-4"><strong>Fecha:</strong> {acta.date} | <strong>Versión:</strong> {acta.version} | <strong>Estado:</strong> {acta.status}</p>
                    
                    <div className="prose prose-invert max-w-none text-gray-300">
                        {generatedActa ? (
                             <>
                                <p><strong>Plantilla:</strong> {generatedActa.templateName}</p>
                                <p><strong>Participantes:</strong> {generatedActa.speakers.join(', ')}</p>
                                <hr className="my-6 border-gray-600"/>
                                {generatedActa.segments.map(segment => (
                                    <div key={segment.id} className="mb-6">
                                        <h3 className="text-xl font-semibold text-purple-400 mb-2">{segment.title}</h3>
                                        <div dangerouslySetInnerHTML={renderContent(segment)} />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p>El contenido completo de esta acta no está disponible para visualización en este momento.</p>
                        )}
                    </div>
                </main>
                 <footer className="mt-8 text-center text-gray-500 text-sm">
                    <p>Documento generado por el Sistema de Actas Automatizadas del GAD Municipal del Cantón Pastaza.</p>
                </footer>
            </div>
        </div>
    );
};

export default PublicActaViewer;
