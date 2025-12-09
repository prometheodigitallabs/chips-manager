import React, { useState, useMemo } from 'react';
import { BarChart3, Printer, TrendingDown, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { printFinancialReport } from '../../utils/printHelpers';
import { MESES } from '../../utils/constants';

export const AnalyticsView = ({ inventory, sales = [], expenses = [], stores = [] }) => {
    // Estado para filtros (Inicia en el mes actual)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- 1. LÓGICA DE FILTRADO Y CÁLCULOS ---
    const { filteredMovements, filteredExpenses, totals } = useMemo(() => {
        // A. Filtrar Movimientos (Ventas y Mermas)
        const movementsInDate = sales.filter(m => {
            if (!m.saleDate && !m.date) return false;
            
            const [y, monthStr] = (m.saleDate || m.date).split('-');
            const itemYear = parseInt(y);
            const itemMonth = parseInt(monthStr) - 1; // 0-11

            const yearMatch = itemYear === parseInt(selectedYear);
            const monthMatch = parseInt(selectedMonth) === -1 
                ? true 
                : itemMonth === parseInt(selectedMonth);

            return yearMatch && monthMatch;
        });

        // B. Filtrar Gastos
        const expensesInDate = expenses.filter(e => {
             if (!e.date) return false;
             const [y, monthStr] = e.date.split('-');
             const itemYear = parseInt(y);
             const itemMonth = parseInt(monthStr) - 1;

             const yearMatch = itemYear === parseInt(selectedYear);
             const monthMatch = parseInt(selectedMonth) === -1 
                ? true 
                : itemMonth === parseInt(selectedMonth);

             return yearMatch && monthMatch;
        });

        // C. Calcular Totales
        const totalSales = movementsInDate
            .filter(m => m.type === 'sale')
            .reduce((acc, curr) => acc + (Number(curr.amount || curr.price) || 0), 0);

        const totalWasteValue = movementsInDate
            .filter(m => m.type === 'waste')
            .reduce((acc, curr) => acc + (Number(curr.cost || curr.amount) || 0), 0);

        const totalExpenses = expensesInDate
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const netProfit = totalSales - totalExpenses - totalWasteValue;

        return {
            filteredMovements: movementsInDate,
            filteredExpenses: expensesInDate,
            totals: { totalSales, totalWasteValue, totalExpenses, netProfit }
        };
    }, [sales, expenses, selectedMonth, selectedYear]);

    // --- 2. MANEJAR EL CLIC EN IMPRIMIR ---
    const handlePrint = () => {
        printFinancialReport({
            monthIndex: parseInt(selectedMonth),
            year: parseInt(selectedYear),
            totalSales: totals.totalSales,
            totalExpenses: totals.totalExpenses,
            totalWasteValue: totals.totalWasteValue,
            netProfit: totals.netProfit,
            filteredExpenses: filteredExpenses,
            filteredMovements: filteredMovements,
            stores: stores
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4">
            
            {/* CONTROLES SUPERIORES */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Reporte Financiero</h2>
                        <p className="text-sm text-gray-500">Resumen de operaciones</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded-lg bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="-1" className="font-bold text-indigo-700">📅 Todo el Año</option>
                        <option disabled>──────────</option>
                        {MESES.map((mes, idx) => (
                            <option key={idx} value={idx}>{mes}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="p-2 border rounded-lg bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        <Printer size={18} />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* --- TARJETAS DE RESUMEN (KPIs) COLORIDAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Ingresos Totales (Verde Esmeralda) */}
                <div className="bg-emerald-50 p-5 rounded-xl shadow-sm border border-emerald-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-emerald-800 font-bold uppercase tracking-wide">Ingresos Totales</p>
                        <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm">
                            <TrendingUp size={20}/>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-700">
                        ${totals.totalSales.toLocaleString()}
                    </h3>
                </div>

                {/* 2. Gastos Operativos (Naranja) */}
                <div className="bg-orange-50 p-5 rounded-xl shadow-sm border border-orange-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-orange-800 font-bold uppercase tracking-wide">Gastos Operativos</p>
                        <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm">
                            <DollarSign size={20}/>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-orange-600">
                        ${totals.totalExpenses.toLocaleString()}
                    </h3>
                </div>

                {/* 3. Valor Mermas (Rojo) */}
                <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-red-800 font-bold uppercase tracking-wide">Valor Mermas</p>
                        <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
                            <TrendingDown size={20}/>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-red-600">
                        ${totals.totalWasteValue.toLocaleString()}
                    </h3>
                </div>

                {/* 4. Utilidad Neta (Azul o Rojo dependiendo si es ganancia o pérdida) */}
                <div className={`p-5 rounded-xl shadow-sm border ${totals.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className={`text-sm font-bold uppercase tracking-wide ${totals.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                            Utilidad Neta
                        </p>
                        <div className={`p-2 bg-white rounded-full shadow-sm ${totals.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            <Wallet size={20}/>
                        </div>
                    </div>
                    <h3 className={`text-3xl font-bold ${totals.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        ${totals.netProfit.toLocaleString()}
                    </h3>
                </div>

            </div>

            {/* TABLAS DE DETALLE (Se mantienen en blanco para legibilidad) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Historial de Movimientos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Historial de Ventas y Mermas</h3>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{filteredMovements.length} regs.</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMovements.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-400">No hay movimientos en este periodo</td></tr>
                                ) : (
                                    filteredMovements.map((m, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600">{m.saleDate || m.date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {m.type === 'sale' ? 'VENTA' : 'MERMA'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-800">
                                                <div className="font-medium">{m.category} - {m.flavor}</div>
                                                <div className="text-xs text-gray-500">{stores.find(s=>s.id === m.storeId)?.name || 'Tienda'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${(Number(m.amount) || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Historial de Gastos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Gastos Operativos</h3>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{filteredExpenses.length} regs.</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                         <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Concepto</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredExpenses.length === 0 ? (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-400">No hay gastos registrados</td></tr>
                                ) : (
                                    filteredExpenses.map((e, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600">{e.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">{e.description}</div>
                                                <div className="text-xs text-gray-500">{e.category}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-orange-600">
                                                -${(Number(e.amount) || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};