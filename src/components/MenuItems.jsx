import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useMenuItems = () => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = useMemo(() => user?.role === 'super-admin');

  const items = useMemo(() => {
    // ===========================
    // Not logged in: Only Login
    // ===========================
    if (!user) {
      return [
        {
          id: 'auth',
          title: 'Login',
          type: 'group',
          icon: 'material-icons-two-tone',
          iconname: 'login',
          children: [
            {
              id: 'login-item',
              title: 'Login',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'login',
              url: '/auth/login'
            }
          ]
        }
      ];
    }

    // ===========================
    // Non Super Admin
    // ===========================
    if (!isSuperAdmin) {
      return [
        {
          id: 'car',
          title: 'Cars',
          type: 'group',
          icon: 'icon-navigation',
          children: [
            {
              id: 'cars',
              title: 'Cars',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'directions_car',
              url: '/cars/list-cars'
            }
          ]
        },

        // ⭐ LOGOUT WITH ICON
        {
          id: 'logout',
          title: 'Logout',
          type: 'group',
          icon: 'material-icons-two-tone',
          iconname: 'exit_to_app',   // ⭐ switch out icon
          children: [
            {
              id: 'logout-item',
              title: 'Logout',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'exit_to_app',   // ⭐ switch out icon
              url: '/auth/logout'
            }
          ]
        }

      ];
    }

    // ===========================
    // Super Admin Menu

    return [
      {
        id: 'navigation',
        title: 'Navigation',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'material-icons-two-tone',
            iconname: 'home',
            url: '/dashboard/sales'
          }
        ]
      },

      {
        id: 'car',
        title: 'Cars',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'cars',
            title: 'Cars',
            type: 'collapse',
            icon: 'material-icons-two-tone',
            iconname: 'directions_car',
            children: [
              { id: 'add-car', title: 'Add Car', type: 'item', url: '/cars/add-cars' },
              { id: 'list-cars', title: 'List Cars', type: 'item', url: '/cars/list-cars' }
            ]
          }
        ]
      },

      {
        id: 'users',
        title: 'Users',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'users',
            title: 'Users',
            type: 'collapse',
            icon: 'material-icons-two-tone',
            iconname: 'people',
            children: [
              { id: 'add-user', title: 'Add User', type: 'item', url: '/users/add-user' },
              { id: 'list-users', title: 'List Users', type: 'item', url: '/users/list-users' }
            ]
          }
        ]
      },

      // ⭐ LOGOUT WITH ICON
      {
        id: 'logout',
        title: 'Logout',
        type: 'group',
        icon: 'material-icons-two-tone',
        iconname: 'exit_to_app',   // ⭐ switch out icon
        children: [
          {
            id: 'logout-item',
            title: 'Logout',
            type: 'item',
            icon: 'material-icons-two-tone',
            iconname: 'exit_to_app',   // ⭐ switch out icon
            url: '/auth/logout'
          }
        ]
      }

    ];
  }, [user, isSuperAdmin]);

  return { items };
};

export default useMenuItems;
