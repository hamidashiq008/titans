import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/AuthSlice';

export default function Logout() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      // Clear redux auth state
      dispatch(logout());
      // Ensure any other legacy token key is removed
    //   localStorage.removeItem('token');
    } finally {
      // Redirect to login
      window.location.replace('/auth/login');
    }
  }, [dispatch]);

  return null;
}
