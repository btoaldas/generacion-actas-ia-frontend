import React, { useMemo } from 'react';
import { ActaSummary, ActaStatus } from '../types';

interface MetricsDashboardProps {
    onBack: () => void;
    actas: ActaSummary[];
}

// Mock Data for values that can't be calculated from props
const staticKpiData = {
    avgProcessingTime: { value: "3m 45s", change: "-5%", changeType: "positive" },
    estimatedCost: { value: "$45.80", change: "+8%", changeType: "negative" },
};

const modelUsageData = [
    { name: 'Whisper (preciso)', value: 75, color: 'bg-purple-500' },
    { name: 'Whisper (rápido)', value: 25, color: 'bg-purple-700' },
];


const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onBack, actas }) => {
    
    const calculatedMetrics = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const actasLast30Days = actas.filter(a => new Date(a.date) >= thirtyDaysAgo);

        const publishedCount = actas.filter(a => a.status === ActaStatus.Published).length;
        const rejectedCount = actas.filter(a => a.status === ActaStatus.Rejected).length;
        const totalReviewed = publishedCount + rejectedCount;
        const approvalRate = totalReviewed > 0 ? Math.round((publishedCount / totalReviewed) * 100) : 100;
        
        // Bar chart data for the last 6 months
        const actasPerMonth = Array(6).fill(0).map((_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            return {
                month: d.toLocaleString('es-ES', { month: 'short' }),
                year: d.getFullYear(),
                count: 0
            };
        });

        actas.forEach(acta => {
            const actaDate = new Date(acta.date);
            const monthIndex = actasPerMonth.findIndex(m => m.month.toLowerCase() === actaDate.toLocaleString('es-ES', { month: 'short' }).toLowerCase() && m.year === actaDate.getFullYear());
            if (monthIndex > -1) {
                actasPerMonth[monthIndex].count++;
            }
        });


        return {
            actasGenerated30d: actasLast30Days.length,
            approvalRate: `${approvalRate}%`,
            actasPerMonthData: actasPerMonth,
        };

    }, [actas]);

    const kpiData = [
        { title: "Actas Generadas (Últimos 30d)", value: calculatedMetrics.actasGenerated30d.toString(), change: "+12%", changeType: "positive" },
        { title: "Tiempo Prom. de Procesamiento", value: staticKpiData.avgProcessingTime.value, change: staticKpiData.avgProcessingTime.change, changeType: "positive" as "positive" | "negative" },
        { title: "Tasa de Aprobación", value: calculatedMetrics.approvalRate, change: "+2%", changeType: "positive" },
        { title: "Costo Estimado (Mes Actual)", value: staticKpiData.estimatedCost.value, change: staticKpiData.estimatedCost.change, changeType: "negative" as "positive" | "negative" },
    ];
    
    const maxActas = Math.max(...calculatedMetrics.actasPerMonthData.map(d => d.count), 1);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                    Dashboard de Métricas
                </h2>
                <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                    <i className="fas fa-calendar-alt text-gray-400"></i>
                    <select className="bg-transparent text-white text-sm focus:outline-none">
                        <option>Últimos 30 días</option>
                        <option>Últimos 90 días</option>
                        <option>Este año</option>
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                        <p className="text-sm text-gray-400">{kpi.title}</p>
                        <div className="flex items-end justify-between mt-2">
                            <p className="text-3xl font-bold text-white">{kpi.value}</p>
                            <span className={`text-sm font-semibold ${kpi.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                {kpi.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Actas Generadas por Mes</h3>
                    <div className="flex items-end justify-between h-64 pt-4">
                        {calculatedMetrics.actasPerMonthData.map(data => (
                            <div key={data.month} className="flex flex-col items-center w-full h-full">
                                <div className="text-xs text-white mb-1">{data.count}</div>
                                <div className="flex-grow w-1/2 bg-purple-600 hover:bg-purple-500 rounded-t-md transition-all relative" style={{ height: `${(data.count / maxActas) * 100}%` }} title={`${data.count} actas`}></div>
                                <p className="text-xs text-gray-400 mt-2 capitalize">{data.month}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de Modelos de Transcripción</h3>
                    <div className="flex flex-col gap-4 mt-6">
                        <div className="w-full h-8 flex rounded-full overflow-hidden">
                           {modelUsageData.map(model => (
                                <div key={model.name} className={model.color} style={{ width: `${model.value}%`}} title={`${model.name}: ${model.value}%`}></div>
                           ))}
                        </div>
                        <ul className="text-sm text-gray-300 space-y-2">
                             {modelUsageData.map(model => (
                                <li key={model.name} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${model.color}`}></span>
                                        {model.name}
                                    </span>
                                    <span className="font-semibold">{model.value}%</span>
                                </li>
                           ))}
                        </ul>
                         <p className="text-xs text-gray-500 italic mt-4">Nota: Estos datos son ilustrativos y se basan en una distribución de uso simulada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;