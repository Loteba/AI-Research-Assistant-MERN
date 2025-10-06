import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaProjectDiagram, FaBook, FaCog } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar-nav">
      <nav>
        <ul>
          <li><NavLink to="/dashboard" end><FaTachometerAlt /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/dashboard/projects"><FaProjectDiagram /><span>Mis Proyectos</span></NavLink></li>
          <li><NavLink to="/dashboard/library"><FaBook /><span>Biblioteca</span></NavLink></li>
          <li><NavLink to="/dashboard/settings" className="placeholder"><FaCog /><span>Configuración (Próximamente)</span></NavLink></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;