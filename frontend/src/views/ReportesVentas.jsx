import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ReportesVentas() {
  const columnasVentas = [
    { key: 'id', label: 'IDENTIFICACIÓN', width: '10%' },
    { key: 'cliente', label: 'Cliente', width: '25%' },
    { key: 'producto', label: 'Producto', width: '25%' },
    { key: 'cantidad', label: 'Cantidad', width: '10%' },
    { key: 'total', label: 'Total ($)', width: '15%' },
    { key: 'fecha', label: 'Fecha', width: '15%' },
  ];

  // Simulación de datos, loading y error
  const [datosVentas] = useState([
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop Pro 15', cantidad: 1, total: 25000, fecha: '03-08-2025' },
    { id: 2, cliente: 'María López', producto: 'Teléfono inteligente X1', cantidad: 2, total: 11999.98, fecha: '02-08-2025' },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Teclado mecánico', cantidad: 1, total: 1200, fecha: '01-08-2025' },
    // Más datos si quieres
  ]);
  const [loading] = useState(false);
  const [error] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datosVentas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(datosVentas.length / itemsPerPage);

  const tableStyle = {
    width: '100%',
    tableLayout: 'fixed',
  };

  const exportToExcel = () => {
    // Transformar los datos para quitar propiedades no necesarias o cambiar nombres
    const exportData = datosVentas.map(({ id, cliente, producto, cantidad, total, fecha }) => ({
      ID: id,
      Cliente: cliente,
      Producto: producto,
      Cantidad: cantidad,
      Total: total,
      Fecha: fecha,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
    XLSX.writeFile(workbook, `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-blue-600 font-medium">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 my-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (datosVentas.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 my-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-yellow-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">No hay datos disponibles para mostrar.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Reporte de Ventas</h1>
        <p className="text-gray-600">Visualización y exportación de las ventas registradas</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Encabezado con controles */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar a Excel
          </button>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Tabla de datos con tamaño fijo */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={tableStyle}>
            <thead className="bg-gray-50">
              <tr>
                {columnasVentas.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  {columnasVentas.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-gray-900 overflow-hidden overflow-ellipsis whitespace-nowrap"
                      style={{ width: col.width }}
                      title={
                        col.key === 'total'
                          ? `$${item[col.key].toLocaleString()}`
                          : item[col.key]
                      }
                    >
                      {col.key === 'total'
                        ? `$${item[col.key].toLocaleString()}`
                        : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación inferior */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-center">
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Primera</span>
                «
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Última</span>
                »
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesVentas;
