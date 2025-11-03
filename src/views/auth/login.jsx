import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// react-bootstrap
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import logoDark from 'assets/images/logo-dark.svg';
import axios from '../../axios/Axios';
import { toast } from 'react-toastify';

// -----------------------|| SIGNIN 1 ||-----------------------//

export default function SignIn1() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', {
        email,
        password
      });
      setLoginData(res.data);
      console.log('res', res);
      localStorage.setItem('access_token', res.data.access_token);
      toast.success('Logged in successfully');
      navigate('/dashboard/sales');

    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                {/* <img src={logoDark} alt="" className="img-fluid mb-4" /> */}
                <h3 className="mb-3">Titans</h3>

                <h5 className="mb-3 f-w-400">Signin</h5>
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="mail" />
                  </InputGroup.Text>
                  <Form.Control type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="lock" />
                  </InputGroup.Text>
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </InputGroup>
                <Form.Group>
                  <Form.Check type="checkbox" className="text-left mb-4 mt-2" label="Save Credentials." checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                </Form.Group>
                <Button className="btn btn-block btn-primary mb-4" onClick={handleLogin} disabled={loading}>
                  {loading ? 'Signing in…' : 'Signin'}
                </Button>
                {/* <p className="mb-2 text-muted">
                  Forgot password?{' '}
                  <NavLink to="#" className="f-w-400">
                    Reset
                  </NavLink>
                </p>
                <p className="mb-0 text-muted">
                  Don’t have an account?{' '}
                  <NavLink to="/register" className="f-w-400">
                    Signup
                  </NavLink>
                </p> */}
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}

