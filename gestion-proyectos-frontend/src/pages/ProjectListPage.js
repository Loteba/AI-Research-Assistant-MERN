import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import projectService from '../services/projectService';
import ProjectItem from '../components/projects/ProjectItem';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import { FaPlus } from 'react-icons/fa';
import './DashboardPage.css';

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [areaTematica, setAreaTematica] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects(user.token);
        setProjects(data);
      } catch (error) { console.error("Error al cargar proyectos:", error); }
    };
    if (user) { fetchProjects(); }
  }, [user]);

  const handleSubmit = async (e) => { /* ... (código sin cambios) ... */ };
  const handleDelete = async (projectId) => { /* ... (código sin cambios) ... */ };
  const handleEdit = (project) => { /* ... (código sin cambios) ... */ };
  const handleUpdate = async (e) => { /* ... (código sin cambios) ... */ };

  return (
    <>
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} name={name} setName={setName} description={description} setDescription={setDescription} areaTematica={areaTematica} setAreaTematica={setAreaTematica} handleSubmit={handleSubmit} />
      {currentProject && ( <EditProjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} projectData={currentProject} setProjectData={setCurrentProject} handleSubmit={handleUpdate} /> )}

      <div className="dashboard-header">
        <h1>Mis Proyectos</h1>
        <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Nuevo Proyecto
        </button>
      </div>
      
      {projects.length > 0 ? (
        <div className="project-list-container">
          {projects.map((project) => (
            <Link key={project._id} to={`/dashboard/project/${project._id}`} className="project-link-wrapper">
              <ProjectItem
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-projects-msg">
          <h3>No hay proyectos todavía</h3>
          <p>¡Haz clic en "Nuevo Proyecto" para empezar a organizar tu investigación!</p>
        </div>
      )}
    </>
  );
};

export default ProjectListPage;