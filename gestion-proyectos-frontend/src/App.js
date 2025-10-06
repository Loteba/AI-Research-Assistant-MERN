import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import ProjectListPage from './pages/ProjectListPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProjectDetailPage from './pages/ProjectDetailPage';
import Chatbot from './components/ai/Chatbot';
import LibraryPage from './pages/LibraryPage';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="App">
      <Navbar />
      {user && <Chatbot />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="projects" element={<ProjectListPage />} />
            {/* ====================================================================== */}
            {/* RUTA CORREGIDA: de "projects/:projectId" a "project/:projectId" */}
            <Route path="project/:projectId" element={<ProjectDetailPage />} />
            {/* ====================================================================== */}
            <Route path="library" element={<LibraryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;