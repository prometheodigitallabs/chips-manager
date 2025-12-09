import React, { useState, useMemo } from 'react';
import { Search, Package, Plus, ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProductRow } from '../inventory/ProductRow';

export const WarehouseView = ({ inventory, onAddProduct, onEditProduct, onDeleteProduct, onTransfer }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // 1. FILTRAR Y AGRUPAR EL INVENTARIO
    const groupedInventory = useMemo(() => {
        // A. Primero filtramos solo lo que está en 'warehouse' y coincide con la búsqueda
        const filtered = inventory.filter(item => 
            item.location === 'warehouse' && 
            (item.flavor.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // B. Agrupamos por "Categoría + Sabor + Tamaño"
        const groups = {};

        filtered.forEach(item => {
            // Creamos una clave única para identificar productos iguales
            const key = `${item.category}-${item.flavor}-${item.size}`;

            if (!groups[key]) {
                groups[key] = {
                    key: key,
                    category: item.category,
                    flavor: item.flavor,
                    size: item.size,
                    totalQuantity: 0,
                    avgCost: 0,
                    lots: [] // Aquí guardaremos los lotes individuales
                };
            }

            // Sumamos al total del grupo
            groups[key].totalQuantity += parseInt(item.quantity);
            groups[key].lots.push(item);
        });

        // C. Ordenamos los lotes dentro de cada grupo por fecha (El más viejo primero - FIFO)
        Object.values(groups).forEach(group => {
            group.lots.sort((a, b) => new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp));
        });

        return Object.values(groups);
    }, [inventory, searchTerm]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* BARRA DE BÚSQUEDA Y BOTÓN AGREGAR */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        placeholder="Buscar por sabor o categoría..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={onAddProduct} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                    <Plus size={20} className="mr-1"/> Nuevo Producto
                </Button>
            </div>

            {/* LISTA DE GRUPOS DE PRODUCTOS */}
            <div className="space-y-4">
                {groupedInventory.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Almacén vacío</h3>
                        <p className="text-gray-500">No hay productos que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    groupedInventory.map((group) => (
                        <ProductGroupCard 
                            key={group.key} 
                            group={group} 
                            onEdit={onEditProduct}
                            onDelete={onDeleteProduct}
                            onTransfer={onTransfer}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE INTERNO: TARJETA DE GRUPO ---
const ProductGroupCard = ({ group, onEdit, onDelete, onTransfer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Color de borde según la categoría (visual aid)
    const getBorderColor = (cat) => {
        if(cat.includes('Papas')) return 'border-l-emerald-500';
        if(cat.includes('Salsas')) return 'border-l-orange-500';
        return 'border-l-blue-500';
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-emerald-100' : ''}`}>
            
            {/* CABECERA DEL GRUPO (RESUMEN) */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getBorderColor(group.category)}`}
            >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`p-3 rounded-full ${isExpanded ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{group.category} - {group.flavor}</h3>
                        <p className="text-sm text-gray-500">{group.size} • <span className="font-medium">{group.lots.length} Lotes disponibles</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stock Total</p>
                        <p className="text-2xl font-bold text-gray-800">{group.totalQuantity} <span className="text-sm font-normal text-gray-500">pzas</span></p>
                    </div>
                    <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
                    </div>
                </div>
            </div>

            {/* DETALLE DESPLEGABLE (LOTES INDIVIDUALES) */}
            {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-3 sm:p-5 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <Calendar size={14}/>
                        <span>Lotes ordenados por antigüedad (FIFO)</span>
                    </div>
                    
                    <div className="space-y-3">
                        {group.lots.map((lot, index) => (
                            <div key={lot.id} className="relative">
                                {/* Etiqueta de "Más viejo" para el primer lote */}
                                {index === 0 && (
                                    <span className="absolute -top-2 -left-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 z-10 flex items-center gap-1">
                                        <AlertCircle size={10}/> Prioridad venta
                                    </span>
                                )}
                                
                                {/* Reutilizamos tu ProductRow existente para mantener la funcionalidad */}
                                <ProductRow 
                                    item={lot} 
                                    onEdit={() => onEdit(lot)} 
                                    onDelete={() => onDelete(lot.id)} 
                                    onTransfer={() => onTransfer(lot.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};