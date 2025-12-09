import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ExpensesView = ({ expenses, onSaveExpense, onDeleteExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: "", amount: "", category: "Gasolina" });

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) return;
    onSaveExpense(formData); // App.jsx manejará el guardado
    setFormData({ description: "", amount: "", category: "Gasolina" }); // Reset
    setShowForm(false);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gastos Operativos</h2>
        <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> {showForm ? "Cerrar" : "Nuevo Gasto"}
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="p-4 bg-orange-50 border-orange-100 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wide mb-3">Registrar Gasto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input type="text" placeholder="Descripción" className="w-full p-3 border rounded-lg" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
              <select className="w-full p-3 border rounded-lg bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Gasolina</option><option>Nómina</option><option>Insumos</option><option>Mantenimiento</option><option>Publicidad</option><option>Otros</option>
              </select>
            </div>
            <div>
              <input type="number" placeholder="$ Monto" className="w-full p-3 border rounded-lg font-bold text-orange-800" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleSubmit}>Registrar</Button>
          </div>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <div className="p-4 border-b font-bold flex justify-between items-center bg-gray-50"><span>Historial</span><Badge color="orange">{expenses.length} regs.</Badge></div>
        <div className="max-h-96 overflow-y-auto">
            {expenses.length === 0 ? <div className="p-8 text-center text-gray-400">Sin registros.</div> : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0"><tr><th className="p-3">Fecha</th><th className="p-3">Concepto</th><th className="p-3">Categoría</th><th className="p-3 text-right">Monto</th><th className="p-3 text-center"></th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{exp.date}</td>
                    <td className="p-3 font-medium text-gray-800">{exp.description}</td>
                    <td className="p-3"><Badge color="gray">{exp.category}</Badge></td>
                    <td className="p-3 text-right font-bold text-red-600">-${parseFloat(exp.amount).toFixed(2)}</td>
                    <td className="p-3 text-center">
                        <button onClick={() => onDeleteExpense(exp.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
        </div>
      </Card>
    </div>
  );
};