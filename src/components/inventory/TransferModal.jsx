import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../ui/Button';

export const TransferModal = ({ isOpen, onClose, product, stores, onConfirm }) => {
  const [storeId, setStoreId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (product) {
        setPrice(product.price);
        setQuantity("");
        setStoreId("");
    }
  }, [product]);

  const handleSubmit = () => {
    if (!storeId || !quantity || !price) return;
    onConfirm(product, storeId, parseInt(quantity), parseFloat(price));
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Transferir: ${product.flavor}`}>
       <div className="space-y-4 pt-2">
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
             Stock en almacén: <strong>{product.quantity}</strong>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Enviar a:</label>
             <select className="w-full p-2 border rounded-lg bg-white" value={storeId} onChange={e => setStoreId(e.target.value)}>
                <option value="">Selecciona tienda...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input type="number" className="w-full p-2 border rounded-lg" value={quantity} onChange={e => setQuantity(e.target.value)} max={product.quantity} />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta ($)</label>
                <input type="number" className="w-full p-2 border rounded-lg" value={price} onChange={e => setPrice(e.target.value)} />
             </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
             <Button variant="secondary" onClick={onClose}>Cancelar</Button>
             <Button onClick={handleSubmit} disabled={!storeId || !quantity}>Confirmar</Button>
          </div>
       </div>
    </Modal>
  );
};