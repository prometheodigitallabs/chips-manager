import React from 'react';
import { MapPin, Phone, User, Store, Edit, Trash2, ArrowRight } from 'lucide-react';

export const StoresView = ({ stores, inventory, onAddStore, onSelectStore, onEditStore, onDeleteStore }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* CABECERA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Red de Tiendas</h2>
                    <p className="text-sm text-gray-500">Administra tus puntos de venta y consignación</p>
                </div>
                <button 
                    onClick={onAddStore} 
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center gap-2 font-medium"
                >
                    <Store size={20}/> Nueva Tienda
                </button>
            </div>

            {/* LISTA DE TIENDAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => {
                    // Calculamos cuánto stock tiene esta tienda
                    const stockCount = inventory.filter(i => i.location === store.id).reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
                    
                    return (
                        <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                            
                            {/* BOTONES DE ACCIÓN (Editar / Borrar) */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onEditStore(store); }}
                                    className="p-2 bg-white text-blue-600 rounded-full shadow-sm hover:bg-blue-50 border border-gray-100"
                                    title="Editar datos"
                                >
                                    <Edit size={16}/>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteStore(store.id); }}
                                    className="p-2 bg-white text-red-600 rounded-full shadow-sm hover:bg-red-50 border border-gray-100"
                                    title="Eliminar tienda"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>

                            <div className="p-5 cursor-pointer" onClick={() => onSelectStore(store)}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                                        <Store size={24}/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 leading-tight">{store.name}</h3>
                                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-medium">
                                            {stockCount} productos en stock
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400"/>
                                        <span>{store.location || 'Sin ubicación'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400"/>
                                        <span>{store.manager || 'Sin encargado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400"/>
                                        <span>{store.phone || 'Sin teléfono'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => onSelectStore(store)}
                                className="bg-gray-50 p-3 border-t border-gray-100 text-center text-sm font-bold text-emerald-600 cursor-pointer hover:bg-emerald-50 transition-colors flex justify-center items-center gap-1"
                            >
                                Ver Inventario <ArrowRight size={16}/>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};