import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../axios/Axios';
import { X } from 'react-feather';
import { useNavigate } from 'react-router-dom';
const AddUser = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: '',
        password: '',
        password_confirmation: '',
        is_active: true,
        profile_picture: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch roles from API
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/roles');
                setRoles(response.data.roles || []);
            } catch (error) {
                console.error('Error fetching roles:', error);

                setRoles([
                    { id: 'user', name: 'User' },
                    { id: 'admin', name: 'Admin' }
                ]);

            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();

        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData(prev => ({
            ...prev,
            profile_picture: file
        }));
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setFormData(prev => ({
            ...prev,
            profile_picture: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validate passwords match
        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            const fd = new FormData();

            // Append all form data except password_confirmation
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'password_confirmation') return;
                if (value !== null && value !== undefined) {
                    fd.append(key, value);
                }
            });

            const response = await axios.post('/users', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('User added successfully');

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                role: '',
                password: '',
                password_confirmation: '',
                is_active: true,
                profile_picture: null
            });

            navigate('/users/list-users')
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Failed to add user';
            console.error(error);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className=''>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <h3 className="mb-4 text-center">Add New User</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            {/* Profile Picture */}
                            {/* <div className="col-12 text-center mb-4">
                                <div className="position-relative d-inline-block">
                                    <div className="rounded-circle overflow-hidden" style={{ width: '150px', height: '150px', border: '2px solid #dee2e6' }}>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile preview"
                                                className="img-fluid h-100 w-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="bg-light h-100 d-flex align-items-center justify-content-center">
                                                <i className="fas fa-user text-muted" style={{ fontSize: '4rem' }}></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="file"
                                            id="profile_picture"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="profile_picture"
                                            className="btn btn-sm btn-outline-primary me-2"
                                        >
                                            {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                        </label>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={removeImage}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div> */}

                            {/* Name */}
                            <div className="col-md-6">
                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter full name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="col-md-6">
                                <label className="form-label">Email <span className="text-danger">*</span></label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter email address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="col-md-6">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="Enter phone number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Role */}
                            <div className="col-md-6">
                                <label className="form-label">Role <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoading && <div className="form-text">Loading roles...</div>}
                            </div>

                            {/* Password */}
                            <div className="col-md-6">
                                <label className="form-label">Password <span className="text-danger">*</span></label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                />
                                <small className="text-muted">Password must be at least 8 characters long</small>
                            </div>

                            {/* Confirm Password */}
                            <div className="col-md-6">
                                <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Address */}
                            {/* <div className="col-12">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Enter address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                ></textarea>
                            </div> */}

                            {/* Active Status */}
                            {/* <div className="col-12">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_active">
                                        Active Account
                                    </label>
                                </div>
                            </div> */}

                            {/* Submit Button */}
                            <div className="col-12 text-center mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding...
                                        </>
                                    ) : 'Add User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default AddUser
