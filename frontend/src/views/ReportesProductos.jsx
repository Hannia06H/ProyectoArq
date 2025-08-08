import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function ReportesProductos() {
  // Configuración de columnas
  const columns = [
    { key: 'id', label: 'ID', width: '10%' },
    { key: 'nombre', label: 'Nombre', width: '20%' },
    { key: 'descripcion', label: 'Descripción', width: '35%' },
    { key: 'precio', label: 'Precio', width: '15%' },
    { key: 'categoria', label: 'Categoría', width: '15%' },
    { key: 'stock', label: 'Stock', width: '10%' }
  ];

  // Estados del componente
  const [datos, setDatos] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoria: '',
    minPrecio: '',
    maxPrecio: '',
    minStock: '',
    maxStock: ''
  });
  
  // Estado para tipo de gráfico
  const [tipoGrafico, setTipoGrafico] = useState('barra');

  // Obtener datos del API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/reportes/productos');
        
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
        setDatosFiltrados(datosTransformados);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    if (datos.length === 0) return;
    
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
    
    setDatosFiltrados(resultado);
    setCurrentPage(1); // Resetear a la primera página al aplicar filtros
  }, [filtros, datos]);

  // Funcionalidad de exportación
  const exportToExcel = () => {
    const datosParaExportar = datosFiltrados.map(item => ({
      ...item,
      precio: item.precioFormateado
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, `reporte_productos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Preparar datos para gráficos
  const prepararDatosGraficos = () => {
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
  };
  
  const { porCategoria, topPrecios, topStocks } = prepararDatosGraficos();
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Cálculos de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);

  // Estilos fijos para la tabla
  const tableStyle = {
    width: '100%',
    tableLayout: 'fixed'
  };

  // Manejar cambio de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
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
  };

  // Renderizado condicional
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 my-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-yellow-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Reporte de Productos</h1>
        <p className="text-gray-600">Visualización y exportación de los productos registrados</p>
      </div>

      {/* Sección de Filtros */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 p-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtros de Búsqueda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={filtros.nombre}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por nombre"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input
              type="text"
              name="categoria"
              value={filtros.categoria}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por categoría"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Precio</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrecio"
                value={filtros.minPrecio}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name="maxPrecio"
                value={filtros.maxPrecio}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Máximo"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Stock</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minStock"
                value={filtros.minStock}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo"
                min="0"
              />
              <input
                type="number"
                name="maxStock"
                value={filtros.maxStock}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Máximo"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800">
          Mostrando <span className="font-bold">{datosFiltrados.length}</span> de <span className="font-bold">{datos.length}</span> productos
          {filtros.nombre || filtros.categoria || filtros.minPrecio || filtros.maxPrecio || filtros.minStock || filtros.maxStock ? 
           ' (filtrados)' : ''}
        </p>
      </div>

      {/* Sección de Gráficos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Visualización de Datos</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTipoGrafico('barra')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${tipoGrafico === 'barra' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Barras
            </button>
            <button
              onClick={() => setTipoGrafico('pie')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${tipoGrafico === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Circular
            </button>
          </div>
        </div>

        {datosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Distribución por categoría */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Distribución por Categoría</h3>
              <div className="h-64">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Top 5 Productos {tipoGrafico === 'barra' ? 'por Precio' : 'por Stock'}
              </h3>
              <div className="h-64">
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
          <div className="text-center py-8 text-gray-500">
            No hay datos para mostrar con los filtros actuales
          </div>
        )}
      </div>

      {/* Sección de Tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Encabezado con controles */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar a Excel
          </button>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                {columns.map(col => (
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
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-gray-900 overflow-hidden overflow-ellipsis whitespace-nowrap"
                      style={{ width: col.width }}
                      title={item[col.key === 'precio' ? 'precioFormateado' : col.key]} // Tooltip para contenido largo
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
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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

export default ReportesProductos;