import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
    currentStep: Step;
}

const steps = [
    { id: Step.Upload, name: 'Carga y Datos' },
    { id: Step.Configuration, name: 'Configuración' },
    { id: Step.Processing, name: 'Procesando' },
    { id: Step.Verification, name: 'Verificación' },
    { id: Step.Template, name: 'Plantilla' },
    { id: Step.Generating, name: 'Generando Acta' },
    { id: Step.Editor, name: 'Editor' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {step.id < currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-purple-600" />
                                </div>
                                <div
                                    className="relative flex h-8 w-8 items-center justify-center bg-purple-600 rounded-full hover:bg-purple-700"
                                >
                                    <i className="fa-solid fa-check text-white h-5 w-5"></i>
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-300 whitespace-nowrap">{step.name}</span>
                            </>
                        ) : step.id === currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-600" />
                                </div>
                                <div
                                    className="relative flex h-8 w-8 items-center justify-center bg-purple-600 rounded-full border-2 border-purple-600"
                                    aria-current="step"
                                >
                                    <span className="h-2.5 w-2.5 bg-white rounded-full" />
                                </div>
                                 <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-purple-400 whitespace-nowrap">{step.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-600" />
                                </div>
                                <div
                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800 hover:border-gray-400"
                                >
                                    <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-500" />
                                </div>
                                 <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">{step.name}</span>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default StepIndicator;