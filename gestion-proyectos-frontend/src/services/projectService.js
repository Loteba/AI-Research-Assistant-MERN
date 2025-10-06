import axios from 'axios';

const API_URL = '/api/projects/';

const getProjects = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};
const createProject = async (projectData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, projectData, config);
    return response.data;
};
const updateProject = async (projectId, projectData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + projectId, projectData, config);
    return response.data;
};
const deleteProject = async (projectId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(API_URL + projectId, config);
    return response.data;
};
const getTasksForProject = async (projectId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + projectId + '/tasks', config);
    return response.data;
};
const createTaskForProject = async (projectId, taskData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + projectId + '/tasks', taskData, config);
    return response.data;
};

const projectService = {
    getProjects, createProject, updateProject, deleteProject,
    getTasksForProject, createTaskForProject,
};

export default projectService;