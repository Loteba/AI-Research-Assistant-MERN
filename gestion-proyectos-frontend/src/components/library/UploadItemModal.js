// frontend/src/components/library/UploadItemModal.js
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
// Reutilizaremos los estilos del modal de creación de proyectos para mantener la consistencia
import '../projects/CreateProjectModal.css';

const UploadItemModal = ({ isOpen, onClose, handleSubmit }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  
  // Usamos un estado para el feedback de carga, aunque la lógica principal está en la página
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Por favor, selecciona un archivo PDF.");
      return;
    }
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('tags', tags);
    formData.append('pdf', file);
    
    // La función handleSubmit viene de LibraryPage y manejará la subida
    await handleSubmit(formData);

    setIsUploading(false);
    onClose(); // Cierra el modal después de enviar
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Añadir Nuevo Paper</h2>
          <button onClick={onClose} className="close-btn"><FaTimes /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={onFormSubmit}>
            <div className="form-group">
              <label htmlFor="archivo-pdf">Archivo PDF</label>
              <input 
                id="archivo-pdf"
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="titulo-paper">Título del Paper</label>
              <input 
                id="titulo-paper"
                type="text" 
                placeholder="Título del Paper" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="resumen-paper">Breve Resumen (Opcional)</label>
              <textarea 
                id="resumen-paper"
                placeholder="Breve resumen (opcional)" 
                value={summary} 
                onChange={(e) => setSummary(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="etiquetas-paper">Etiquetas</label>
              <input 
                id="etiquetas-paper"
                type="text" 
                placeholder="Etiquetas (separadas por comas)" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
              />
            </div>
            <button type="submit" className="form-button" disabled={isUploading}>
              {isUploading ? 'Guardando...' : 'Guardar en Biblioteca'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadItemModal;