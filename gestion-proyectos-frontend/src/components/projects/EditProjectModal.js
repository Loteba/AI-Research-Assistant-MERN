// frontend/src/components/projects/EditProjectModal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';
// Reutilizamos los mismos estilos del modal de creación para mantener la consistencia
import './CreateProjectModal.css';

const EditProjectModal = ({ isOpen, onClose, projectData, setProjectData, handleSubmit }) => {
  if (!isOpen) {
    return null;
  }

  // Un manejador de cambios genérico para todos los campos del formulario
  const onChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Proyecto</h2>
          <button onClick={onClose} className="close-btn"><FaTimes /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="form-group">
              <label>Nombre del Proyecto</label>
              <input
                type="text"
                name="name" // El 'name' debe coincidir con la clave en el estado
                value={projectData.name}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description" // El 'name' debe coincidir con la clave en el estado
                value={projectData.description}
                onChange={onChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Área Temática</label>
              <input
                type="text"
                name="areaTematica" // El 'name' debe coincidir con la clave en el estado
                value={projectData.areaTematica}
                onChange={onChange}
                required
              />
            </div>
            <button type="submit" className="form-button">Actualizar Proyecto</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;