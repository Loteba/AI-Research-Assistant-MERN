import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './CreateProjectModal.css';

// Se añaden 'areaTematica' y 'setAreaTematica' a las props del componente.
const CreateProjectModal = ({ isOpen, onClose, name, setName, description, setDescription, areaTematica, setAreaTematica, handleSubmit }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Proyecto</h2>
          <button onClick={onClose} className="close-btn"><FaTimes /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre-proyecto">Nombre del Proyecto</label>
              <input
                id="nombre-proyecto"
                type="text"
                placeholder="Ej: Análisis de Sentimiento en Redes Sociales"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion-proyecto">Descripción</label>
              <textarea
                id="descripcion-proyecto"
                placeholder="Describe el objetivo principal y el alcance de tu investigación."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            {/* --- NUEVO CAMPO AÑADIDO --- */}
            <div className="form-group">
              <label htmlFor="area-tematica">Área Temática</label>
              <input
                id="area-tematica"
                type="text"
                placeholder="Ej: Inteligencia Artificial, Ciberseguridad, etc."
                value={areaTematica}
                onChange={(e) => setAreaTematica(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-button">Guardar Proyecto</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;