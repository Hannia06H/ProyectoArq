import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/NavBar';

export default function GestionProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio_compra: "",
    precio_venta: "",
    categoria_id: "",
    stock: ""
  });
  const [filtro, setFiltro] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (rol === "Administrador") {
      obtenerProductos();
      obtenerCategorias();
    }
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/productos");
      
      // Transformar array de arrays a array de objetos
      const productosTransformados = res.data.map(producto => ({
        id: producto[0],
        nombre: producto[1] || "Sin nombre",
        descripcion: producto[2] || "",
        precio_compra: producto[3] || 0,
        precio_venta: producto[4] || 0,
        categoria_id: producto[5] || "",
        stock: producto[6] || 0
      }));
      
      setProductos(productosTransformados);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      mostrarAlerta("Error al cargar productos");
    }
  };

  const obtenerCategorias = async () => {
    try {
      // Si tienes endpoint para categorías, úsalo, sino usa estas por defecto
      const categoriasPorDefecto = [
        {id: 1, nombre: "Electrónicos"},
        {id: 2, nombre: "Ropa"},
        {id: 3, nombre: "Calzado"},
        {id: 4, nombre: "Accesorios"},
        {id: 5, nombre: "Hogar"},
        {id: 6, nombre: "Libros"},
        {id: 7, nombre: "Papelería"},
        {id: 8, nombre: "Oficina"},
        {id: 9, nombre: "Deportes"},
        {id: 10, nombre: "Belleza"},
        {id: 11, nombre: "Juguetes"},
        {id: 12, nombre: "Muebles"},
        {id: 13, nombre: "Alimentos"},
        {id: 14, nombre: "Jardín"},
        {id: 15, nombre: "Bricolaje"},
        {id: 16, nombre: "Arte"},
        {id: 17, nombre: "Otro"}
      ];
      setCategorias(categoriasPorDefecto);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const mostrarAlerta = (msg) => {
    setMensaje(msg);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000);
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formulario.id) {
        await axios.put(
          `http://localhost:5000/api/productos/${formulario.id}`,
          formulario
        );
        mostrarAlerta("Producto actualizado correctamente");
      } else {
        await axios.post("http://localhost:5000/api/productos", formulario);
        mostrarAlerta("Producto agregado correctamente");
      }

      // Limpiar formulario
      setFormulario({
        id: null,
        nombre: "",
        descripcion: "",
        precio_compra: "",
        precio_venta: "",
        categoria_id: "",
        stock: ""
      });
      
      // Actualizar lista de productos
      obtenerProductos();
      
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al guardar producto");
    }
  };

  const handleEditar = (prod) => {
    setFormulario({
      id: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio_compra: prod.precio_compra,
      precio_venta: prod.precio_venta,
      categoria_id: prod.categoria_id, // Guardamos el ID para el formulario
      stock: prod.stock
    });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/productos/${id}`);
      mostrarAlerta("Producto eliminado correctamente");
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarAlerta("Error al eliminar producto");
    }
  };

  const cancelarEdicion = () => {
    setFormulario({
      id: null,
      nombre: "",
      descripcion: "",
      precio_compra: "",
      precio_venta: "",
      categoria_id: "",
      stock: ""
    });
  };

  // Obtener nombre de categoría por ID
  const obtenerNombreCategoria = (id) => {
    const categoria = categorias.find(cat => cat.id == id); // Usar == en lugar de === para comparar string con número
    return categoria ? categoria.nombre : "Sin categoría";
  };

  if (rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido.</p>;
  }

  return (
    <div>
      {/* NAVBAR IMPORTADO */}
      <Navbar />

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ display: "flex", padding: "2rem", gap: "2rem", paddingTop: "100px" }}>
        
        {/* Mensaje de alerta */}
        {mostrarMensaje && (
          <div style={{
            position: "fixed",
            top: "100px",
            right: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "1rem",
            borderRadius: "4px",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}>
            {mensaje}
          </div>
        )}

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <h2>{formulario.id ? "Editar" : "Agregar"} producto</h2>
          
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del producto"
            value={formulario.nombre}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={formulario.descripcion}
            onChange={handleChange}
            style={{...inputStyle, minHeight: "80px", resize: "vertical"}}
          />
          
          <div style={{display: "flex", gap: "10px"}}>
            <input
              type="number"
              name="precio_compra"
              placeholder="Precio compra"
              value={formulario.precio_compra}
              onChange={handleChange}
              required
              style={{...inputStyle, flex: 1}}
              step="0.01"
              min="0"
            />
            
            <input
              type="number"
              name="precio_venta"
              placeholder="Precio venta"
              value={formulario.precio_venta}
              onChange={handleChange}
              required
              style={{...inputStyle, flex: 1}}
              step="0.01"
              min="0"
            />
          </div>
          
          <select
            name="categoria_id"
            value={formulario.categoria_id}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Selecciona categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          
          <input
            type="number"
            name="stock"
            placeholder="Stock disponible"
            value={formulario.stock}
            onChange={handleChange}
            required
            style={inputStyle}
            min="0"
          />
          
          <div style={{display: "flex", gap: "10px"}}>
            <button type="submit" style={submitButtonStyle(formulario.id)}>
              {formulario.id ? "Actualizar" : "Agregar"} producto
            </button>
            
            {formulario.id && (
              <button 
                type="button" 
                onClick={cancelarEdicion}
                style={{...submitButtonStyle(false), backgroundColor: "#999"}}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* TABLA Y FILTROS */}
        <div style={{ width: "60%", display: "flex", flexDirection: "column" }}>
          <h2>Productos registrados ({productos.length})</h2>

          {/* FILTROS MEJORADOS */}
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            marginBottom: "1rem",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef"
          }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{ 
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px"
                }}
              />
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>
                Filtrar por categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px",
                  backgroundColor: "white"
                }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLA CON SCROLL */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "500px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "white"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={tableHeaderStyle}>Nombre</th>
                  <th style={tableHeaderStyle}>Descripción</th>
                  <th style={tableHeaderStyle}>P. Compra</th>
                  <th style={tableHeaderStyle}>P. Venta</th>
                  <th style={tableHeaderStyle}>Categoría</th>
                  <th style={tableHeaderStyle}>Stock</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              
              <tbody>
                {productos
                  .filter(p =>
                    p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
                    (filtroCategoria === "" || obtenerNombreCategoria(p.categoria_id) === filtroCategoria)
                  )
                  .length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#666", fontStyle: "italic" }}>
                        {filtro || filtroCategoria ? "No se encontraron productos con los filtros aplicados" : "No hay productos registrados"}
                      </td>
                    </tr>
                  ) : (
                    productos
                      .filter(p =>
                        p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
                        (filtroCategoria === "" || obtenerNombreCategoria(p.categoria_id) === filtroCategoria)
                      )
                      .map(p => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                          <td style={{...tableCellStyle, fontWeight: "500"}}>{p.nombre}</td>
                          <td style={tableCellStyle}>{p.descripcion}</td>
                          <td style={tableCellStyle}>${parseFloat(p.precio_compra).toFixed(2)}</td>
                          <td style={tableCellStyle}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                          {/* Mostrar el nombre de la categoría en lugar del ID */}
                          <td style={tableCellStyle}>{obtenerNombreCategoria(p.categoria_id)}</td>
                          <td style={tableCellStyle}>{p.stock}</td>
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleEditar(p)}
                                style={actionButtonStyle("#4CAF50")}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarProducto(p.id)}
                                style={actionButtonStyle("#f44336")}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos reutilizables
const inputStyle = {
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "6px",
  width: "100%",
  boxSizing: "border-box",
  fontSize: "16px"
};

const submitButtonStyle = (isEdit) => ({
  padding: "12px 16px",
  backgroundColor: isEdit ? "#28a745" : "#007bff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
  flex: 1,
  fontSize: "16px",
  transition: "background-color 0.2s",
  ":hover": {
    backgroundColor: isEdit ? "#218838" : "#0069d9"
  }
});

const tableHeaderStyle = {
  padding: "16px 12px",
  textAlign: "left",
  backgroundColor: "#343a40",
  color: "white",
  fontWeight: "600",
  fontSize: "15px"
};

const tableCellStyle = {
  padding: "14px 12px",
  textAlign: "left",
  fontSize: "15px"
};

const actionButtonStyle = (color) => ({
  backgroundColor: color,
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background-color 0.2s",
  ":hover": {
    opacity: 0.9
  }
});