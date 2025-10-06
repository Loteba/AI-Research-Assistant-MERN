const asyncHandler = require('express-async-handler');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const axios = require('axios');

// OBTENER TODOS LOS PROYECTOS DEL USUARIO
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(projects);
});

// CREAR UN NUEVO PROYECTO
const createProject = asyncHandler(async (req, res) => {
  const { name, description, areaTematica } = req.body;
  if (!name || !description || !areaTematica) {
    res.status(400);
    throw new Error('Por favor, completa todos los campos');
  }
  const project = await Project.create({ name, description, areaTematica, user: req.user.id });
  if (project && process.env.N8N_PROJECT_WEBHOOK_URL) {
    try {
      await axios.post(process.env.N8N_PROJECT_WEBHOOK_URL, {
        projectName: project.name, projectDescription: project.description,
        userName: req.user.name, userEmail: req.user.email,
      });
    } catch (error) {
      console.error('Error al disparar el webhook de n8n:', error.message);
    }
  }
  res.status(201).json(project);
});

// ACTUALIZAR UN PROYECTO
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Proyecto no encontrado'); }
  if (project.user.toString() !== req.user.id) { res.status(401); throw new Error('No autorizado'); }
  const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedProject);
});

// ELIMINAR UN PROYECTO
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Proyecto no encontrado'); }
  if (project.user.toString() !== req.user.id) { res.status(401); throw new Error('No autorizado'); }
  await Task.deleteMany({ project: req.params.id });
  await project.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// OBTENER TAREAS DE UN PROYECTO
const getTasksForProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project || project.user.toString() !== req.user.id) {
        res.status(404); throw new Error('Proyecto no encontrado o no autorizado');
    }
    const tasks = await Task.find({ project: req.params.id });
    res.status(200).json(tasks);
});

// CREAR TAREA PARA UN PROYECTO
const createTaskForProject = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project || project.user.toString() !== req.user.id) {
        res.status(404); throw new Error('Proyecto no encontrado o no autorizado');
    }
    const task = await Task.create({
        title,
        project: req.params.id,
        user: req.user.id,
        status: 'Pendiente',
    });
    if (task && process.env.N8N_TASK_WEBHOOK_URL) {
        try {
            await axios.post(process.env.N8N_TASK_WEBHOOK_URL, {
                projectName: project.name,
                taskTitle: task.title,
                assignedToEmail: req.user.email,
                assignerName: req.user.name,
            });
        } catch (error) {
            console.error('Error al disparar webhook de tarea:', error.message);
        }
    }
    res.status(201).json(task);
});

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasksForProject,
  createTaskForProject,
};