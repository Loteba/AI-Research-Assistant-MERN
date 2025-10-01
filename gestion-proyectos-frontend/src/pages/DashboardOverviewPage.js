import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import projectService from '../services/projectService';
import Card from '../components/common/Card';
import Summarizer from '../components/ai/Summarizer';
import ArticleSuggester from '../components/ai/ArticleSuggester'; // <-- AÑADIDO
import { FaProjectDiagram, FaArrowRight } from 'react-icons/fa';
import './DashboardPage.css';

const DashboardOverviewPage = () => {
  const [projectCount, setProjectCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects(user.token);
        setProjectCount(data.length);
      } catch (error) { console.error(error); }
    };
    if (user) { fetchProjects(); }
  }, [user]);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-grid overview-grid">
        <Card title="Estadísticas Rápidas">
          <div className="stat-card">
            <FaProjectDiagram size={40} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{projectCount}</span>
              <span className="stat-label">Proyectos Activos</span>
            </div>
          </div>
        </Card>

        <Card title="Acciones Rápidas">
          <div className="actions-card">
            <Link to="/dashboard/projects" className="action-link">
              <span>Gestionar Proyectos</span>
              <FaArrowRight />
            </Link>
            <button className="action-link placeholder">
              <span>Nueva Búsqueda Bibliográfica</span>
              <FaArrowRight />
            </button>
          </div>
        </Card>

        <div className="summarizer-widget">
          <Summarizer />
        </div>

        {/* --- NUEVO WIDGET AÑADIDO --- */}
        <div className="suggester-widget">
          <ArticleSuggester />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;