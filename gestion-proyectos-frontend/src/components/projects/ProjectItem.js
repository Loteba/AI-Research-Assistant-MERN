import React from 'react';
// Se elimina 'Link' y se reemplaza 'FaEye' por 'FaPen'
import { FaPen, FaTrash } from 'react-icons/fa';
import './ProjectItem.css';

// Se añaden las funciones 'onDelete' y 'onEdit' a las props
const ProjectItem = ({ project, onDelete, onEdit }) => {
  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3>{project.name}</h3>
        {/* Se muestra el área temática */}
        <span className="area-tematica-chip">{project.areaTematica}</span>
      </div>
      <p className="project-card-description">{project.description}</p>
      {/* Se agrega un footer para mejor estructura */}
      <div className="project-card-footer">
        <small>Creado: {new Date(project.createdAt).toLocaleDateString()}</small>
        <div className="project-card-actions">
          {/* El botón ahora llama a la función onEdit */}
          <button onClick={() => onEdit(project)} className="action-btn view-btn">
            <FaPen /> Editar
          </button>
          {/* El botón ahora llama a la función onDelete */}
          <button onClick={() => onDelete(project._id)} className="action-btn delete-btn">
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;