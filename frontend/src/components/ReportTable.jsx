import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function ReportTable({ apiEndpoint, columns }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000' + apiEndpoint);
        if (!response.data) throw new Error('No se recibieron datos del servidor');
        const datosTransformados = response.data.map(item => ({
          id: item[0],
          nombre: item[1],
          descripcion: item[2],
          precio: item[3],
          categoria: item[4],
          stock: item[5]
        }));
        setDatos(datosTransformados);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiEndpoint]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, 'reporte_productos.xlsx');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(datos.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-blue-600 font-medium">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded shadow">
        {error}
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="text-center text-yellow-700 bg-yellow-100 p-4 rounded shadow">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón y control de paginación */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow-md transition"
        >
          📄 Exportar a Excel
        </button>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅ Anterior
            </button>
            <span className="text-sm font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Siguiente ➡
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-md rounded border border-gray-300">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-2 border font-semibold text-left">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((fila, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2 border text-gray-700">
                    {fila[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación inferior */}
      {totalPages > 1 && (
        <div className="flex justify-center flex-wrap gap-1 mt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportTable;
