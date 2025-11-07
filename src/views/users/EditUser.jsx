import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios/Axios';
import { toast } from 'react-toastify';

export default function EditUser() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialFromState = location.state?.user;
  const [loading, setLoading] = useState(!initialFromState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    status: 'inactive',
    profile_picture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user if not provided
  useEffect(() => {
    const fill = (u) => {
      setForm({
        name: u?.name || '',
        email: u?.email || '',
        phone: u?.phone || '',
        address: u?.address || '',
        role: u?.roles?.length ? u.roles[0].name : (u?.role || ''),
        status: u?.status || 'inactive',
        profile_picture: null,
      });
      setImagePreview(u?.profile_picture_url || u?.profile_image || u?.avatar || u?.image_url || null);
    };

    if (initialFromState) {
      fill(initialFromState);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/users/${id}`);
        fill(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, initialFromState]);

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setForm((p) => ({ ...p, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      if (form.phone) fd.append('phone', form.phone);
      if (form.address) fd.append('address', form.address);
      if (form.role) fd.append('role', form.role);
      if (form.status) fd.append('status', form.status);
      if (form.profile_picture instanceof File) fd.append('profile_picture', form.profile_picture);

      await axios.post(`/users/${id}?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('User updated successfully');
      navigate('/users/list-users');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4">Loading…</div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">Edit User</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={onChange} required />
            </div>
            {/* <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={onChange} />
            </div> */}
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={onChange} required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={onChange} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* <div className="col-md-6">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} name="address" value={form.address} onChange={onChange} />
            </div> */}
            <div className="col-md-6">
              <label className="form-label">Profile Picture</label>
              <input className="form-control" type="file" accept="image/*" onChange={onChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 rounded border" style={{ width: 120, height: 120, objectFit: 'cover' }} />
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
