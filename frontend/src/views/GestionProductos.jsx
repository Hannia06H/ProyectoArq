import { useEffect, useState } from "react";
import axios from "axios";

export default function GestionProductos() {
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

  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (rol === "Administrador") obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const res = await axios.get("http://localhost:5000/api/productos");
    setProductos(res.data);
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formulario.id) {
        // ACTUALIZAR producto existente
        await axios.put(
          `http://localhost:5000/api/productos/${formulario.id}`,
          formulario
        );
      } else {
        // CREAR nuevo producto
        await axios.post("http://localhost:5000/api/productos", formulario);
      }

      // Limpiar formulario y recargar
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
      alert("Error al guardar producto");
    }
  };

  const handleEditar = (prod) => {
    setFormulario({
      id: prod[0],
      nombre: prod[1],
      descripcion: prod[2],
      precio: prod[3],
      categoria: prod[4],
      stock: prod[5]
    });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await axios.delete(`http://localhost:5000/api/productos/${id}`);
    obtenerProductos();
  };

  if (rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido.</p>;
  }

  return (
    <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} style={{ width: "40%" }}>
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
        <input
          type="text"
          name="categoria"
          placeholder="Categoría"
          value={formulario.categoria}
          onChange={handleChange}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formulario.stock}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {formulario.id ? "Actualizar producto" : "Guardar producto"}
        </button>
      </form>

      {/* TABLA */}
      <div style={{ width: "60%" }}>
        <h2>Productos registrados</h2>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ marginBottom: "1rem", width: "100%", padding: "8px" }}
        />
        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos
              .filter((p) =>
                p[1].toLowerCase().includes(filtro.toLowerCase())
              )
              .map((p) => (
                <tr key={p[0]}>
                  <td>{p[1]}</td>
                  <td>{p[2]}</td>
                  <td>${p[3]}</td>
                  <td>{p[4]}</td>
                  <td>{p[5]}</td>
                  <td>
                    <button onClick={() => handleEditar(p)}>Editar</button>
                    <button onClick={() => eliminarProducto(p[0])}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
