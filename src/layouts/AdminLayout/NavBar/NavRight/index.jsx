import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

// react-bootstrap
import { ListGroup, Dropdown, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';
import { logout } from '../../../../redux/slices/AuthSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || 'User';
  const userRole = user?.role || 'User';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const removeToken = () => {
    dispatch(logout());
    // localStorage.removeItem('token');
    navigate('/auth/login');
  }

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">

      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={user?.profile_image || user?.profile_picture || user?.image_url || avatar2} style={{ width: 50, height: 50, }} alt="userimage" className="user-avatar" />
            <span>
              <span className="user-name">{userName}</span>
              <span className="user-desc">{userRole
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
            {/* <Dropdown.Header className="pro-head">
              <h5 className="text-overflow m-0">
                <span className="badge bg-light-success">Pro</span>
              </h5>
            </Dropdown.Header> */}
            <Link to="/users/user-profile" className="dropdown-item">
              <i className="feather icon-user" /> Profile
            </Link>
            {/* <Link to="/auth/signin-2" className="dropdown-item">
              <i className="feather icon-lock" /> Lock Screen
            </Link> */}
            <Link to="/auth/login" className="dropdown-item" onClick={() => {removeToken()}}>
              <i className="material-icons-two-tone">chrome_reader_mode</i> Logout
            </Link>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
