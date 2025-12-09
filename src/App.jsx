import React, { useState } from 'react';
import { Package, BarChart3, Store, Wallet, MapPin, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// 1. Configuración y Hooks
import { db } from './config/firebase';
import { useAuth } from './hooks/useAuth';
import { useInventoryData } from './hooks/useInventoryData';

// 2. Componentes UI
import { Button } from './components/ui/Button';
import { Modal } from './components/shared/Modal';
import { Toast } from './components/shared/Toast';

// 3. Vistas
import { WarehouseView } from './components/views/WarehouseView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { StoresView } from './components/views/StoresView';
import { ExpensesView } from './components/views/ExpensesView';

// 4. Componentes Inventario
import { TransferModal } from './components/inventory/TransferModal';
import { ProductRow } from './components/inventory/ProductRow';

// 5. Utilidades
import { CATEGORIAS_BASE } from './utils/constants';
import { printTicket } from './utils/printHelpers';

export default function HealthyChipsApp() {
  const { user } = useAuth();
  const { inventory, sales, expenses, stores, loading } = useInventoryData(user);
  
  const [activeTab, setActiveTab] = useState('warehouse');
  const [selectedStore, setSelectedStore] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // --- MODALES GENERALES ---
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isStoreModalOpen, setStoreModalOpen] = useState(false);
  const [transferData, setTransferData] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null); 
  
  // --- ESTADOS PARA MODALES DE TIENDA ---
  const [saleItem, setSaleItem] = useState(null);
  const [wasteItem, setWasteItem] = useState(null);
  const [wasteReason, setWasteReason] = useState("");
  
  // --- NUEVO: ESTADO PARA EDITAR PRODUCTO ---
  const [editingProduct, setEditingProduct] = useState(null);

  // --- FORMULARIOS ---
  const [newProduct, setNewProduct] = useState({ category: "", flavor: "", size: "", price: "", cost: "", quantity: "" });
  const [newStore, setNewStore] = useState({ name: "", location: "", manager: "", phone: "" });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 1. LÓGICA DE TIENDAS ---
  const handleAddStore = async () => {
    if (!newStore.name) { showToast("Nombre obligatorio", 'error'); return; }
    try {
        await addDoc(collection(db, 'stores'), newStore);
        showToast("Tienda creada");
        setStoreModalOpen(false);
        setNewStore({ name: "", location: "", manager: "", phone: "" });
    } catch (e) { showToast("Error al crear tienda", 'error'); }
  };

  // --- 2. LÓGICA DE TRANSFERENCIA ---
  const handleTransfer = (product, storeId, quantity, price) => {
    if (quantity > product.quantity) { showToast("Stock insuficiente en almacén", 'error'); return; }
    const targetStore = stores.find(s => s.id === storeId);
    setConfirmationData({ product, store: targetStore, storeId, quantity: parseInt(quantity), price: parseFloat(price) });
    setTransferData(null);
  };

  const processTransferConfirm = async () => {
    if (!confirmationData) return;
    const { product, storeId, quantity, price, store } = confirmationData;
    try {
        const productRef = doc(db, 'inventory', product.id);
        if (product.quantity === quantity) await updateDoc(productRef, { quantity: 0 }); 
        else await updateDoc(productRef, { quantity: product.quantity - quantity });

        await addDoc(collection(db, 'inventory'), {
            category: product.category, flavor: product.flavor, size: product.size,
            cost: product.cost, price: price, quantity: quantity,
            location: storeId, 
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        });

        await addDoc(collection(db, 'transfers'), {
            productName: `${product.category} ${product.flavor}`,
            storeId: storeId, quantity, price, date: new Date().toISOString().split('T')[0]
        });

        const orderDataForTicket = [{ amount: quantity, productName: `${product.category} ${product.flavor} (${product.size})`, price: price }];
        printTicket(store, orderDataForTicket, quantity, quantity * price);

        showToast("Pedido confirmado y Ticket generado");
        setConfirmationData(null);
    } catch (e) { console.error(e); showToast("Error al procesar", 'error'); }
  };

  // --- 3. LÓGICA DE VENTA (TIENDA) ---
  const openSaleModal = (item) => setSaleItem(item);

  const processSaleConfirm = async () => {
    if (!saleItem) return;
    try {
        const docRef = doc(db, 'inventory', saleItem.id);
        if (saleItem.quantity > 1) await updateDoc(docRef, { quantity: saleItem.quantity - 1 });
        else await deleteDoc(docRef);

        await addDoc(collection(db, 'movements'), {
            category: saleItem.category, flavor: saleItem.flavor, size: saleItem.size,
            price: saleItem.price, cost: saleItem.cost || 0, quantity: 1,
            saleDate: new Date().toISOString().split('T')[0],
            type: 'sale', amount: saleItem.price, storeId: saleItem.location
        });
        showToast(`✅ Venta registrada: $${saleItem.price}`);
        setSaleItem(null); 
    } catch (e) { showToast("Error al registrar venta", 'error'); }
  };

  // --- 4. LÓGICA DE MERMA (TIENDA) ---
  const openWasteModal = (item) => {
      setWasteItem(item);
      setWasteReason(""); 
  };

  const processWasteConfirm = async () => {
    if (!wasteItem || !wasteReason.trim()) { showToast("Debes escribir un motivo", 'error'); return; }
    try {
        const docRef = doc(db, 'inventory', wasteItem.id);
        if (wasteItem.quantity > 1) await updateDoc(docRef, { quantity: wasteItem.quantity - 1 });
        else await deleteDoc(docRef);

        await addDoc(collection(db, 'movements'), {
            category: wasteItem.category, flavor: wasteItem.flavor, size: wasteItem.size,
            price: wasteItem.price, cost: wasteItem.cost || 0, quantity: 1,
            saleDate: new Date().toISOString().split('T')[0],
            type: 'waste', reason: wasteReason, amount: wasteItem.cost || 0, storeId: wasteItem.location
        });
        showToast("⚠️ Merma reportada", 'success'); 
        setWasteItem(null); 
    } catch (e) { showToast("Error al reportar merma", 'error'); }
  };

  // --- 5. GASTOS ---
  const handleSaveExpense = async (data) => {
      try { await addDoc(collection(db, 'expenses'), { ...data, date: new Date().toISOString().split('T')[0] }); showToast("Gasto registrado"); } catch (e) { showToast("Error", 'error'); }
  };
  const handleDeleteExpense = async (id) => {
      if(!window.confirm("¿Eliminar?")) return;
      try { await deleteDoc(doc(db, 'expenses', id)); showToast("Eliminado"); } catch(e){}
  };

  // --- 6. PRODUCTOS ALMACÉN (NUEVO, BORRAR Y EDITAR) ---
  
  const handleAddProduct = async () => { 
    if (!newProduct.category || !newProduct.flavor || !newProduct.price) { showToast("Datos faltantes", 'error'); return; }
    try {
      await addDoc(collection(db, 'inventory'), {
        ...newProduct, quantity: parseInt(newProduct.quantity), price: parseFloat(newProduct.price), cost: parseFloat(newProduct.cost),
        date: new Date().toISOString().split('T')[0], location: "warehouse", timestamp: new Date().toISOString()
      });
      showToast("Producto guardado"); setProductModalOpen(false); setNewProduct({ category: "", flavor: "", size: "", price: "", cost: "", quantity: "" }); 
    } catch (e) { showToast("Error", 'error'); }
  };

  // Lógica de "Basurero" modificada: Resta 1 por 1
  const handleDeleteProduct = async (id) => {
      const item = inventory.find(i => i.id === id);
      if (!item) return;

      if (item.quantity > 1) {
          // Si hay más de 1, restamos
          const confirmReduce = window.confirm(`¿Restar 1 unidad de ${item.flavor}?\nQuedarán: ${item.quantity - 1}`);
          if (!confirmReduce) return;

          try {
              await updateDoc(doc(db, 'inventory', id), { quantity: item.quantity - 1 });
              showToast("Stock reducido (-1)");
          } catch(e) { showToast("Error al reducir stock", 'error'); }
      } else {
          // Si solo queda 1, eliminamos
          const confirmDelete = window.confirm(`Solo queda 1 unidad.\n¿Eliminar ${item.flavor} permanentemente del almacén?`);
          if (!confirmDelete) return;

          try {
              await deleteDoc(doc(db, 'inventory', id));
              showToast("Producto eliminado");
          } catch(e) { showToast("Error al eliminar", 'error'); }
      }
  };

  // Lógica de "Lápiz": Abrir modal de edición
  const handleEditProduct = (item) => {
      setEditingProduct({ ...item }); // Copiamos los datos al estado de edición
  };

  const handleUpdateProduct = async () => {
      if (!editingProduct) return;
      try {
          const docRef = doc(db, 'inventory', editingProduct.id);
          await updateDoc(docRef, {
              category: editingProduct.category,
              flavor: editingProduct.flavor,
              size: editingProduct.size,
              quantity: parseInt(editingProduct.quantity),
              cost: parseFloat(editingProduct.cost),
              price: parseFloat(editingProduct.price)
          });
          showToast("Producto actualizado");
          setEditingProduct(null); // Cerrar modal
      } catch(e) { showToast("Error al actualizar", 'error'); }
  };

  if (!user && loading) return <div className="h-screen flex items-center justify-center text-emerald-600 font-bold">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white p-4 sticky top-0 z-20 shadow-md">
         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
               <div className="bg-white/20 p-2 rounded-full"><Package className="text-white" size={20}/></div>
               <div><h1 className="font-bold text-lg leading-tight">ChipsManager</h1><p className="text-emerald-200 text-xs">Sistema de Inventario</p></div>
            </div>
            <nav className="flex bg-emerald-800/50 p-1 rounded-lg w-full sm:w-auto justify-between">
                <button onClick={() => {setActiveTab('warehouse'); setSelectedStore(null);}} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeTab === 'warehouse' ? 'bg-white text-emerald-800 font-medium' : 'text-emerald-100'}`}><Store size={16}/> Almacén</button>
                <button onClick={() => {setActiveTab('stores'); setSelectedStore(null);}} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeTab === 'stores' ? 'bg-white text-emerald-800 font-medium' : 'text-emerald-100'}`}><Package size={16}/> Tiendas</button>
                <button onClick={() => {setActiveTab('expenses'); setSelectedStore(null);}} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-white text-emerald-800 font-medium' : 'text-emerald-100'}`}><Wallet size={16}/> Gastos</button>
                <button onClick={() => {setActiveTab('analytics'); setSelectedStore(null);}} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white text-emerald-800 font-medium' : 'text-emerald-100'}`}><BarChart3 size={16}/> Reportes</button>
            </nav>
         </div>
      </header>

      <main className="mt-6">
        {/* VISTA ALMACÉN (Ahora pasamos handleEditProduct) */}
        {activeTab === 'warehouse' && (
            <WarehouseView 
                inventory={inventory} 
                onAddProduct={() => setProductModalOpen(true)} 
                onEditProduct={handleEditProduct} // <--- AHORA SÍ FUNCIONA
                onDeleteProduct={handleDeleteProduct} 
                onTransfer={(id) => {const item = inventory.find(i => i.id === id); setTransferData(item);}} 
            />
        )}

        {/* VISTAS TIENDAS Y DEMÁS... */}
        {activeTab === 'stores' && !selectedStore && (
            <StoresView stores={stores} inventory={inventory} onAddStore={() => setStoreModalOpen(true)} onSelectStore={setSelectedStore} />
        )}

        {activeTab === 'stores' && selectedStore && (
            <div className="p-4 max-w-5xl mx-auto space-y-4 animate-in slide-in-from-right-4">
                <button onClick={() => setSelectedStore(null)} className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-bold mb-2"><ArrowLeft size={18}/> Volver a Tiendas</button>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4">
                    <h2 className="text-2xl font-bold text-emerald-800">{selectedStore.name}</h2>
                    <p className="text-gray-500 flex gap-1 items-center text-sm"><MapPin size={14}/> {selectedStore.location}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-3 bg-gray-100 border-b text-xs font-bold text-gray-500 uppercase">Inventario en Piso</div>
                    {inventory.filter(i => i.location === selectedStore.id).length === 0 ? <div className="p-8 text-center text-gray-400">Sin stock. Haz un pedido desde el Almacén.</div> : 
                      inventory.filter(i => i.location === selectedStore.id).map(item => (
                        <ProductRow key={item.id} item={item} isStoreView={true} onSale={() => openSaleModal(item)} onWaste={() => openWasteModal(item)} />
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'expenses' && <ExpensesView expenses={expenses} onSaveExpense={handleSaveExpense} onDeleteExpense={handleDeleteExpense} />}
        {activeTab === 'analytics' && <AnalyticsView inventory={inventory} sales={sales} expenses={expenses} stores={stores} />}
      </main>

      {/* --- MODAL CREAR PRODUCTO --- */}
      <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} title="Nuevo Producto Almacén">
         <div className="space-y-4 pt-2">
            <div><label className="text-sm font-medium">Categoría</label><select className="w-full p-2 border rounded" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category:e.target.value})}><option value="">Seleccionar...</option>{CATEGORIAS_BASE.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><input placeholder="Sabor" className="p-2 border rounded" value={newProduct.flavor} onChange={e=>setNewProduct({...newProduct, flavor:e.target.value})}/><input placeholder="Tamaño" className="p-2 border rounded" value={newProduct.size} onChange={e=>setNewProduct({...newProduct, size:e.target.value})}/></div>
            <div className="grid grid-cols-3 gap-2"><input type="number" placeholder="Cant." className="p-2 border rounded" value={newProduct.quantity} onChange={e=>setNewProduct({...newProduct, quantity:e.target.value})}/><input type="number" placeholder="Costo" className="p-2 border rounded" value={newProduct.cost} onChange={e=>setNewProduct({...newProduct, cost:e.target.value})}/><input type="number" placeholder="Precio" className="p-2 border rounded" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price:e.target.value})}/></div>
            <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={()=>setProductModalOpen(false)}>Cancelar</Button><Button onClick={handleAddProduct}>Guardar</Button></div>
         </div>
      </Modal>

      {/* --- NUEVO: MODAL EDITAR PRODUCTO --- */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Editar Producto">
         {editingProduct && (
             <div className="space-y-4 pt-2">
                <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select className="w-full p-2 border rounded" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}>
                        {CATEGORIAS_BASE.map(c=><option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs">Sabor</label><input className="w-full p-2 border rounded" value={editingProduct.flavor} onChange={e=>setEditingProduct({...editingProduct, flavor:e.target.value})}/></div>
                    <div><label className="text-xs">Tamaño</label><input className="w-full p-2 border rounded" value={editingProduct.size} onChange={e=>setEditingProduct({...editingProduct, size:e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-xs">Stock</label><input type="number" className="w-full p-2 border rounded" value={editingProduct.quantity} onChange={e=>setEditingProduct({...editingProduct, quantity:e.target.value})}/></div>
                    <div><label className="text-xs">Costo</label><input type="number" className="w-full p-2 border rounded" value={editingProduct.cost} onChange={e=>setEditingProduct({...editingProduct, cost:e.target.value})}/></div>
                    <div><label className="text-xs">Precio</label><input type="number" className="w-full p-2 border rounded" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:e.target.value})}/></div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={()=>setEditingProduct(null)}>Cancelar</Button>
                    <Button onClick={handleUpdateProduct}>Actualizar</Button>
                </div>
             </div>
         )}
      </Modal>

      <Modal isOpen={isStoreModalOpen} onClose={() => setStoreModalOpen(false)} title="Nueva Tienda">
         <div className="space-y-4 pt-2">
            <input className="w-full p-2 border rounded" placeholder="Nombre Tienda" value={newStore.name} onChange={e=>setNewStore({...newStore, name:e.target.value})}/>
            <input className="w-full p-2 border rounded" placeholder="Ubicación" value={newStore.location} onChange={e=>setNewStore({...newStore, location:e.target.value})}/>
            <div className="grid grid-cols-2 gap-2"><input className="p-2 border rounded" placeholder="Encargado" value={newStore.manager} onChange={e=>setNewStore({...newStore, manager:e.target.value})}/><input className="p-2 border rounded" placeholder="Teléfono" value={newStore.phone} onChange={e=>setNewStore({...newStore, phone:e.target.value})}/></div>
            <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={()=>setStoreModalOpen(false)}>Cancelar</Button><Button onClick={handleAddStore}>Crear</Button></div>
         </div>
      </Modal>

      <TransferModal isOpen={!!transferData} onClose={() => setTransferData(null)} product={transferData} stores={stores} onConfirm={handleTransfer} />
      
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* --- MODALES DE CONFIRMACIÓN (PEDIDO, VENTA, MERMA) --- */}
      {confirmationData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-emerald-600 p-4 text-white text-center">
              <h3 className="text-xl font-bold">Confirmar Pedido</h3>
              <p className="text-emerald-100 text-sm">Verifica los datos antes de imprimir</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-500 text-sm">Destino:</span>
                <span className="font-bold text-lg text-emerald-800">{confirmationData.store?.name || 'Tienda'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Producto:</span><span className="font-medium">{confirmationData.product.category} {confirmationData.product.flavor}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Cantidad:</span><span className="font-bold text-emerald-600">{confirmationData.quantity} pzas</span></div>
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="text-gray-500 font-medium">Total:</span>
                    <span className="text-xl font-bold text-emerald-700">${(confirmationData.quantity * confirmationData.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t">
              <button onClick={() => setConfirmationData(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
              <button onClick={processTransferConfirm} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2"><span>🖨️ Confirmar</span></button>
            </div>
          </div>
        </div>
      )}

      {saleItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                <div className="bg-green-600 p-4 text-white flex gap-3 items-center">
                    <div className="bg-white/20 p-2 rounded-full"><CheckCircle size={24}/></div>
                    <div><h3 className="font-bold text-lg">Registrar Venta</h3><p className="text-green-100 text-xs">Salida de producto</p></div>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-4 text-center">¿Confirmar venta de 1 unidad?</p>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center">
                        <div className="font-bold text-gray-800">{saleItem.category} {saleItem.flavor}</div>
                        <div className="text-sm text-gray-500">{saleItem.size}</div>
                        <div className="text-2xl font-bold text-green-700 mt-2">${saleItem.price}</div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex gap-2 justify-end border-t">
                    <button onClick={() => setSaleItem(null)} className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                    <button onClick={processSaleConfirm} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-sm">Sí, Vender</button>
                </div>
            </div>
        </div>
      )}

      {wasteItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                <div className="bg-red-600 p-4 text-white flex gap-3 items-center">
                    <div className="bg-white/20 p-2 rounded-full"><AlertTriangle size={24}/></div>
                    <div><h3 className="font-bold text-lg">Reportar Merma</h3><p className="text-red-100 text-xs">Producto dañado/perdido</p></div>
                </div>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-4 flex justify-between items-center">
                        <span className="font-medium text-red-900">{wasteItem.category} {wasteItem.flavor}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-600 font-bold">1 pza</span>
                    </div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Motivo de la merma:</label>
                    <input autoFocus className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ej: Bolsa rota..." value={wasteReason} onChange={(e) => setWasteReason(e.target.value)} />
                </div>
                <div className="p-4 bg-gray-50 flex gap-2 justify-end border-t">
                    <button onClick={() => setWasteItem(null)} className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                    <button onClick={processWasteConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm">Reportar</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}