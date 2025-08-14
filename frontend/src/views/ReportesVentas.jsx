import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/NavBar";

function ReportesVentas() {
  const columns = [
    { key: '_id', label: 'IDENTIFICACIÓN', width: '25%' },
    { key: 'clienteNombre', label: 'Cliente', width: '25%' },
    { key: 'total', label: 'Total (MXN)', width: '15%' },
    { key: 'fecha', label: 'Fecha', width: '20%' },
    { key: 'cantidadTotal', label: 'Productos Totales', width: '15%' },
  ];

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const exportToExcelLocal = () => {
    const exportData = datos.map(({ _id, clienteNombre, total, fecha, cantidadTotal }) => ({
      IDENTIFICACIÓN: _id,
      Cliente: clienteNombre,
      'Total (MXN)': total,
      Fecha: fecha,
      'Productos Totales': cantidadTotal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
    XLSX.writeFile(workbook, `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => datos.slice(indexOfFirstItem, indexOfLastItem), [datos, indexOfFirstItem, indexOfLastItem]);
  const totalPages = Math.ceil(datos.length / itemsPerPage);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando ventas...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>;
  if (datos.length === 0) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>No hay ventas registradas.</p>;

  if (rol !== "Consultor" && rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido. Solo los administradores y consultores pueden acceder a esta sección.</p>;
  }

return (
  <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
    {/* Navbar */}
    <Navbar />

    {/* Contenido principal */}
    <div style={{ maxWidth: 1100, margin: '2rem auto', paddingTop: '1rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', marginBottom: '0.3rem' }}>
         <span style={{ marginLeft: 10 }}>Informe de ventas</span>
      </h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>
        Visualización y exportación de las ventas registradas.
      </p>

      <button
        onClick={exportToExcelLocal}
        style={{
          backgroundColor: '#2d6a4f',
          color: 'white',
          padding: '10px 16px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        title="Exportar a Excel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          style={{ marginRight: 8 }}
        >
          <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar a Excel
      </button>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}
      >
        <thead style={{ backgroundColor: '#40916c', color: 'white' }}>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: '14px 12px',
                  textAlign: 'left',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  width: col.width,
                  userSelect: 'none',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((venta, idx) => (
            <tr
              key={venta._id}
              style={{
                backgroundColor: idx % 2 === 0 ? '#f7f9f9' : 'white',
                transition: 'background-color 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d8f3dc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f7f9f9' : 'white')}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  title={venta[col.key]}
                  style={{
                    padding: '12px',
                    fontSize: '0.85rem',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    verticalAlign: 'middle',
                  }}
                >
                  {venta[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #40916c',
              backgroundColor: currentPage === 1 ? '#a7c4b2' : '#40916c',
              color: 'white',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            « Primera
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #40916c',
              backgroundColor: currentPage === 1 ? '#a7c4b2' : '#52b788',
              color: 'white',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            Anterior
          </button>

          <span
            style={{
              alignSelf: 'center',
              fontWeight: '600',
              color: '#333',
              userSelect: 'none',
            }}
          >
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #40916c',
              backgroundColor: currentPage === totalPages ? '#a7c4b2' : '#52b788',
              color: 'white',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #40916c',
              backgroundColor: currentPage === totalPages ? '#a7c4b2' : '#40916c',
              color: 'white',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            Última »
          </button>
        </div>
      )}
    </div>
  </div>
);

}

export default ReportesVentas;
