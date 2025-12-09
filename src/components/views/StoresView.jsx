import React from 'react';
import { MapPin, Phone, User, Plus, Store, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card'; // Usamos tu componente Card existente
import { Button } from '../ui/Button';

export const StoresView = ({ stores, inventory, onAddStore, onSelectStore }) => {
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Red de Tiendas</h2>
           <p className="text-sm text-gray-500">Gestiona tus puntos de venta</p>
        </div>
        <Button onClick={onAddStore}>
            <Plus size={18} /> Nueva Tienda
        </Button>
      </div>

      {/* Lista de Tiendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map(store => {
          // Calculamos cuánto stock tiene esta tienda sumando lo que hay en el inventario con su location ID
          const stockCount = inventory.filter(i => i.location === store.id).reduce((acc, curr) => acc + curr.quantity, 0);
          
          return (
            <div key={store.id} onClick={() => onSelectStore(store)} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-all hover:border-emerald-400 group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700"><Store size={24}/></div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700">{store.name}</h3>
                      <p className="text-gray-500 flex items-center gap-1 text-sm mt-1"><MapPin size={14}/> {store.location}</p>
                      
                      {/* Info extra */}
                      {(store.manager || store.phone) && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                            {store.manager && <div className="flex items-center gap-1"><User size={12}/> {store.manager}</div>}
                            {store.phone && <div className="flex items-center gap-1 mt-0.5"><Phone size={12}/> {store.phone}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded text-sm">📦 {stockCount} en stock</span>
                    <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">Ver Inventario <ArrowRight size={16}/></span>
                </div>
            </div>
          );
        })}

        {stores.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
            <p>No tienes tiendas registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};