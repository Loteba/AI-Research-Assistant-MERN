// Prueba inicial para ProjectItem
import { render, fireEvent, screen } from '@testing-library/react';
import ProjectItem from './ProjectItem';

test('renderiza ProjectItem sin crashear', () => {
  render(<ProjectItem project={{name:'Test',createdAt:Date.now()}} onDelete={()=>{}} onEdit={()=>{}} />);
});

test('permite editar y eliminar un proyecto', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const project = { name: 'Proyecto', description: 'Desc', areaTematica: 'IA', createdAt: Date.now(), _id: '1' };
  render(<ProjectItem project={project} onEdit={onEdit} onDelete={onDelete} />);
  fireEvent.click(screen.getByText(/Editar/i));
  expect(onEdit).toHaveBeenCalledWith(project);
  fireEvent.click(screen.getByText(/Eliminar/i));
  expect(onDelete).toHaveBeenCalledWith('1');
});