const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const axios = require('axios');

// @desc    Obtener todas las tareas de un proyecto
const getTasksForProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) { res.status(404); throw new Error('Proyecto no encontrado'); }
    const isMember = project.members.some(member => member.user.equals(req.user._id));
    if (!project.owner.equals(req.user._id) && !isMember) { res.status(403); throw new Error('No tienes permiso para ver las tareas de este proyecto.'); }
    const tasks = await Task.find({ project: projectId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
});

// @desc    Crear una nueva tarea para un proyecto
const createTaskForProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title } = req.body;

    if (!title) {
        res.status(400); throw new Error('El título de la tarea es requerido.');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404); throw new Error('Proyecto no encontrado');
    }

    if (!project.owner.equals(req.user._id)) {
        res.status(403); throw new Error('Solo el dueño del proyecto puede crear tareas.');
    }

    const task = await Task.create({
        title,
        project: projectId,
        user: req.user.id,
        status: 'Pendiente',
    });

    if (task && process.env.N8N_TASK_WEBHOOK_URL) {
        try {
            const webhookData = {
                projectName: project.name,
                taskTitle: task.title,
                assignedToEmail: req.user.email,
                // ======================================================================
                // CORRECCIÓN FINAL Y DEFINITIVA
                // Usamos el nombre exacto de tu plantilla n8n: 'assignerName'
                assignerName: req.user.name,
                // ======================================================================
            };
            console.log('Disparando webhook de n8n para nueva tarea con datos:', webhookData);
            await axios.post(process.env.N8N_TASK_WEBHOOK_URL, webhookData);
            console.log('Webhook de tarea disparado exitosamente.');
        } catch (error) {
            console.error('Error al disparar el webhook de n8n para la tarea:', error.message);
        }
    }

    res.status(201).json(task);
});

module.exports = {
    getTasksForProject,
    createTaskForProject,
};