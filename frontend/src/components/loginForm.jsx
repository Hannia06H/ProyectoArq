import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/login', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      navigate('/dashboard');
    } catch (err) {
      const error = err.response?.data?.error || 'Error al iniciar sesión';
      setMsg(error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit">Entrar</button>
      {msg && <p className="error">{msg}</p>}
    </form>
  );
}