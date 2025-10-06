const express = require('express');
const router = express.Router();
const { getTasksForProject, createTaskForProject } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/project/:projectId')
    .get(protect, getTasksForProject)
    .post(protect, createTaskForProject);

module.exports = router;