import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/NavBar';

const ReportesProductos = () => {
  // Configuración de columnas
  const columns = [
    { key: 'id', label: 'ID', width: '10%' },
    { key: 'nombre', label: 'Nombre', width: '20%' },
    { key: 'descripcion', label: 'Descripción', width: '35%' },
    { key: 'precio', label: 'Precio', width: '15%' },
    { key: 'categoria', label: 'Categoría', width: '15%' },
    { key: 'stock', label: 'Stock', width: '10%' }
  ];

  // Estados
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoria: '',
    minPrecio: '',
    maxPrecio: '',
    minStock: '',
    maxStock: ''
  });
  const [tipoGrafico, setTipoGrafico] = useState('barra');
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
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
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
      tableLayout: 'fixed',
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
    filterContainer: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '15px',
    },
    filterInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px',
    },
    chartContainer: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#40916c',
    },
    summaryCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
    },
    summaryItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    summaryLabel: {
      color: '#555',
    },
    summaryValue: {
      fontWeight: '600',
      color: '#40916c',
    },
  };

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/reportes/productos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.data) throw new Error('No se recibieron datos del servidor');
        
        const datosTransformados = response.data.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: parseFloat(item.precio),
            precioFormateado: `$${parseFloat(item.precio).toFixed(2)}`,
            categoria: item.categoria,
            stock: item.stock
        }));
        
        setDatos(datosTransformados);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar datos
  const datosFiltrados = useMemo(() => {
    if (datos.length === 0) return [];
    
    let resultado = [...datos];
    
    if (filtros.nombre) {
      resultado = resultado.filter(item => 
        item.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }
    
    if (filtros.categoria) {
      resultado = resultado.filter(item => 
        item.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())
      );
    }
    
    if (filtros.minPrecio) {
      resultado = resultado.filter(item => 
        item.precio >= parseFloat(filtros.minPrecio)
      );
    }
    
    if (filtros.maxPrecio) {
      resultado = resultado.filter(item => 
        item.precio <= parseFloat(filtros.maxPrecio)
      );
    }
    
    if (filtros.minStock) {
      resultado = resultado.filter(item => 
        item.stock >= parseInt(filtros.minStock)
      );
    }
    
    if (filtros.maxStock) {
      resultado = resultado.filter(item => 
        item.stock <= parseInt(filtros.maxStock)
      );
    }
    
    return resultado;
  }, [datos, filtros]);

  // Exportar a Excel
  const exportToExcel = () => {
    const datosParaExportar = datosFiltrados.map(item => ({
      ...item,
      precio: item.precioFormateado
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

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

    XLSX.writeFile(workbook, `reporte_productos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Preparar datos para gráficos
  const { porCategoria, topPrecios, topStocks } = useMemo(() => {
    // Gráfico por categoría
    const porCategoria = datosFiltrados.reduce((acc, item) => {
      const existente = acc.find(i => i.name === item.categoria);
      if (existente) {
        existente.value += 1;
        existente.totalPrecio += item.precio;
        existente.totalStock += item.stock;
      } else {
        acc.push({
          name: item.categoria || 'Sin categoría',
          value: 1,
          totalPrecio: item.precio,
          totalStock: item.stock
        });
      }
      return acc;
    }, []);
    
    // Top 5 productos por precio
    const topPrecios = [...datosFiltrados]
      .sort((a, b) => b.precio - a.precio)
      .slice(0, 5)
      .map(item => ({
        name: item.nombre,
        precio: item.precio
      }));
    
    // Top 5 productos por stock
    const topStocks = [...datosFiltrados]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
      .map(item => ({
        name: item.nombre,
        stock: item.stock
      }));
    
    return { porCategoria, topPrecios, topStocks };
  }, [datosFiltrados]);
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);

  // Manejar cambio de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Resetear filtros
  const resetFilters = () => {
    setFiltros({
      nombre: '',
      categoria: '',
      minPrecio: '',
      maxPrecio: '',
      minStock: '',
      maxStock: ''
    });
    setCurrentPage(1);
  };

  // Estados de hover
  const [hoverStates, setHoverStates] = useState({
    exportButton: false,
    resetButton: false,
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
            <p style={{ marginTop: '20px', fontSize: '18px' }}>Cargando productos...</p>
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
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h3 style={{ margin: '20px 0 10px', fontSize: '20px' }}>No hay productos registrados</h3>
            <p>No se encontraron productos en el sistema.</p>
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
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Reporte de Productos
              </h1>
              <p style={styles.subtitle}>Gestión y análisis de productos registrados en el sistema</p>
            </div>
          </div>

          {/* Resumen */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total productos:</span>
              <span style={styles.summaryValue}>{datos.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Filtrados:</span>
              <span style={styles.summaryValue}>{datosFiltrados.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Categorías:</span>
              <span style={styles.summaryValue}>
                {[...new Set(datosFiltrados.map(item => item.categoria))].length}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Precio promedio:</span>
              <span style={styles.summaryValue}>
                ${(datosFiltrados.reduce((sum, item) => sum + item.precio, 0) / (datosFiltrados.length || 1)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filterContainer}>
          <h2 style={styles.chartTitle}>Filtros de Búsqueda</h2>
          
          <div style={styles.filterGrid}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={filtros.nombre}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Filtrar por nombre"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Categoría</label>
              <input
                type="text"
                name="categoria"
                value={filtros.categoria}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Filtrar por categoría"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Precio mínimo</label>
              <input
                type="number"
                name="minPrecio"
                value={filtros.minPrecio}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Mínimo"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Precio máximo</label>
              <input
                type="number"
                name="maxPrecio"
                value={filtros.maxPrecio}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Máximo"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Stock mínimo</label>
              <input
                type="number"
                name="minStock"
                value={filtros.minStock}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Mínimo"
                min="0"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Stock máximo</label>
              <input
                type="number"
                name="maxStock"
                value={filtros.maxStock}
                onChange={handleFilterChange}
                style={styles.filterInput}
                placeholder="Máximo"
                min="0"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={resetFilters}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...(hoverStates.resetButton && { backgroundColor: '#f5f5f5' }),
              }}
              onMouseEnter={() => setHoverStates({ ...hoverStates, resetButton: true })}
              onMouseLeave={() => setHoverStates({ ...hoverStates, resetButton: false })}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div style={styles.chartContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={styles.chartTitle}>Visualización de Datos</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTipoGrafico('barra')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: tipoGrafico === 'barra' ? '#40916c' : '#eee',
                  color: tipoGrafico === 'barra' ? 'white' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Barras
              </button>
              <button
                onClick={() => setTipoGrafico('pie')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: tipoGrafico === 'pie' ? '#40916c' : '#eee',
                  color: tipoGrafico === 'pie' ? 'white' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Circular
              </button>
            </div>
          </div>

          {datosFiltrados.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Gráfico 1: Distribución por categoría */}
              <div style={{ backgroundColor: '#f7f9f9', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '10px', color: '#40916c', fontWeight: '600' }}>
                  Distribución por Categoría
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {tipoGrafico === 'barra' ? (
                      <BarChart data={porCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={porCategoria}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {porCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Top productos por precio o stock */}
              <div style={{ backgroundColor: '#f7f9f9', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '10px', color: '#40916c', fontWeight: '600' }}>
                  Top 5 Productos {tipoGrafico === 'barra' ? 'por Precio' : 'por Stock'}
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {tipoGrafico === 'barra' ? (
                      <BarChart data={topPrecios}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="precio" name="Precio ($)" fill="#82ca9d" />
                      </BarChart>
                    ) : (
                      <BarChart data={topStocks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" name="Stock" fill="#ffc658" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
              No hay datos para mostrar con los filtros actuales
            </div>
          )}
        </div>

        {/* Tabla de datos */}
        <div style={styles.tableContainer}>
          {/* Encabezado con controles */}
          <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={exportToExcel}
              style={{
                ...styles.button,
                ...(hoverStates.exportButton && styles.buttonHover),
              }}
              onMouseEnter={() => setHoverStates({ ...hoverStates, exportButton: true })}
              onMouseLeave={() => setHoverStates({ ...hoverStates, exportButton: false })}
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

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1 && styles.paginationButtonDisabled),
                  }}
                >
                  Anterior
                </button>
                <span style={{ color: '#555' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            )}
          </div>

          {/* Tabla */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      style={{
                        ...styles.tableHeaderCell,
                        width: col.width,
                        ...(hoverStates[`header-${col.key}`] && styles.tableHeaderCellHover),
                      }}
                      onMouseEnter={() => setHoverStates({ ...hoverStates, [`header-${col.key}`]: true })}
                      onMouseLeave={() => setHoverStates({ ...hoverStates, [`header-${col.key}`]: false })}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      ...styles.tableRow,
                      ...(idx % 2 === 0 ? {} : styles.tableRowEven),
                      ...(hoverStates[`row-${item.id}`] && styles.tableRowHover),
                    }}
                    onMouseEnter={() => setHoverStates({ ...hoverStates, [`row-${item.id}`]: true })}
                    onMouseLeave={() => setHoverStates({ ...hoverStates, [`row-${item.id}`]: false })}
                  >
                    {columns.map(col => (
                      <td
                        key={`${item.id}-${col.key}`}
                        style={styles.tableCell}
                        title={item[col.key === 'precio' ? 'precioFormateado' : col.key]}
                      >
                        {col.key === 'precio' ? item.precioFormateado : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación inferior */}
          {totalPages > 1 && (
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
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === pageNum && styles.paginationButtonActive),
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesProductos;