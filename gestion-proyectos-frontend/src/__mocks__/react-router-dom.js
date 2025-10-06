import React from 'react';

// Mock minimal para tests: useNavigate y componentes básicos
const useNavigate = () => jest.fn();
const useParams = () => {
  // Parse last segment from pathname as id-like param
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const parts = path.split('/').filter(Boolean);
  return { id: parts[parts.length - 1] || undefined, projectId: parts[parts.length - 1] || undefined };
};

const Routes = ({ children }) => <div>{children}</div>;
const Route = ({ element }) => element || null;
const Navigate = ({ to }) => <div data-testid="navigate">{to}</div>;
const Outlet = () => <div data-testid="outlet" />;

// Simple router components for tests
const BrowserRouter = ({ children }) => <div>{children}</div>;
const MemoryRouter = ({ children }) => <div>{children}</div>;

const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;
const NavLink = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

export { useNavigate, useParams, Routes, Route, Navigate, Outlet, BrowserRouter, MemoryRouter, Link, NavLink };
export default {
  useNavigate,
  useParams,
  Routes,
  Route,
  Navigate,
  Outlet,
  BrowserRouter,
  MemoryRouter,
  Link,
  NavLink,
};
