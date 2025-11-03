import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../axios/Axios';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1
    });
    
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        is_active: true,
        profile_picture: null
    });
    
    const [imagePreview, setImagePreview] = useState(null);

    const fetchUsers = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const { data } = await axios.get('/users', {
                params: {
                    page,
                    per_page: pagination.perPage,
                    search
                }
            });
            
            if (Array.isArray(data)) {
                setUsers(data);
                setPagination(prev => ({
                    ...prev,
                    currentPage: 1,
                    total: data.length,
                    lastPage: 1
                }));
            } else {
                setUsers(data.data || []);
                setPagination({
                    currentPage: data.current_page || 1,
                    perPage: data.per_page || 10,
                    total: data.total || 0,
                    lastPage: data.last_page || 1
                });
            }
        } catch (e) {
            console.error('Error fetching users:', e);
            setError(e?.response?.data?.message || e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1, searchTerm);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        fetchUsers(page, searchTerm);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'user',
            is_active: user.is_active !== undefined ? user.is_active : true,
            profile_picture: null
        });
        
        if (user.profile_picture_url) {
            setImagePreview(user.profile_picture_url);
        } else {
            setImagePreview(null);
        }
        
        setShowModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            setEditForm(prev => ({
                ...prev,
                profile_picture: file
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };
    
    const removeImage = () => {
        if (imagePreview) {
            // Only revoke the URL if it's a blob URL (starts with 'blob:')
            if (imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
        }
        setEditForm(prev => ({
            ...prev,
            profile_picture: null  // This will be used to indicate removal
        }));
    };

    const closeModal = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        
        setShowModal(false);
        setEditingUser(null);
        setEditForm({
            name: '',
            email: '',
            phone: '',
            address: '',
            role: 'user',
            is_active: true,
            profile_picture: null
        });
    };

    const saveEdit = async () => {
        try {
            setSaving(true);
            const formData = new FormData();
            
            // Append all form data except profile_picture if it's null (meaning it was removed)
            Object.entries(editForm).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    // If this is an update and profile_picture is null, send a special flag
                    if (key === 'profile_picture' && value === null && editingUser) {
                        formData.append('remove_profile_picture', '1');
                    } else if (key !== 'profile_picture' || value !== null) {
                        formData.append(key, value);
                    }
                }
            });
            
            let response;
            if (editingUser) {
                // Update existing user
                response = await axios.post(`/users/${editingUser.id}?_method=PUT`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // Update the users list with the new data
                setUsers(users.map(user => {
                    if (user.id === editingUser.id) {
                        // If we removed the profile picture, ensure it's updated in the UI
                        if (editForm.profile_picture === null) {
                            return { ...response.data, profile_picture_url: null };
                        }
                        return response.data;
                    }
                    return user;
                }));
                
                toast.success('User updated successfully');
            } else {
                // Create new user
                response = await axios.post('/users', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // Add the new user to the list
                setUsers([response.data, ...users]);
                
                toast.success('User created successfully');
            }
            
            closeModal();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const askDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`/users/${userToDelete.id}`);
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            toast.success('User deleted successfully');
            cancelDelete();
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || e.message || 'Failed to delete user');
        } finally {
            setDeleting(false);
        }
    };
    return (
        <>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <div className="header d-flex justify-content-between align-items-center mb-4">
                        <h3 className="m-0">Users</h3>
                        <div className="d-flex gap-2">
                            <div className="search-box">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingUser(null);
                                    setEditForm({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        address: '',
                                        role: 'user',
                                        is_active: true,
                                        profile_picture: null
                                    });
                                    setImagePreview(null);
                                    setShowModal(true);
                                }}
                            >
                                <i className="fas fa-plus me-2"></i> Add User
                            </button>
                        </div>
                    </div>
                    
                    {loading && <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <div className="text-muted">No users found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    users
                                        .filter(user => {
                                            const search = searchTerm.toLowerCase();
                                            return (
                                                user.name?.toLowerCase().includes(search) ||
                                                user.email?.toLowerCase().includes(search) ||
                                                user.phone?.toLowerCase().includes(search) ||
                                                user.role?.toLowerCase().includes(search)
                                            );
                                        })
                                        .map((user, index) => (
                                            <tr key={user.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="avatar-wrapper">
                                                        {user.profile_picture_url ? (
                                                            <img 
                                                                src={user.profile_picture_url} 
                                                                alt={user.name} 
                                                                className="avatar"
                                                            />
                                                        ) : (
                                                            <div className="avatar-text">
                                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-medium">{user.name}</div>
                                                    <small className="text-muted">{user.address?.substring(0, 20)}{user.address?.length > 20 ? '...' : ''}</small>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{user.phone || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleEdit(user)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => askDelete(user)}
                                                            title="Delete"
                                                            disabled={user.role === 'admin'}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                        {pagination.total > 0 && (
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <div className="text-muted">
                                    Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} users
                                </div>
                                <nav aria-label="Page navigation">
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                        </li>
                                        
                                        {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                                            // Calculate page numbers to show (current page in the middle when possible)
                                            let pageNum;
                                            if (pagination.lastPage <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage >= pagination.lastPage - 2) {
                                                pageNum = pagination.lastPage - 4 + i;
                                            } else {
                                                pageNum = pagination.currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <li 
                                                    key={pageNum} 
                                                    className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}
                                                >
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        <li className={`page-item ${pagination.currentPage === pagination.lastPage ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.lastPage}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                    {/* Edit/Create User Modal */}
                    <Modal show={showModal} onHide={closeModal} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row g-3">
                                {/* Profile Picture */}
                                <div className="col-12 text-center mb-4">
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
                                                onChange={handleEditChange}
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
                                </div>

                                {/* Name */}
                                <div className="col-md-6">
                                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter full name"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
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
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        required
                                        disabled={!!editingUser}
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
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                    />
                                </div>

                                {/* Role */}
                                <div className="col-md-6">
                                    <label className="form-label">Role <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select" 
                                        name="role" 
                                        value={editForm.role} 
                                        onChange={handleEditChange}
                                        required
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>

                                {/* Password - Only show for new users or when changing password */}
                                {!editingUser && (
                                    <>
                                        <div className="col-md-6">
                                            <label className="form-label">Password <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Enter password"
                                                name="password"
                                                value={editForm.password || ''}
                                                onChange={handleEditChange}
                                                required={!editingUser}
                                                minLength="8"
                                            />
                                            <small className="text-muted">Password must be at least 8 characters long</small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Confirm password"
                                                name="password_confirmation"
                                                value={editForm.password_confirmation || ''}
                                                onChange={handleEditChange}
                                                required={!editingUser}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Address */}
                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Enter address"
                                        name="address"
                                        value={editForm.address}
                                        onChange={handleEditChange}
                                    ></textarea>
                                </div>

                                {/* Active Status */}
                                <div className="col-12">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            checked={editForm.is_active}
                                            onChange={handleEditChange}
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active Account
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={saveEdit} 
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {editingUser ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingUser ? 'Update User' : 'Create User'
                                )}
                            </button>
                        </Modal.Footer>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete <strong>{userToDelete?.name || 'this user'}</strong>? This action cannot be undone.</p>
                            {userToDelete?.role === 'admin' && (
                                <div className="alert alert-warning mb-0">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Warning: This is an admin user. Deleting admin users may affect system functionality.
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary" onClick={cancelDelete} disabled={deleting}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={confirmDelete} 
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete User'
                                )}
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>

        </>
    )
}

// Add some custom styles
const styles = `
    .avatar-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f2f5;
    }
    
    .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .avatar-text {
        font-weight: 600;
        color: #495057;
        text-transform: uppercase;
    }
    
    .search-box {
        position: relative;
        width: 250px;
    }
    
    .search-box .form-control {
        padding-left: 35px;
    }
    
    .search-box .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
    }
    
    .table th {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        border-top: none;
        border-bottom: 1px solid #dee2e6;
    }
    
    .table td {
        vertical-align: middle;
    }
`;

// Add styles to the document head
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default ListUsers;
