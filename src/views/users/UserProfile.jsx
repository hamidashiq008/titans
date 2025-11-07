import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import axios from '../../axios/Axios';
import { toast } from 'react-toastify';
import { setUser } from '../../redux/slices/AuthSlice';

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'U';
};

const maskPassword = (pwd) => {
    if (!pwd) return '********';
    return '*'.repeat(Math.max(8, String(pwd).length));
};

export default function UserProfile() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const initial = useMemo(() => ({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || user?.roles?.[0]?.name || '',
        status: user?.status || 'active',
        password: '',
        confirm_password: '',
        profile_picture: null,
    }), [user]);

    const [form, setForm] = useState(initial);
    const [preview, setPreview] = useState(user?.profile_picture || user?.avatar || user?.image_url || '');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setForm(initial);
        setPreview(user?.profile_picture || user?.avatar || user?.image_url || '');
    }, [initial, user]);

    const roleLabel = useMemo(() => {
        const role = form.role || 'user';
        return String(role)
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }, [form.role]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const onImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm((p) => ({ ...p, profile_picture: file }));
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id || saving) return;
        if (form.password && form.password !== form.confirm_password) {
            toast.error('Password and confirm password do not match');
            return;
        }
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('email', form.email);
            if (form.role) fd.append('role', form.role);
            if (form.status) fd.append('status', form.status);
            if (form.password) {
                fd.append('password', form.password);
                fd.append('password_confirmation', form.confirm_password || '');
            }
            if (form.profile_picture instanceof File) fd.append('profile_image', form.profile_picture);

            const { data } = await axios.post(`/auth/profile`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updated = data?.user || data;
            dispatch(setUser(updated));
            toast.success('Profile updated');
            setForm((p) => ({ ...p, password: '', confirm_password: '' }));
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Update failed';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container py-4">
            <Row className="g-4">
                {/* <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Body className="text-center">

                        </Card.Body>
                    </Card>
                </Col> */}
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header><strong>Edit Profile</strong></Card.Header>
                        <Card.Body>
                            <Form onSubmit={onSubmit}>
                                <Row className='mx-auto justify-content-center'>
                                    {preview ? (
                                                <div className="position-relative d-inline-block mb-3" style={{ width: 130  }}>
                                          <img
                                            src={preview}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: 120, height: 120, objectFit: 'cover' }}
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary position-absolute rounded-circle"
                                            style={{ bottom: 0, right: 0, borderRadius: '50% !important' }}
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Change profile image"
                                          >
                                            <i className="feather icon-camera" />
                                          </button>
                                        </div>
                                    ) : user?.profile_image || user?.profile_picture || user?.image_url ? (
                                        <div className="position-relative d-inline-block mb-3" style={{ width: 130  }}>
                                          <img
                                            src={user?.profile_image || user?.profile_picture || user?.image_url}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: 120, height: 120, objectFit: 'cover' }}
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary position-absolute"
                                            style={{ bottom: 0, right: 0, borderRadius: '50%' }}
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Change profile image"
                                          >
                                            <i className="feather icon-camera" />
                                          </button>
                                        </div>
                                    ) : (
                                        <div className="position-relative d-inline-block mb-3" style={{ width: 130  }}>
                                          <div
                                            className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center"
                                            style={{ width: 120, height: 120, fontSize: 36 }}
                                          >
                                            {getInitials(form.name)}
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary position-absolute"
                                            style={{ bottom: 0, right: 0, borderRadius: '50%' }}
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Change profile image"
                                          >
                                            <i className="feather icon-camera" />
                                          </button>
                                        </div>
                                    )}
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={onImageChange}
                                      style={{ display: 'none' }}
                                    />
                                    {/* <h5 className="mb-1">{form.name || 'User'}</h5>
                                    <div className="text-muted mb-2">{form.email || 'N/A'}</div>
                                    <Badge bg={form.status === 'active' ? 'success' : form.status === 'inactive' ? 'secondary' : 'warning'}>
                                        {String(form.status).charAt(0).toUpperCase() + String(form.status).slice(1)}
                                    </Badge> */}
                                </Row>
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control name="name" value={form.name} onChange={onChange} />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" name="email" value={form.email} onChange={onChange} />
                                    </Col>
                                    {/* <Col sm={6}>
                                        <Form.Label>Role</Form.Label>
                                        <Form.Control name="role" value={form.role} disabled onChange={onChange} />
                                    </Col>

                                    <Col sm={6}>
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select name="status" value={form.status} disabled onChange={onChange}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Form.Select>
                                    </Col> */}
                                    <Col sm={6}>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" name="password" value={form.password} placeholder={maskPassword('')} onChange={onChange} />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type="password" name="confirm_password" value={form.confirm_password} placeholder={maskPassword('')} onChange={onChange} />
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-end mt-3">
                                    <Button type="submit" variant="primary" disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
