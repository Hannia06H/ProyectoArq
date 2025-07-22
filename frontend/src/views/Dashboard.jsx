export default function Dashboard() {
  const rol = localStorage.getItem('rol');
  return (
    <div>
      <h1>Bienvenido al panel</h1>
      <p>Tu rol: {rol}</p>
    </div>
  );
}
