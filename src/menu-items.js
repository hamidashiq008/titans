// Read user role from Redux store (fallback only; primary menu is useMenuItems hook)
import { store } from './redux/store';
const getUserRole = () => (store.getState()?.auth?.user?.role) || '';

const isSuperAdmin = getUserRole() === 'super-admin';

// Menu configuration is now handled by the useMenuItems hook
// This is now just a fallback/static version
const menuItems = {
  items: [
    ...(isSuperAdmin ? [{
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'home',
          children: [
            {
              id: 'sales',
              title: 'Sales',
              type: 'item',
              url: '/dashboard/sales'
            }
          ]
        }
      ]
    }] : []),
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
          iconname: 'directions_car', // ✅ Car icon
          children: [
            {
              id: 'Add Car',
              title: 'Add Car',
              type: 'item',
              url: '/cars/add-cars'
            },
            {
              id: 'List Cars',
              title: 'List Cars',
              type: 'item',
              url: '/cars/list-cars',
            },
          ]
        }
      ]
    },
        {
      id: 'Users',
      title: 'Users',
      type: 'group',
      icon: 'material-icons-two-tone',
      iconname: 'people', // 👥 Users icon
      children: [
        {
          id: 'users',
          title: 'Users',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'people', // 👥 Users icon
          children: [
            {
              id: 'Add User',
              title: 'Add User',
              type: 'item',
              url: '/users/add-user'
            },
            {
              id: 'List Users',
              title: 'List Users',
              type: 'item',
              url: '/users/list-users',
            },
          ]
        },
         
      ]
    },
    
  ]
};

export default menuItems;
