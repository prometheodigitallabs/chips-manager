import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase'; // Importamos la db configurada

export const useInventoryData = (user) => {
  const [data, setData] = useState({
    inventory: [],
    stores: [],
    sales: [],
    transfers: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario autenticado, no cargamos nada por seguridad
    if (!user) return;

    // Helper simplificado: Ahora apunta directo a la colección raíz
    const subscribe = (collectionName, key, sortFn) => {
        // ANTES: collection(db, 'artifacts', appId, 'public', 'data', collectionName)
        // AHORA: Mucho más limpio 👇
        const q = collection(db, collectionName);
        
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (sortFn) items.sort(sortFn);
            
            setData(prev => ({ ...prev, [key]: items }));
        }, (error) => console.error(`Error cargando ${collectionName}:`, error));
    };

    // Suscripciones a las colecciones simples
    const unsubInventory = subscribe('inventory', 'inventory', 
        (a, b) => new Date(a.date) - new Date(b.date));
    
    const unsubStores = subscribe('stores', 'stores'); // Tiendas
    
    const unsubSales = subscribe('movements', 'sales', 
        (a, b) => new Date(b.saleDate) - new Date(a.saleDate));
    
    const unsubTransfers = subscribe('transfers', 'transfers', 
        (a, b) => new Date(b.date) - new Date(a.date));
    
    const unsubExpenses = subscribe('expenses', 'expenses', 
        (a, b) => new Date(b.date) - new Date(a.date));

    setLoading(false);

    // Limpieza al salir
    return () => {
      unsubInventory();
      unsubStores();
      unsubSales();
      unsubTransfers();
      unsubExpenses();
    };
  }, [user]);

  return { ...data, loading };
};