import React, { useEffect, useState, useCallback, useMemo } from 'react';
import projectService from '../../services/projectService';
import './GreenProjectList.css';

// TTL de cache en ms (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY = 'projects_cache_v1';

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {
    // Ignore storage errors
  }
}

const ProjectItem = React.memo(function ProjectItem({ project, onLoadTasks }) {
  const [showTasks, setShowTasks] = useState(false);
  const toggle = async () => {
    if (!showTasks) await onLoadTasks(project.id);
    setShowTasks((s) => !s);
  };

  return (
    <div className="green-project-item">
      <div className="meta">
        <h3>{project.name}</h3>
        <p className="area">{project.areaTematica}</p>
        <p className="desc">{project.description}</p>
      </div>
      <div className="controls">
        <button onClick={toggle} aria-expanded={showTasks}>{showTasks ? 'Ocultar tareas' : 'Ver tareas'}</button>
      </div>
      {showTasks && project._tasks && (
        <ul className="tasks">
          {project._tasks.map((t) => (
            <li key={t.id}>{t.title} — <em>{t.status}</em></li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default function GreenProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = readCache();
      if (cached) {
        setProjects(cached);
        setLoading(false);
        // fetch in background to refresh cache (stale-while-revalidate)
        projectService.getProjects().then((fresh) => {
          writeCache(fresh);
          setProjects(fresh);
        }).catch(() => {});
        return;
      }

      const data = await projectService.getProjects();
      setProjects(data);
      writeCache(data);
    } catch (e) {
      setError(e.message || 'Error cargando proyectos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadTasksForProject = useCallback(async (projectId) => {
    // lazy-load tasks only when user expands the project
    try {
      const tasks = await projectService.getTasksForProject(projectId);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, _tasks: tasks } : p)));
    } catch (e) {
      // ignore task load errors, show nothing
    }
  }, []);

  const items = useMemo(() => projects.map((p) => (
    <ProjectItem key={p.id} project={p} onLoadTasks={loadTasksForProject} />
  )), [projects, loadTasksForProject]);

  if (loading) return <div className="green-list">Cargando proyectos…</div>;
  if (error) return <div className="green-list error">{error}</div>;

  return (
    <div className="green-list">
      <header className="green-list-header">
        <h2>Proyectos (Green)</h2>
        <small>Optimizado: cache en sesión, carga perezosa de tareas, componentes memoizados</small>
      </header>
      <div className="list">
        {items}
      </div>
    </div>
  );
}
