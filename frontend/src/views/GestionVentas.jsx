// frontend/src/views/GestionVentas.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/NavBar';

// URLs de los backends
const NODE_API_URL = "http://localhost:4000/api/ventas";// Para Ventas (Node.js)
const FLASK_API_URL = "http://localhost:5000/api"; // Para Productos (Flask)

export default function GestionVentas() {
  const [ventas, setVentas] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  const [formularioVenta, setFormularioVenta] = useState({
    clienteNombre: '',
    productosSeleccionados: [],
    total: 0,
    fecha: new Date().toISOString().split('T')[0],
  });

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const rol = localStorage.getItem('rol');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Puedes comentar esta sección temporalmente para depurar la UI sin el rol
    // if (rol !== "Vendedor" && rol !== "Administrador" && rol !== "Consultor") {
    //   console.warn("Acceso denegado. Solo los vendedores, administradores y consultores pueden acceder a esta sección.");
    //   return;
    // }

    obtenerVentas();
    obtenerProductosDisponibles();

  }, [rol, userId, filtroCliente, filtroFechaFin, filtroFechaInicio]);

  const obtenerVentas = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        fechaInicio: filtroFechaInicio,
        fechaFin: filtroFechaFin,
        cliente: filtroCliente,
      }
    };
    const res = await axios.get(NODE_API_URL, config);
    console.log("Ventas obtenidas del backend:", res.data);
    setVentas(res.data);
  } catch (error) {
    console.error("Error al obtener ventas:", error.response?.status, error.response?.data?.error || error.message);
    alert("Error al cargar las ventas.");
  }
};

  const obtenerProductosDisponibles = async () => {
  try {
    // 1) Intentar el endpoint de reportes (objetos)
    const r1 = await axios.get(`${FLASK_API_URL}/reportes/productos`, { timeout: 8000 });
    const data1 = r1.data;
    if (Array.isArray(data1) && data1.length >= 0 && (data1[0] === undefined || typeof data1[0] === 'object')) {
      const productosMap = data1.map(p => ({
        id: Number(p.id),
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        categoria: p.categoria,
        stock: Number(p.stock),
      }));
      setProductosDisponibles(productosMap);
      return;
    }
    throw new Error('Formato inesperado en /reportes/productos');
  } catch (e1) {
    console.warn('Fallo /reportes/productos, probando /productos:', e1?.message);
    try {
      // 2) Fallback: /api/productos (tuplas)
      const r2 = await axios.get(`${FLASK_API_URL}/productos`, { timeout: 8000 });
      const data2 = r2.data; // array de tuplas
      const productosMap = (Array.isArray(data2) ? data2 : []).map(p => ({
        id: Number(p.id ?? p[0]),
        nombre: p.nombre ?? p[1],
        descripcion: p.descripcion ?? p[2],
        precio: Number(p.precio ?? p[3]),
        categoria: p.categoria ?? p[4],
        stock: Number(p.stock ?? p[5]),
      }));
      setProductosDisponibles(productosMap);
    } catch (e2) {
      console.error("Error al obtener productos:", e2.response?.status, e2.response?.data || e2.message);
      alert("Error al cargar productos. Verifica que Flask esté en http://localhost:5000 y que /api/reportes/productos o /api/productos respondan.");
    }
  }
};

  const handleVentaChange = (e) => {
    setFormularioVenta({ ...formularioVenta, [e.target.name]: e.target.value });
  };

  const handleProductoSeleccionado = (e) => {
    const productoId = e.target.value;
    const producto = productosDisponibles.find(p => p.id == productoId);
    if (producto && !formularioVenta.productosSeleccionados.some(p => p.id === producto.id) && producto.stock > 0) {
      setFormularioVenta(prev => {
        const updatedProductos = [...prev.productosSeleccionados, { ...producto, cantidad: 1 }];
        const newTotal = updatedProductos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        return { ...prev, productosSeleccionados: updatedProductos, total: newTotal };
      });
      e.target.value = "";
    } else if (producto && producto.stock === 0) {
        alert("Este producto no tiene stock disponible.");
    }
  };

  const handleCantidadChange = (e, productoId) => {
    const cantidad = parseInt(e.target.value);
    setFormularioVenta(prev => {
      const updatedProductos = prev.productosSeleccionados.map(item =>
        item.id === productoId ? { ...item, cantidad: cantidad > 0 ? cantidad : 1 } : item
      );
      const newTotal = updatedProductos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      return { ...prev, productosSeleccionados: updatedProductos, total: newTotal };
    });
  };

  const handleRemoveProducto = (productoId) => {
    setFormularioVenta(prev => {
      const updatedProductos = prev.productosSeleccionados.filter(item => item.id !== productoId);
      const newTotal = updatedProductos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      return { ...prev, productosSeleccionados: updatedProductos, total: newTotal };
    });
  };

  const handleRegistrarVenta = async (e) => {
    e.preventDefault();
    if (formularioVenta.productosSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un producto para la venta.");
      return;
    }
    if (!formularioVenta.clienteNombre.trim()) {
      alert("Por favor, ingrese el nombre del cliente.");
      return;
    }

    try {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const ventaParaEnviar = { ...formularioVenta, vendedorId: userId };

    await axios.post(NODE_API_URL, ventaParaEnviar, config);
    alert("Venta registrada exitosamente!");
      setFormularioVenta({
        clienteNombre: '', productosSeleccionados: [], total: 0, fecha: new Date().toISOString().split('T')[0],
      });
      obtenerVentas();
      obtenerProductosDisponibles();
    } catch (error) {
    console.error("Error al registrar venta:", error.response?.status, error.response?.data?.error || error.message);
    alert(`Error al registrar la venta: ${error.response?.data?.error || error.message}`);
  }
};

  const handleFiltroChange = (e) => {
    if (e.target.name === "fechaInicio") setFiltroFechaInicio(e.target.value);
    else if (e.target.name === "fechaFin") setFiltroFechaFin(e.target.value);
    else if (e.target.name === "cliente") setFiltroCliente(e.target.value);
  };

  // Puedes quitar esta condición temporalmente para depurar la UI sin el rol
  if (rol !== "Vendedor" && rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido. Solo los administradores y vendedores pueden acceder a esta sección.</p>;
  }

  // Estilos generales para inputs y botones
  const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box', // Asegura que padding no aumente el ancho total
  };

  const buttonStyle = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: '#007bff', // Azul primario
    color: 'white',
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: '#dc3545', // Rojo para eliminar
    color: 'white',
    marginLeft: '5px', // Pequeño margen para separar botones
  };

  const secondaryButton = {
    ...buttonStyle,
    backgroundColor: '#6c757d', // Gris para filtros
    color: 'white',
  };

  const tableHeaderStyle = {
    backgroundColor: '#f8f9fa', // Un gris muy claro
    color: '#343a40',
    textAlign: 'left',
    padding: '12px 15px',
    borderBottom: '1px solid #dee2e6',
  };

  const tableRowStyle = {
    borderBottom: '1px solid #dee2e6',
  };

  const tableCellStyle = {
    padding: '10px 15px',
    verticalAlign: 'top', // Alineación superior para contenido de celda
  };

  const containerSectionStyle = {
    border: '1px solid #e9ecef', // Borde más suave
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)', // Sombra más sutil
    backgroundColor: 'white',
    marginBottom: '2rem', // Espacio entre secciones
  };

return (
  <div>
    {/* Navbar */}
    <Navbar />

    {/* Contenido principal */}
    <div
      style={{
        display: "flex",
        padding: "2rem",
        gap: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* FORMULARIO DE REGISTRO DE VENTA */}
      <div style={{ ...containerSectionStyle, width: "40%" }}>
        <h2>Registrar Nueva Venta</h2>
        <form
          onSubmit={handleRegistrarVenta}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            name="clienteNombre"
            placeholder="Nombre del Cliente"
            value={formularioVenta.clienteNombre}
            onChange={handleVentaChange}
            required
            style={inputStyle}
          />
          <input
            type="date"
            name="fecha"
            value={formularioVenta.fecha}
            onChange={handleVentaChange}
            required
            style={inputStyle}
          />
          <select
            value=""
            onChange={handleProductoSeleccionado}
            style={inputStyle}
          >
            <option value="">-- Seleccionar Producto --</option>
            {productosDisponibles.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                {p.nombre} (${p.precio.toFixed(2)}) (Stock: {p.stock})
              </option>
            ))}
          </select>

          <h3 style={{ marginTop: "15px", marginBottom: "10px", color: "#495057" }}>
            Productos en la Venta:
          </h3>
          {formularioVenta.productosSeleccionados.length === 0 ? (
            <p style={{ color: "#6c757d" }}>No hay productos seleccionados.</p>
          ) : (
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #dee2e6",
                borderRadius: "5px",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Producto</th>
                    <th style={tableHeaderStyle}>Cant.</th>
                    <th style={tableHeaderStyle}>Subtotal</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formularioVenta.productosSeleccionados.map((item) => (
                    <tr key={item.id} style={tableRowStyle}>
                      <td style={tableCellStyle}>{item.nombre}</td>
                      <td style={tableCellStyle}>
                        <input
                          type="number"
                          min="1"
                          max={
                            productosDisponibles.find((p) => p.id === item.id)?.stock ||
                            item.cantidad
                          }
                          value={item.cantidad}
                          onChange={(e) => handleCantidadChange(e, item.id)}
                          style={{
                            ...inputStyle,
                            width: "60px",
                            marginBottom: "0",
                            padding: "6px",
                          }}
                        />
                      </td>
                      <td style={tableCellStyle}>
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          type="button"
                          onClick={() => handleRemoveProducto(item.id)}
                          style={dangerButton}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3
            style={{
              textAlign: "right",
              marginTop: "15px",
              color: "#343a40",
            }}
          >
            Total:{" "}
            <span
              style={{
                fontSize: "1.6rem",
                color: "#28a745",
              }}
            >
              ${formularioVenta.total.toFixed(2)}
            </span>
          </h3>

          <button type="submit" style={primaryButton}>
            Registrar Venta
          </button>
        </form>
      </div>

      {/* TABLA DE VENTAS CON SCROLL */}
      <div style={{ ...containerSectionStyle, width: "60%" }}>
        <h2>Mis Ventas Registradas</h2>
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            type="text"
            name="cliente"
            placeholder="Filtrar por Cliente"
            value={filtroCliente}
            onChange={handleFiltroChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="date"
              name="fechaInicio"
              placeholder="Fecha Inicio"
              value={filtroFechaInicio}
              onChange={handleFiltroChange}
              style={{ ...inputStyle, width: "50%", marginBottom: "0" }}
            />
            <input
              type="date"
              name="fechaFin"
              placeholder="Fecha Fin"
              value={filtroFechaFin}
              onChange={handleFiltroChange}
              style={{ ...inputStyle, width: "50%", marginBottom: "0" }}
            />
          </div>
          <button
            onClick={obtenerVentas}
            style={{
              ...secondaryButton,
              width: "100%",
              marginTop: "10px",
            }}
          >
            Aplicar Filtros
          </button>
        </div>

        {ventas.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c757d" }}>
            No hay ventas registradas o no se encontraron resultados con los
            filtros aplicados.
          </p>
        ) : (
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ID Venta</th>
                  <th style={tableHeaderStyle}>Fecha</th>
                  <th style={tableHeaderStyle}>Cliente</th>
                  <th style={tableHeaderStyle}>Productos</th>
                  <th style={tableHeaderStyle}>Total</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta._id} style={tableRowStyle}>
                    <td
                      style={{
                        ...tableCellStyle,
                        wordBreak: "break-all",
                      }}
                    >
                      {venta._id}
                    </td>
                    <td style={tableCellStyle}>
                      {new Date(venta.fecha).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>{venta.clienteNombre}</td>
                    <td style={tableCellStyle}>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {venta.productosSeleccionados.map((prod, index) => (
                          <li key={index}>
                            {prod.nombre} (x{prod.cantidad})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={tableCellStyle}>
                      ${venta.total.toFixed(2)}
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor: "#17a2b8",
                          color: "white",
                        }}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div> 
);

  
}