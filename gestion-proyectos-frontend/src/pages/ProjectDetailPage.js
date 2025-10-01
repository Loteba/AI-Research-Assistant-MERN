import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import projectService from '../services/projectService';
import Card from '../components/common/Card';
import { FaPlus, FaTasks, FaArrowLeft } from 'react-icons/fa';
import './DashboardPage.css';

const ProjectDetailPage = () => {
  const [project, setProject] = useState(null); // Estado para guardar detalles del proyecto
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Necesitamos una función para obtener el proyecto, la añadiremos al servicio
        // Por ahora, cargamos las tareas
        const data = await projectService.getTasksForProject(projectId, user.token);
        setTasks(data);
      } catch (error) { console.error(error); }
    };
    if (user) fetchProjectData();
  }, [projectId, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const newTask = await projectService.createTaskForProject(projectId, { title: newTaskTitle }, user.token);
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    } catch (error) { console.error(error); }
  };

  return (
    <div>
      <Link to="/dashboard/projects" className="back-link"><FaArrowLeft /> Volver a Proyectos</Link>
      <div className="dashboard-header">
        <h1>Tareas del Proyecto</h1>
      </div>

      <Card title="Añadir Nueva Tarea" icon={<FaPlus />}>
        <form onSubmit={handleCreateTask} className="new-task-form">
          <input
            type="text"
            placeholder="¿Cuál es la siguiente tarea?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit">Añadir Tarea</button>
        </form>
      </Card>

      <div style={{ marginTop: '2rem' }}>
        <Card title="Lista de Tareas" icon={<FaTasks />}>
          {tasks.length > 0 ? (
            <ul className="task-list">
              {tasks.map(task => (
                <li key={task._id}>
                  <span>{task.title}</span>
                  <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-projects-msg">No hay tareas para este proyecto. ¡Añade la primera!</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailPage;