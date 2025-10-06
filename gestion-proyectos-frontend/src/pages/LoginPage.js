import React, { useState, useContext } from 'react'; // Importa useContext
import { AuthContext } from '../context/AuthContext'; // Importa nuestro contexto
import authService from '../services/authService';
import './Form.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext); // <-- Obtenemos la función login del contexto
  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await authService.login({ email, password });
      login(userData); // <-- Usamos la función del contexto. ¡Esto nos redirigirá!
    } catch (error) {
      console.error('Error en el inicio de sesión:', error.response.data.message);
    }
  };

  // ... el resto del JSX es igual ...
  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={onSubmit}>
        {/* ... */}
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        <button type="submit" className="form-button">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;