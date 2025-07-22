import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginForm';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
