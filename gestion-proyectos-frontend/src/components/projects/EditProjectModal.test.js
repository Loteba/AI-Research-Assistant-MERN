// Prueba inicial para EditProjectModal
import { render, fireEvent, screen } from '@testing-library/react';
import EditProjectModal from './EditProjectModal';

test('renderiza EditProjectModal sin crashear', () => {
  render(<EditProjectModal isOpen={true} onClose={()=>{}} projectData={{}} setProjectData={()=>{}} handleSubmit={()=>{}} />);
});

test('permite editar y enviar el formulario', () => {
  const handleSubmit = jest.fn();
  const setProjectData = jest.fn();
  const projectData = { name: 'Proyecto X', description: 'Desc', areaTematica: 'IA' };
  render(
    <EditProjectModal isOpen={true} onClose={() => {}} projectData={projectData} setProjectData={setProjectData} handleSubmit={handleSubmit} />
  );
  fireEvent.change(screen.getByLabelText(/Nombre del Proyecto/i), { target: { value: 'Nuevo Nombre' } });
  fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Nueva Desc' } });
  fireEvent.change(screen.getByLabelText(/Área Temática/i), { target: { value: 'Ciberseguridad' } });
  fireEvent.click(screen.getByText(/Actualizar Proyecto/i));
  expect(handleSubmit).toHaveBeenCalled();
});