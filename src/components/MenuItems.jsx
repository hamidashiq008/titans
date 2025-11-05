import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const useMenuItems = () => {
  const { user } = useSelector((state) => state.auth, (prev, next) => {
    // Only re-render if the user's roles have changed
    const prevRoles = prev.user?.roles?.map(r => r.name).sort().join(',');
    const nextRoles = next.user?.roles?.map(r => r.name).sort().join(',');
    return prevRoles === nextRoles;
  });

  // Memoize the menu items to prevent unnecessary re-renders
  return useMemo(() => {
    const isSuperAdmin = user?.role === 'super-admin';

    // Dashboard menu item (only for super-admin)
    const dashboardMenuItem = isSuperAdmin ? [{
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
    }] : [];

    // Users menu items (only for super-admin)
    const userMenuItems = [];

    if (isSuperAdmin) {
      userMenuItems.push(
        {
          id: 'add-user',
          title: 'Add User',
          type: 'item',
          url: '/users/add-user'
        },
        {
          id: 'list-users',
          title: 'List Users',
          type: 'item',
          url: '/users/list-users'
        }
      );
    }

    // Common menu items for all roles
    const commonMenuItems = [
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
              ...(isSuperAdmin ? [{
                id: 'add-car',
                title: 'Add Car',
                type: 'item',
                url: '/cars/add-cars'
              }] : []),
              {
                id: 'list-cars',
                title: 'List Cars',
                type: 'item',
                url: '/cars/list-cars'
              }
            ]
          }
        ]
      },
      // Only include Users group if there are user menu items
      ...(userMenuItems.length > 0 ? [{
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
            children: userMenuItems
          }
        ]
      }] : [])
    ];

    return {
      items: [
        ...dashboardMenuItem,
        ...commonMenuItems
      ]
    };
  }, [user?.roles]); // Only recalculate when user roles change
};

export default useMenuItems;
