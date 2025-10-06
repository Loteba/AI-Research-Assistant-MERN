const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    getTasksForProject, 
    createTaskForProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .put(protect, updateProject)
    .delete(protect, deleteProject);

// Rutas para las tareas, ahora usando el parámetro :id consistentemente
router.route('/:id/tasks')
    .get(protect, getTasksForProject)
    .post(protect, createTaskForProject);

module.exports = router;