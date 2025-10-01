// src/pages/LibraryPage.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import libraryService from '../services/libraryService';
import { FaFileUpload, FaBookOpen } from 'react-icons/fa';
import './LibraryPage.css';

const UploadForm = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Por favor, selecciona un archivo PDF.'); return; }
    setIsSubmitting(true); setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('tags', tags);
    formData.append('itemType', 'pdf');
    formData.append('pdfFile', pdfFile);

    try {
      // El servicio usa interceptor; el token que pasamos se ignora si existe.
      const newItem = await libraryService.uploadItem(formData, user?.token);
      onUploadSuccess(newItem); // <- disparará el refetch en la página
      setTitle(''); setSummary(''); setTags(''); setPdfFile(null); e.target.reset();
    } catch (err) {
      setError('Error al subir el archivo: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-body">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="form-group">
        <label>Título (opcional)</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Resumen</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)}></textarea>
      </div>
      <div className="form-group">
        <label>Etiquetas (separadas por coma)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, mongodb, ia" />
      </div>
      <div className="form-group">
        <label>Archivo PDF *</label>
        <input type="file" onChange={(e) => setPdfFile(e.target.files[0])} required accept=".pdf" />
      </div>
      <button type="submit" className="upload-button" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar en Biblioteca'}
      </button>
    </form>
  );
};

const LibraryPage = () => {
  const [libraryItems, setLibraryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  // Debounce timer ref
  const debounceRef = useRef(null);

  // ---- Función central para obtener items ----
  const fetchItems = async (term = '') => {
    // Si no hay usuario autenticado, no pedimos
    if (!user?.token) return;

    setIsLoading(true);
    setError('');
    try {
      // El servicio es compatible: getItems(token, search) | getItems(search)
      const items = await libraryService.getItems(term.trim());
      setLibraryItems(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error('Library fetch error:', e);
      setError('No se pudo cargar tu biblioteca.');
      setLibraryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial al montar (trae TODO)
  useEffect(() => {
    if (!user?.token) return;
    fetchItems('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  // Búsqueda con debounce (500ms)
  useEffect(() => {
    if (!user?.token) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(searchTerm);
    }, 500);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, user?.token]);

  // Refrescar lista tras subir
  const handleUploadSuccess = async (newItem) => {
    // Opcional: si coincide con el filtro actual, lo metemos al inicio para feedback instantáneo
    const matchesFilter =
      !searchTerm ||
      newItem?.title?.toLowerCase?.().includes?.(searchTerm.toLowerCase());

    if (matchesFilter) {
      setLibraryItems(prev => [newItem, ...prev]);
    }

    // Pero en cualquier caso, hacemos refetch del servidor para no desincronizar
    await fetchItems('');
    setSearchTerm(''); // limpiamos búsqueda para mostrar todo
  };

  return (
    <div className="library-page">
      <h2>Mi Biblioteca Personal</h2>

      <div className="library-container">
        <div className="library-form-column">
          <div className="content-card">
            <div className="card-header">
              <FaFileUpload />
              <h3>Añadir Nuevo PDF</h3>
            </div>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        <div className="library-list-column">
          <div className="content-card">
            <div className="card-header">
              <FaBookOpen />
              <h3>Recursos Guardados</h3>
            </div>

            <div className="card-body">
              <input
                type="text"
                placeholder="Buscar en la biblioteca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="library-search-input"
              />

              {isLoading && <p>Buscando...</p>}
              {!isLoading && error && <p style={{ color: 'red' }}>{error}</p>}

              {!isLoading && !error && (
                <>
                  {libraryItems.length === 0 ? (
                    <p>No se encontraron resultados para "{searchTerm}" o tu biblioteca está vacía.</p>
                  ) : (
                    <ul className="resource-list">
                      {libraryItems.map((item) => (
                        <li key={item._id} className="resource-list-item">
                          <div>
                            <h4>{item.title}</h4>
                            <p>{item.summary || 'Sin resumen.'}</p>

                            {item.tags && item.tags.length > 0 && (
                              <div className="tags-container">
                                {item.tags.map((tag, index) => (
                                  <span key={index} className="tag-item">{tag}</span>
                                ))}
                              </div>
                            )}

                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-action-button"
                              >
                                Abrir Recurso
                              </a>
                            )}
                          </div>

                          <div style={{ marginTop: 6 }}>
                            <span
                              style={{
                                background: item.itemType === 'pdf' ? '#fef3c7' : '#e0f2fe',
                                border: '1px solid #ddd',
                                padding: '2px 8px',
                                borderRadius: 999,
                                fontSize: 12
                              }}
                            >
                              {item.itemType}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
