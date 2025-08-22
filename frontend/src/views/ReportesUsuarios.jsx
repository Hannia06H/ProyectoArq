import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from '../components/NavBar';

const ReportesUsuarios = () => {
  // Configuración de columnas
  const columns = [
    { key: '_id', label: 'ID', width: '20%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'rol', label: 'Rol', width: '15%' },
    { key: 'createdAt', label: 'Fecha Creación', width: '20%' },
    { key: 'ultimoAcceso', label: 'Último Acceso', width: '20%' },
  ];

  // Estados
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;
  const rol = localStorage.getItem('rol');

  // Estilos
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    content: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '0.3rem',
      color: '#40916c',
      display: 'flex',
      alignItems: 'center',
    },
    subtitle: {
      color: '#555',
      marginBottom: '1.5rem',
      fontSize: '16px',
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px',
    },
    searchInput: {
      flex: '1',
      minWidth: '250px',
      padding: '10px 15px 10px 40px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15.7%2014.3l-3.8-3.8c.8-1.1%201.2-2.4%201.2-3.8%200-3.3-2.7-6-6-6s-6%202.7-6%206%202.7%206%206%206c1.4%200%202.7-.4%203.8-1.2l3.8%203.8c.2.2.4.3.7.3.3%200%20.5-.1.7-.3.4-.3.4-.7.2-1zM7%2011c-2.2%200-4-1.8-4-4s1.8-4%204-4%204%201.8%204%204-1.8%204-4%204z%22%20fill%3D%22%23555%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '15px center',
      backgroundSize: '16px 16px',
    },
    searchInputFocus: {
      borderColor: '#52b788',
      boxShadow: '0 0 0 2px rgba(82, 183, 136, 0.2)',
    },
    button: {
      backgroundColor: '#40916c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    buttonHover: {
      backgroundColor: '#52b788',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#40916c',
      color: 'white',
    },
    tableHeaderCell: {
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 0.2s',
    },
    tableHeaderCellHover: {
      backgroundColor: '#52b788',
    },
    tableRow: {
      borderBottom: '1px solid #eee',
    },
    tableRowEven: {
      backgroundColor: '#f7f9f9',
    },
    tableRowHover: {
      backgroundColor: '#d8f3dc',
    },
    tableCell: {
      padding: '12px 15px',
      maxWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      padding: '15px',
      backgroundColor: 'white',
      borderTop: '1px solid #eee',
    },
    paginationButton: {
      margin: '0 5px',
      padding: '8px 12px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    paginationButtonActive: {
      backgroundColor: '#40916c',
      color: 'white',
      borderColor: '#40916c',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: '#40916c',
    },
    errorContainer: {
      backgroundColor: '#fff3f3',
      padding: '20px',
      borderRadius: '10px',
      color: '#d32f2f',
      textAlign: 'center',
      margin: '20px 0',
    },
    emptyContainer: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '10px',
      textAlign: 'center',
      color: '#555',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    roleBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
    },
    roleAdmin: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
    },
    roleUser: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
    },
  };

  // Obtener datos de la API
  // Actualizar la URL de la API de usuarios
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const usuarios = response.data;
      const datosTransformados = usuarios.map((u) => ({
        ...u,
        rol: u.rol?.nombre || 'Sin rol', // Acceder al nombre del rol
        createdAt: new Date(u.createdAt).toLocaleDateString(),
        ultimoAcceso: u.ultimoAcceso
          ? new Date(u.ultimoAcceso).toLocaleDateString()
          : 'Nunca',
      }));
      setDatos(datosTransformados);
    } catch (err) {
      setError(`Error al cargar usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Ordenar datos
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...datos];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [datos, sortConfig]);

  // Filtrar datos
  const filteredData = sortedData.filter((item) => {
    return (
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ultimoAcceso.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Exportar a Excel
  const exportToExcel = () => {
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

    // Estilos para Excel
    const headerStyle = {
      fill: { fgColor: { rgb: "40916C" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
    };

    // Aplicar estilos a los encabezados
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    XLSX.writeFile(workbook, `reporte_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Generar números de página para la paginación
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;

      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      } else if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Estados de hover
  const [hoverStates, setHoverStates] = useState({
    exportButton: false,
    searchInput: false,
  });

  // Verificar acceso
  if (rol !== "Consultor" && rol !== "Administrador") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#d32f2f" }}>
        Acceso restringido. Solo los administradores y consultores pueden acceder a esta sección.
      </div>
    );
  }

  // Mostrar estados de carga, error o sin datos
  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
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
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p style={{ marginTop: '20px', fontSize: '18px' }}>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.errorContainer}>
            <h3 style={{ marginBottom: '10px' }}>Error al cargar los datos</h3>
            <p style={{ marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...styles.button,
                backgroundColor: '#d32f2f',
                ...(hoverStates.retryButton && { backgroundColor: '#f44336' }),
              }}
              onMouseEnter={() => setHoverStates({ ...hoverStates, retryButton: true })}
              onMouseLeave={() => setHoverStates({ ...hoverStates, retryButton: false })}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.emptyContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#40916c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h3 style={{ margin: '20px 0 10px', fontSize: '20px' }}>No hay usuarios registrados</h3>
            <p>No se encontraron usuarios en el sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {/* Encabezado */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h1 style={styles.title}>
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
                  style={{ marginRight: '10px' }}
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Reporte de Usuarios
              </h1>
              <p style={styles.subtitle}>Gestión y análisis de usuarios registrados en el sistema</p>
            </div>
          </div>

          {/* Barra de búsqueda y acciones */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por email, rol o fecha..."
              style={{
                ...styles.searchInput,
                ...(hoverStates.searchInput && styles.searchInputFocus),
              }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onFocus={() => setHoverStates({ ...hoverStates, searchInput: true })}
              onBlur={() => setHoverStates({ ...hoverStates, searchInput: false })}
            />

            <button
              onClick={exportToExcel}
              style={{
                ...styles.button,
                ...(hoverStates.exportButton && styles.buttonHover),
              }}
              onMouseEnter={() => setHoverStates({ ...hoverStates, exportButton: true })}
              onMouseLeave={() => setHoverStates({ ...hoverStates, exportButton: false })}
              title="Exportar a Excel"
            >
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
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar a Excel
            </button>
          </div>
        </div>

        {/* Tabla de datos */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      ...styles.tableHeaderCell,
                      ...(hoverStates[`header-${column.key}`] && styles.tableHeaderCellHover),
                    }}
                    onMouseEnter={() => setHoverStates({ ...hoverStates, [`header-${column.key}`]: true })}
                    onMouseLeave={() => setHoverStates({ ...hoverStates, [`header-${column.key}`]: false })}
                    onClick={() => requestSort(column.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((usuario, index) => (
                <tr
                  key={usuario._id}
                  style={{
                    ...styles.tableRow,
                    ...(index % 2 === 0 && styles.tableRowEven),
                    ...(hoverStates[`row-${usuario._id}`] && styles.tableRowHover),
                  }}
                  onMouseEnter={() => setHoverStates({ ...hoverStates, [`row-${usuario._id}`]: true })}
                  onMouseLeave={() => setHoverStates({ ...hoverStates, [`row-${usuario._id}`]: false })}
                >
                  {columns.map((column) => (
                    <td key={`${usuario._id}-${column.key}`} style={styles.tableCell}>
                      {column.key === 'rol' ? (
                        <span
                          style={{
                            ...styles.roleBadge,
                            ...(usuario.rol === 'admin' ? styles.roleAdmin : styles.roleUser),
                          }}
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

          {/* Paginación */}
          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                ...(currentPage === 1 && styles.paginationButtonDisabled),
              }}
            >
              Primera
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                ...(currentPage === 1 && styles.paginationButtonDisabled),
              }}
            >
              Anterior
            </button>

            {getPageNumbers().map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === number && styles.paginationButtonActive),
                }}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                ...(currentPage === totalPages && styles.paginationButtonDisabled),
              }}
            >
              Siguiente
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                ...(currentPage === totalPages && styles.paginationButtonDisabled),
              }}
            >
              Última
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '15px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#555', marginRight: '5px' }}>Total usuarios:</span>
            <strong>{filteredData.length}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#555', marginRight: '5px' }}>Administradores:</span>
            <strong>{filteredData.filter(u => u.rol === 'admin').length}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#555', marginRight: '5px' }}>Usuarios activos:</span>
            <strong>{filteredData.filter(u => u.ultimoAcceso !== 'Nunca').length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesUsuarios;