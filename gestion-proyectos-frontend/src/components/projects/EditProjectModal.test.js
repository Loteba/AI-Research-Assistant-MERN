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
  const { container } = render(
    <EditProjectModal isOpen={true} onClose={() => {}} projectData={projectData} setProjectData={setProjectData} handleSubmit={handleSubmit} />
  );
  const nameInput = container.querySelector('input[name="name"]');
  const descInput = container.querySelector('textarea[name="description"]');
  const areaInput = container.querySelector('input[name="areaTematica"]');
  fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });
  fireEvent.change(descInput, { target: { value: 'Nueva Desc' } });
  fireEvent.change(areaInput, { target: { value: 'Ciberseguridad' } });
  fireEvent.click(screen.getByText(/Actualizar Proyecto/i));
  expect(handleSubmit).toHaveBeenCalled();
});