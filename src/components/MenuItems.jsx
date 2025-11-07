import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useMenuItems = () => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = useMemo(() => user?.role=== 'super-admin');

  const items = useMemo(() => {
    // Guard while auth state is rehydrating or user not available yet
    if (!user) return [];

    // 👤 Non super-admin (regular user) menu
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
        }
      ];
    }

    // 🧑‍💼 Super Admin menu
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
      }
    ];
  }, [user, isSuperAdmin]);

  return { items };
};

export default useMenuItems;
