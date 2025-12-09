import { MESES } from './constants';

// --- 1. FUNCIÓN PARA IMPRIMIR TICKET DE VENTA ---
export const printTicket = (store, orderData, totalItems, totalValue) => {
  const ticketWindow = window.open('', 'PRINT', 'height=600,width=400');
  if (!ticketWindow) return false;

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  // SEGURIDAD: Convertir a número por si viene como texto
  const safeTotalValue = parseFloat(totalValue) || 0;

  ticketWindow.document.write(`
    <html>
      <head>
        <title>Nota - ${store?.name || 'Pedido'}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { text-align: left; border-bottom: 1px solid #000; }
          td { padding: 5px 0; }
          .totals { text-align: right; font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>CHIPSMANAGER</h2>
          <p>Nota de Entrega</p>
          <p>Folio: ${Date.now().toString().slice(-6)}</p>
        </div>
        <div>
          <strong>DESTINO:</strong><br>${store?.name || 'Tienda'}<br>${store?.location || ''}<br>
          ${store?.manager ? `Attn: ${store.manager}<br>` : ''}
          ${date} ${time}
        </div>
        <br/>
        <table>
          <thead><tr><th>Cant.</th><th>Producto</th><th>Precio</th><th>Total</th></tr></thead>
          <tbody>
            ${orderData.map(item => {
                // SEGURIDAD EN CADA FILA
                const qty = parseFloat(item.amount) || 0;
                const price = parseFloat(item.price) || 0;
                const subtotal = qty * price;
                return `<tr><td>${qty}</td><td>${item.productName}</td><td>$${price.toFixed(2)}</td><td>$${subtotal.toFixed(2)}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="totals">
          <p>Total Unidades: ${totalItems}</p>
          <p style="font-size: 14px;">VALOR ENTREGA: $${safeTotalValue.toFixed(2)}</p>
        </div>
        <br/><br/><center>_______________________<br>Firma Recibido</center>
      </body>
    </html>
  `);

  ticketWindow.document.close();
  setTimeout(() => {
    ticketWindow.focus();
    ticketWindow.print();
    ticketWindow.close();
  }, 500);

  return true;
};

// --- 2. FUNCIÓN PARA IMPRIMIR REPORTE FINANCIERO ---
export const printFinancialReport = ({
  monthIndex,
  year,
  totalSales,
  totalExpenses,
  totalWasteValue,
  netProfit,
  filteredExpenses,
  filteredMovements,
  stores
}) => {
  
  const reportWindow = window.open('', 'PRINT', 'height=600,width=800');
  if (!reportWindow) return false;

  const monthName = monthIndex === -1 ? "Todo el Año" : MESES[monthIndex];
  const reportDate = new Date().toLocaleDateString();

  // SEGURIDAD: Asegurar que los totales sean números
  const safeSales = parseFloat(totalSales) || 0;
  const safeExpenses = parseFloat(totalExpenses) || 0;
  const safeWaste = parseFloat(totalWasteValue) || 0;
  const safeProfit = parseFloat(netProfit) || 0;

  reportWindow.document.write(`
      <html>
        <head>
          <title>Reporte Financiero - ${monthName} ${year}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            h1 { color: #047857; margin: 0; }
            h2 { font-size: 18px; color: #666; margin-top: 5px; }
            .grid { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
            .card h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
            .card .value { font-size: 24px; font-weight: bold; color: #111; }
            .card.income .value { color: #059669; }
            .card.waste .value { color: #dc2626; }
            .card.expenses .value { color: #d97706; }
            .card.profit .value { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { text-align: left; background: #ecfdf5; padding: 10px; border-bottom: 2px solid #d1fae5; color: #065f46; }
            td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
            .section-title { margin-top: 30px; font-size: 16px; font-weight: bold; color: #374151; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHIPSMANAGER</h1>
            <h2>Reporte Financiero: ${monthName} ${year}</h2>
            <p style="font-size:12px; color:#999">Generado el: ${reportDate}</p>
          </div>

          <div class="grid">
            <div class="card income">
              <h3>Ingresos Totales</h3>
              <div class="value">$${safeSales.toFixed(2)}</div>
            </div>
            <div class="card expenses">
              <h3>Gastos Operativos</h3>
              <div class="value">$${safeExpenses.toFixed(2)}</div>
            </div>
            <div class="card waste">
              <h3>Mermas</h3>
              <div class="value">$${safeWaste.toFixed(2)}</div>
            </div>
            <div class="card profit">
              <h3>Utilidad Neta Real</h3>
              <div class="value">$${safeProfit.toFixed(2)}</div>
            </div>
          </div>

          <div class="section-title">Desglose de Gastos</div>
          <table>
            <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th></tr></thead>
            <tbody>
              ${filteredExpenses.map(e => {
                  // AQUÍ ESTABA EL ERROR: Forzamos la conversión a número
                  const safeAmount = parseFloat(e.amount) || 0;
                  return `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category}</td><td>$${safeAmount.toFixed(2)}</td></tr>`;
              }).join('')}
              ${filteredExpenses.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#999">Sin gastos registrados</td></tr>' : ''}
            </tbody>
          </table>

          <div class="section-title">Detalle de Ventas y Mermas</div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Tienda/Ubicación</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMovements.map(m => {
                  // SEGURIDAD TAMBIÉN AQUÍ
                  const safeAmount = parseFloat(m.amount) || 0;
                  return `
                    <tr>
                      <td>${m.saleDate || m.date}</td>
                      <td style="color:${m.type === 'sale' ? '#059669' : '#dc2626'}; font-weight:bold">
                        ${m.type === 'sale' ? 'VENTA' : 'MERMA'}
                      </td>
                      <td>${m.category} - ${m.flavor} (${m.size})</td>
                      <td>${stores.find(s => s.id === m.storeId)?.name || 'N/A'}</td>
                      <td>$${safeAmount.toFixed(2)}</td>
                    </tr>
                  `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Este documento es un reporte interno generado automáticamente por el sistema ChipsManager.</p>
          </div>
        </body>
      </html>
    `);

  reportWindow.document.close();
  setTimeout(() => {
    reportWindow.focus();
    reportWindow.print();
    reportWindow.close();
  }, 500);

  return true;
};