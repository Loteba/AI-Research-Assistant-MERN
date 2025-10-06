// frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import authService from '../services/authService'; // Importamos nuestro servicio
import './Form.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convertimos la función onSubmit en asíncrona para poder usar await
  const onSubmit = async (e) => {
    e.preventDefault();

    // Creamos el objeto con los datos del usuario
    const userData = {
      name,
      email,
      password,
    };

    try {
      // Llamamos a la función register de nuestro servicio
      const response = await authService.register(userData);
      console.log('Usuario registrado con éxito:', response);
      // Aquí podrías redirigir al usuario al dashboard, por ejemplo:
      // navigate('/projects');
    } catch (error) {
      // Si el backend devuelve un error (ej. "usuario ya existe"), lo capturamos aquí
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      console.error('Error en el registro:', message);
      // Aquí podrías mostrar el mensaje de error al usuario
    }
  };

  return (
    <div className="form-container">
      <h2>Crear una Cuenta</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" name="name" value={name} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          {/* ----- LA CORRECCIÓN ESTÁ AQUÍ ----- */}
          <input type="password" name="password" value={password} onChange={onChange} minLength="6" required />
        </div>
        <button type="submit" className="form-button">Registrarse</button>
      </form>
    </div>
  );
};

export default RegisterPage;