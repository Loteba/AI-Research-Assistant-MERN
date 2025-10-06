import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
        ProyectifyIA
      </Link>
      <ul className="navbar-links">
        {user ? (
          <>
            <li className="navbar-welcome">
              Bienvenido, {user.name.split(' ')[0]}
            </li>
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <button onClick={logout} className="navbar-logout-btn">
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">Iniciar Sesión</NavLink>
            </li>
            <li>
              <NavLink to="/register" className="navbar-register-btn">
                Registrarse
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;