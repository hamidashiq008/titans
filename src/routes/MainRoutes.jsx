


import { lazy, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import AddUser from '../views/users/AddUser';
const ListUsers = lazy(() => import('../views/users/ListUsers'));
import UserProfile from '../views/users/UserProfile';
const EditUser = lazy(() => import('../views/users/EditUser'));
// import { useNavigate } from 'react-router-dom';
// Lazy imports
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const AddCars = lazy(() => import('../views/cars/AddCars'));
const ListCars = lazy(() => import('../views/cars/ListCars'));
const ViewCar = lazy(() => import('../views/cars/ViewCar'));
const EditCar = lazy(() => import('../views/cars/EditCar'));
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));
const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));
const Sample = lazy(() => import('../views/sample'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

// ✅ Auth check helper (boolean)
const isAuthed = () => !!localStorage.getItem('access_token');

// ✅ Protected Route using useEffect to redirect unauthenticated
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const authed = isAuthed();

  useEffect(() => {
    if (!authed) {
      navigate('/auth/login', { replace: true });
    }
    setReady(true);
  }, [authed, navigate]);

  if (!authed) return null;
  if (!ready) return null;
  return children;
};

// ✅ Public Route using useEffect to redirect authenticated
const PublicRoute = ({ children }) => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const authed = isAuthed();

  useEffect(() => {
    if (authed) {
      navigate('/dashboard/sales', { replace: true });
    }
    setReady(true);
  }, [authed, navigate]);

  if (authed) return null;
  if (!ready) return null;
  return children;
};




const MainRoutes = {
  path: '/',
  children: [
    // Protected Admin Routes (only for logged-in users)
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: 'dashboard/sales', element: <DashboardSales /> },
        { path: 'cars/add-cars', element: <AddCars /> },
        { path: 'cars/list-cars', element: <ListCars /> },
        { path: 'cars/view/:id', element: <ViewCar /> },
        { path: 'cars/edit/:id', element: <EditCar /> },
        { path: 'users/add-user', element: <AddUser /> },
        { path: 'users/list-users', element: <ListUsers  /> },
        { path: 'users/edit/:id', element: <EditUser /> },
        { path: 'users/user-profile', element: <UserProfile /> },
        { path: 'typography', element: <Typography /> },
        { path: 'color', element: <Color /> },
        { path: 'icons/feather', element: <FeatherIcon /> },
        { path: 'icons/font-awesome-5', element: <FontAwesome /> },
        { path: 'icons/material', element: <MaterialIcon /> },
        { path: 'sample-page', element: <Sample /> },
        { path: '*', element: <h1>404 Not Found</h1> }
      ]
    },

    // Public Auth Routes (only for non-logged-in users)
    {
      path: '/auth',
      element: (
        <PublicRoute>
          <GuestLayout />
        </PublicRoute>
      ),
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> }
      ]
    },

    // Redirect default "/" depending on auth state
    {
      index: true,
      element: isAuthed()
        ? <Navigate to="/dashboard/sales" replace />
        : <Navigate to="/auth/login" replace />
    }
  ]
};

export default MainRoutes;

