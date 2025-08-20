import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/NavBar';

const NODE_API_URL = "http://localhost:4000/api/users"; // URL actualizada

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]); // Nuevo estado para roles
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    email: "",
    rol: "",
    password: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  const inputStyle = {
    padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '10px', width: '100%'
  };
  const buttonStyle = {
    padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
  };
  const primaryButton = { ...buttonStyle, backgroundColor: '#007bff', color: 'white' };
  const dangerButton = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const tableHeaderStyle = { backgroundColor: '#f8f9fa', padding: '12px 15px', borderBottom: '1px solid #dee2e6' };
  const tableCellStyle = { padding: '10px 15px' };

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles(); // Obtener la lista de roles
  }, [filtroNombre, filtroRol]);

  const obtenerRoles = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(NODE_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { nombre: filtroNombre, rol: filtroRol }
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      alert("Error al cargar los usuarios.");
    }
  };

  const handleChangeForm = (e) => {
    setFormUsuario({ ...formUsuario, [e.target.name]: e.target.value });
  };

  const registrarOEditarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await axios.put(`${NODE_API_URL}/${editandoId}`, formUsuario, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuario actualizado con éxito.");
      } else {
        await axios.post(NODE_API_URL, formUsuario, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuario registrado con éxito.");
      }
      setFormUsuario({ nombre: "", email: "", rol: "", password: "" });
      setEditandoId(null);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Error al guardar el usuario.");
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await axios.delete(`${NODE_API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Usuario eliminado.");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  };

  const editarUsuario = (usuario) => {
    setFormUsuario({ 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol._id, // Usar el ID del rol
      password: "" 
    });
    setEditandoId(usuario._id);
  };

  if (rol !== "Administrador") {
    return <p style={{ padding: "2rem" }}>Acceso restringido. Solo los administradores pueden acceder a la gestión de usuarios.</p>;
  }

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal */}
      <div style={{ 
        display: "flex", 
        padding: "2rem", 
        gap: "2rem", 
        maxWidth: "1200px", 
        margin: "0 auto", 
        fontFamily: "Arial, sans-serif"
      }}>
        {/* Formulario */}
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          width: "40%", 
          background: 'white',
          height: "fit-content"
        }}>
          <h2>{editandoId ? "Editar Usuario" : "Registrar Usuario"}</h2>
          <form onSubmit={registrarOEditarUsuario} style={{ display: "flex", flexDirection: "column" }}>
            <input 
              type="text" 
              name="nombre" 
              placeholder="Nombre" 
              value={formUsuario.nombre} 
              onChange={handleChangeForm} 
              style={inputStyle} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formUsuario.email} 
              onChange={handleChangeForm} 
              style={inputStyle} 
              required 
            />
            <select 
              name="rol" 
              value={formUsuario.rol} 
              onChange={handleChangeForm} 
              style={inputStyle}
              required
            >
              <option value="">Seleccionar Rol</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.nombre}</option>
              ))}
            </select>
            <input 
              type="password" 
              name="password" 
              placeholder="Contraseña" 
              value={formUsuario.password} 
              onChange={handleChangeForm} 
              style={inputStyle} 
              required={!editandoId} 
            />
            <button 
              type="submit" 
              style={primaryButton}
            >
              {editandoId ? "Actualizar" : "Registrar"}
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          width: "60%", 
          background: 'white'
        }}>
          <h2>Usuarios Registrados</h2>
          <div style={{ 
            marginBottom: "10px", 
            display: "flex", 
            gap: "10px" 
          }}>
            <input 
              type="text" 
              placeholder="Filtrar por nombre" 
              value={filtroNombre} 
              onChange={(e) => setFiltroNombre(e.target.value)} 
              style={inputStyle} 
            />
            <select 
              value={filtroRol} 
              onChange={(e) => setFiltroRol(e.target.value)} 
              style={inputStyle}
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.nombre}</option>
              ))}
            </select>
          </div>

          {usuarios.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6c757d" }}>
              No hay usuarios registrados.
            </p>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Nombre</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Rol</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u._id}>
                      <td style={tableCellStyle}>{u.nombre}</td>
                      <td style={tableCellStyle}>{u.email}</td>
                      <td style={tableCellStyle}>{u.rol?.nombre}</td>
                      <td style={tableCellStyle}>
                        <button 
                          onClick={() => editarUsuario(u)} 
                          style={{ 
                            ...buttonStyle, 
                            backgroundColor: '#ffc107', 
                            color: 'white', 
                            marginRight: '5px' 
                          }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarUsuario(u._id)} 
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
        </div>
      </div>
    </div>
  );
} 