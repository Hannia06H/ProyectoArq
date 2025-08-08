import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function ReportesUsuarios() {
  const columns = [
    { key: '_id', label: 'ID', width: '20%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'rol', label: 'Rol', width: '15%' },
    { key: 'createdAt', label: 'Fecha Creación', width: '20%' },
    { key: 'ultimoAcceso', label: 'Último Acceso', width: '20%' },
  ];

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/usuarios', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const usuarios = response.data;
        setDatos(
          usuarios.map((u) => ({
            ...u,
            createdAt: new Date(u.createdAt).toLocaleDateString(),
            ultimoAcceso: u.ultimoAcceso
              ? new Date(u.ultimoAcceso).toLocaleDateString()
              : 'Nunca',
          }))
        );
      } catch (err) {
        setError(`Error al cargar usuarios: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...datos];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [datos, sortConfig]);

  const filteredData = sortedData.filter((item) => {
    return (
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ultimoAcceso.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportToExcelLocal = () => {
    const exportData = filteredData.map(({ _id, email, rol, createdAt, ultimoAcceso }) => ({
      ID: _id,
      Email: email,
      Rol: rol,
      'Fecha Creación': createdAt,
      'Último Acceso': ultimoAcceso,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    XLSX.writeFile(workbook, `reporte_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-spin text-blue-600"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="mt-4 text-lg font-medium text-gray-700">Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Error</h3>
          </div>
          <p className="mt-3 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-yellow-50 to-white">
        <div className="max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Sin datos</h3>
          </div>
          <p className="mt-3 text-gray-600">No hay usuarios registrados en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


{/* Header */}
<div className="mb-8 bg-white rounded-xl shadow-lg p-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-3 text-blue-700"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Reporte de Usuarios
      </h1>
      <p className="text-gray-600 mt-1 text-lg font-medium">Gestión y análisis de usuarios registrados</p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 w-full transition-shadow duration-300"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <button
        onClick={exportToExcelLocal}
        className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 active:scale-95"
        title="Exportar a Excel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 animate-pulse"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar
      </button>
    </div>
  </div>
</div>

{/* Table */}
<div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-blue-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className="px-8 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none hover:bg-blue-100 transition-colors"
              onClick={() => requestSort(column.key)}
              style={{ width: column.width }}
            >
              <div className="flex items-center select-none">
                {column.label}
                {sortConfig.key === column.key && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 text-blue-700"
                  >
                    {sortConfig.direction === 'ascending' ? (
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    ) : (
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    )}
                  </svg>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {currentItems.map((usuario, index) => (
          <tr
            key={usuario._id}
            className={`transition-colors duration-300 cursor-pointer ${
              index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
            } hover:bg-blue-100`}
            title="Click para ver más detalles"
          >
            {columns.map((column) => (
              <td
                key={`${usuario._id}-${column.key}`}
                className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs"
                title={usuario[column.key]}
              >
                {column.key === 'rol' ? (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full select-none ${
                      usuario.rol === 'admin'
                        ? 'bg-purple-200 text-purple-900'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {usuario.rol}
                  </span>
                ) : (
                  usuario[column.key]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 select-none">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Anterior
      </button>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Siguiente
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Mostrando{' '}
          <span className="font-semibold">{indexOfFirstItem + 1}</span> a{' '}
          <span className="font-semibold">
            {Math.min(indexOfLastItem, filteredData.length)}
          </span>{' '}
          de <span className="font-semibold">{filteredData.length}</span>{' '}
          resultados
        </p>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          {/* Botones de paginación */}
          {/* (se mantiene igual, con estilos suavizados) */}
          {/* ... */}
        </nav>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}

export default ReportesUsuarios;