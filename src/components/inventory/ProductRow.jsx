import React from 'react';
import { Edit2, Truck, AlertTriangle, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button'; 
import { Badge } from '../ui/Badge';

export const ProductRow = ({ item, isStoreView, onEdit, onDelete, onTransfer, onWaste, onSale }) => {
  const avatarText = item.category ? item.category.substring(0, 2) : "??";
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors gap-4">
      <div className="flex items-start gap-3 w-full sm:w-auto">
        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-xs shadow-sm uppercase">{avatarText}</div>
            {item.quantity <= 10 ? <Badge color="red">⚠ {item.quantity}</Badge> : <Badge color="gray">x{item.quantity}</Badge>}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{item.category} - {item.flavor}</h4>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{item.size}</span>
            <span className="flex items-center gap-1"><Calendar size={12}/> {item.date}</span>
            <span className="font-medium text-emerald-600 whitespace-nowrap">${item.price}</span>
            {/* Si NO es tienda, mostramos el costo de producción */}
            {!isStoreView && <span className="font-medium text-gray-400 whitespace-nowrap">(C: ${item.cost})</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 self-end sm:self-auto w-full sm:w-auto justify-end mt-2 sm:mt-0">
        {/* LOGICA DE BOTONES: SI NO ES TIENDA (Almacén) */}
        {!isStoreView ? (
          <>
            <Button variant="danger" size="sm" onClick={() => onDelete && onDelete(item.id)}><Trash2 size={16} /></Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(item)}><Edit2 size={16} /></Button>
            <Button variant="secondary" size="sm" onClick={() => onTransfer && onTransfer(item.id)}><Truck size={16} className="mr-1"/> Pedido</Button>
          </>
        ) : (
          /* SI ES TIENDA: Botones de Vender y Merma */
          <>
            <Button variant="danger" size="sm" onClick={() => onWaste && onWaste(item)}><AlertTriangle size={16} /></Button>
            <Button variant="primary" size="sm" onClick={() => onSale && onSale(item)}><DollarSign size={16} className="mr-1"/> Vender</Button>
          </>
        )}
      </div>
    </div>
  );
};