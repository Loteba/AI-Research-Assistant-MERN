// Prueba inicial para CreateProjectModal
import { render, fireEvent, screen } from '@testing-library/react';
import CreateProjectModal from './CreateProjectModal';

test('renderiza CreateProjectModal sin crashear', () => {
  render(<CreateProjectModal isOpen={true} onClose={()=>{}} name="" setName={()=>{}} description="" setDescription={()=>{}} areaTematica="" setAreaTematica={()=>{}} handleSubmit={()=>{}} />);
});

test('permite crear un proyecto llenando y enviando el formulario', () => {
  const handleSubmit = jest.fn((e) => e.preventDefault());
  const setName = jest.fn();
  const setDescription = jest.fn();
  const setAreaTematica = jest.fn();
  render(
    <CreateProjectModal isOpen={true} onClose={() => {}} name="" setName={setName} description="" setDescription={setDescription} areaTematica="" setAreaTematica={setAreaTematica} handleSubmit={handleSubmit} />
  );
  fireEvent.change(screen.getByPlaceholderText(/Ej: Análisis de Sentimiento/i), { target: { value: 'Proyecto Nuevo' } });
  fireEvent.change(screen.getByPlaceholderText(/Describe el objetivo principal/i), { target: { value: 'Descripción Nueva' } });
  fireEvent.change(screen.getByPlaceholderText(/Ej: Inteligencia Artificial/i), { target: { value: 'IA' } });
  fireEvent.click(screen.getByText(/Guardar Proyecto/i));
  expect(handleSubmit).toHaveBeenCalled();
});