import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/NavBar';


export default function GestionProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: ""
  });
  const [filtro, setFiltro] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [showReportesMenu, setShowReportesMenu] = useState(false); // 👈 aquí
  const reportesButtonRef = useRef(null);

  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (rol === "Administrador") obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/productos");
      
      // Transformar array de arrays a array de objetos
      const productosTransformados = res.data.map(producto => ({
        id: producto[0],
        nombre: producto[1] || "Sin nombre",
        descripcion: producto[2] || "",
        precio: producto[3] || 0,
        categoria: producto[4] || "Sin categoría",
        stock: producto[5] || 0
      }));
      
      setProductos(productosTransformados);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      alert("Error al cargar productos");
    }
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
      } else {
        await axios.post("http://localhost:5000/api/productos", formulario);
      }

      setFormulario({
        id: null,
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        stock: ""
      });
      obtenerProductos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar producto");
    }
  };

  const handleEditar = (prod) => {
    setFormulario({
      id: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      categoria: prod.categoria,
      stock: prod.stock
    });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/productos/${id}`);
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  if (rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido.</p>;
  }

  // Lista de categorías para reutilizar en selects
  const categorias = [
    "Electrónicos", "Ropa", "Calzado", "Accesorios", "Hogar", "Libros",
    "Papelería", "Oficina", "Deportes", "Belleza", "Juguetes", "Muebles",
    "Alimentos", "Jardín", "Bricolaje", "Arte","Otro",
  ];

  return (
    <div>
      {/* NAVBAR IMPORTADO */}
      <Navbar />

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ display: "flex", padding: "2rem", gap: "2rem", paddingTop: "100px" /* para que no quede debajo del navbar */ }}>
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
            placeholder="Nombre"
            value={formulario.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={formulario.descripcion}
            onChange={handleChange}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formulario.precio}
            onChange={handleChange}
            required
          />
          <select
            name="categoria"
            value={formulario.categoria}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <option value="">Selecciona categoría</option>
            {["Electrónica", "Ropa", "Calzado", "Accesorios", "Hogar", "Libros",
    "Papelería", "Oficina", "Deportes", "Belleza", "Juguetes", "Muebles",
    "Alimentos", "Jardín", "Bricolaje", "Arte","Otro",].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formulario.stock}
            onChange={handleChange}
            required
          />
          <button type="submit" style={submitButtonStyle(formulario.id)}>
            {formulario.id ? "Actualizar producto" : "Guardar producto"}
          </button>
        </form>

        {/* TABLA Y FILTROS */}
        <div style={{ width: "60%", display: "flex", flexDirection: "column" }}>
          <h2>Productos registrados</h2>

          {/* FILTROS FIJOS */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            />
            <select
            name="filtroCategoria" 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{
                padding: "8px",
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            >
              <option value="">Todas las categorías</option>
              {["Electrónica", "Ropa", "Calzado", "Accesorios", "Hogar", "Libros",
    "Papelería", "Oficina", "Deportes", "Belleza", "Juguetes", "Muebles",
    "Alimentos", "Jardín", "Bricolaje", "Arte","Otro",].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* TABLA CON SCROLL */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "500px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f2f2f2", zIndex: 1 }}>
                <tr>
                  <th style={tableHeaderStyle}>Nombre</th>
                  <th style={tableHeaderStyle}>Descripción</th>
                  <th style={tableHeaderStyle}>Precio</th>
                  <th style={tableHeaderStyle}>Categoría</th>
                  <th style={tableHeaderStyle}>Stock</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
  {productos
    .filter(p =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
      (filtroCategoria === "" || p.categoria === filtroCategoria)
    )
    .length === 0 ? ( // Si no hay productos después del filtrado
      <tr>
        <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          No hay productos disponibles {filtro || filtroCategoria ? "con los filtros aplicados" : ""}.
        </td>
      </tr>
    ) : (
      productos
        .filter(p =>
          p.nombre.toLowerCase().includes(filtro.toLowerCase()) &&
          (filtroCategoria === "" || p.categoria === filtroCategoria)
        )
        .map(p => (
          <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={tableCellStyle}>{p.nombre}</td>
            <td style={tableCellStyle}>{p.descripcion}</td>
            <td style={tableCellStyle}>${p.precio}</td>
            <td style={tableCellStyle}>{p.categoria}</td>
            <td style={tableCellStyle}>{p.stock}</td>
            <td style={tableCellStyle}>
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
const navButtonStyle = (color) => ({
  backgroundColor: color,
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    opacity: 0.9
  }
});

const submitButtonStyle = (isEdit) => ({
  padding: "0.75rem",
  backgroundColor: isEdit ? "#4CAF50" : "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold"
});

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#333",
  color: "white"
};

const tableCellStyle = {
  padding: "12px",
  textAlign: "left"
};

const actionButtonStyle = (color) => ({
  backgroundColor: color,
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "8px",
  "&:hover": {
    opacity: 0.8
  }
});

// Estilo para los botones del submenú
const subMenuButtonStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  textAlign: "left",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  color: "#333",
  "&:hover": {
    backgroundColor: "#f5f5f5"
  }
};