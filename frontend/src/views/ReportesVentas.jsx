import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/NavBar";

function ReportesVentas() {
  const columns = [
    { key: '_id', label: 'IDENTIFICACIÓN', width: '20%' },
    { key: 'clienteNombre', label: 'Cliente', width: '20%' },
    { key: 'total', label: 'Total (MXN)', width: '15%' },
    { key: 'fecha', label: 'Fecha', width: '15%' },
    { key: 'cantidadTotal', label: 'Productos Totales', width: '15%' },
    { key: 'vendedor', label: 'Vendedor', width: '15%' },
  ];

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    fecha: '',
    producto: '',
    vendedor: ''
  });

  const [expandedRow, setExpandedRow] = useState(null); // NUEVO para expandir fila

  const itemsPerPage = 10;
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/ventas', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const ventas = response.data;
        const datosTransformados = ventas.map(v => {
          const cantidadTotal = v.productosSeleccionados.reduce((sum, p) => sum + p.cantidad, 0);
          return {
            ...v,
            cantidadTotal,
            fecha: new Date(v.fecha).toLocaleDateString(),
            total: v.total.toFixed(2),
            vendedor: v.vendedorNombre || "N/A"
          };
        });
        setDatos(datosTransformados);
      } catch (err) {
        const msg = err.response?.data?.error || err.message;
        setError(`Error al cargar ventas: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productosUnicos = useMemo(() => {
    const setProd = new Set();
    datos.forEach(v => v.productosSeleccionados.forEach(p => setProd.add(p.nombre)));
    return Array.from(setProd);
  }, [datos]);

  const vendedoresUnicos = useMemo(() => {
    return Array.from(new Set(datos.map(v => v.vendedor)));
  }, [datos]);

  const filteredData = useMemo(() => {
    return datos.filter(v => {
      const matchesFecha = filters.fecha ? v.fecha === new Date(filters.fecha).toLocaleDateString() : true;
      const matchesProducto = filters.producto ? v.productosSeleccionados.some(p => p.nombre === filters.producto) : true;
      const matchesCliente = filters.clienteNombre ? v.clienteNombre === filters.clienteNombre : true;

      return matchesFecha && matchesProducto && matchesCliente;

    });
  }, [datos, filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => filteredData.slice(indexOfFirstItem, indexOfLastItem), [filteredData, indexOfFirstItem, indexOfLastItem]);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const totalVentas = filteredData.reduce((sum, v) => sum + parseFloat(v.total), 0).toFixed(2);
  const totalProductos = filteredData.reduce((sum, v) => sum + v.cantidadTotal, 0);

const exportToExcelLocal = () => {
  const exportData = filteredData.map(({ _id, clienteNombre, total, fecha, cantidadTotal, vendedor }) => ({
    IDENTIFICACIÓN: _id,
    Cliente: clienteNombre,
    'Total (MXN)': total,
    Fecha: fecha,
    'Productos Totales': cantidadTotal,
    Vendedor: vendedor,
  }));

  // Agregar fila de totales
  exportData.push({
    IDENTIFICACIÓN: "Totales",
    Cliente: "",
    "Total (MXN)": totalVentas,
    Fecha: "",
    "Productos Totales": totalProductos,
    Vendedor: ""
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Configurar anchos de columnas
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
  ];

  // Resaltar encabezado (fila 1)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) {
      cell.s = {
        fill: { fgColor: { rgb: "40916C" } }, // verde oscuro
        font: { color: { rgb: "FFFFFF" }, bold: true },
        alignment: { horizontal: "center" }
      };
    }
  }

  // Resaltar fila de totales (última fila)
  const lastRow = range.e.r;
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: lastRow, c: C })];
    if (cell) {
      cell.s = {
        fill: { fgColor: { rgb: "D8F3DC" } }, // verde claro
        font: { bold: true },
        alignment: { horizontal: "center" }
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  XLSX.writeFile(workbook, `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
};


  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando ventas...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>;
  if (rol !== "Consultor" && rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido. Solo los administradores y consultores pueden acceder a esta sección.</p>;
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '2rem auto', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
          Informe de ventas
        </h1>
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>
          Visualización, filtrado y exportación de las ventas registradas.
        </p>

        {/* Filtros */}
<div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
  <input
    type="date"
    value={filters.fecha}
    onChange={e => setFilters(prev => ({ ...prev, fecha: e.target.value }))}
  />

  <select
    value={filters.producto}
    onChange={e => setFilters(prev => ({ ...prev, producto: e.target.value }))}
  >
    <option value="">Todos los productos</option>
    {productosUnicos.map(prod => (
      <option key={prod} value={prod}>{prod}</option>
    ))}
  </select>

  <select
    value={filters.clienteNombre}  // CAMBIO: ahora filtra por clienteNombre
    onChange={e => setFilters(prev => ({ ...prev, clienteNombre: e.target.value }))}
  >
    <option value="">Todos los clientes</option>
    {Array.from(new Set(datos.map(v => v.clienteNombre))).map(c => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>

  <button onClick={exportToExcelLocal} style={{ backgroundColor: '#2d6a4f', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
    Exportar a Excel
  </button>
</div>


        {/* Tabla */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
          <thead style={{ backgroundColor: '#40916c', color: 'white' }}>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700' }}>
                  {col.label}
                </th>
              ))}
              <th style={{ padding: '14px 12px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((venta, idx) => (
              <React.Fragment key={venta._id}>
                <tr style={{ backgroundColor: idx % 2 === 0 ? '#f7f9f9' : 'white' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {venta[col.key]}
                    </td>
                  ))}
                  <td>
                    <button 
                      style={{ background: "#1b4332", color: "white", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                      onClick={() => setExpandedRow(expandedRow === venta._id ? null : venta._id)}
                    >
                      {expandedRow === venta._id ? "Ocultar" : "Ver productos"}
                    </button>
                  </td>
                </tr>
                {expandedRow === venta._id && (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ backgroundColor: "#edf6f9", padding: "10px" }}>
                      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", padding: "10px" }}>
                        {venta.productosSeleccionados.map((p, i) => (
                          <div key={i} style={{ minWidth: 200, border: "1px solid #ccc", borderRadius: 8, padding: "10px", backgroundColor: "white" }}>
                            <p><strong>{p.nombre}</strong></p>
                            <p>Cantidad: {p.cantidad}</p>
                            <p>Precio: {p.precio.toFixed(2)} MXN</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot style={{ backgroundColor: '#d8f3dc', fontWeight: 'bold' }}>
            <tr>
              <td colSpan={2}>Totales</td>
              <td>{totalVentas} MXN</td>
              <td></td>
              <td>{totalProductos}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>« Primera</button>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Última »</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesVentas;
