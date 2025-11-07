import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from "../../axios/Axios";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ListUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    status: "inactive",
    profile_picture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const { data } = await axios.get("/users", {
        params: {
          page,
          per_page: pagination.perPage,
          search,
        },
      });

      const list = Array.isArray(data.data) ? data.data : data;
      setUsers(list);
      setPagination((prev) => ({
        ...prev,
        total: list.length,
        currentPage: 1,
        lastPage: 1,
      }));
    } catch (e) {
      console.error("Error fetching users:", e);
      setError(e?.response?.data?.message || e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, [searchTerm]);

  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`, { state: { user } });
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setEditForm((prev) => ({ ...prev, profile_picture: file }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const closeModal = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setShowModal(false);
    setEditingUser(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "",
      status: "inactive",
      profile_picture: null,
    });
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      let response;
      if (editingUser) {
        response = await axios.post(`/users/${editingUser.id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? response.data : u))
        );
        toast.success("User updated successfully");
      } else {
        response = await axios.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUsers((prev) => [response.data, ...prev]);
        toast.success("User created successfully");

      }

      closeModal();
  window.location.reload()
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/users/${userToDelete.id}`);
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="m-0">List Users</h3>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  {/* <th>#</th> */}
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => {
                    const roleName =
                      user.roles?.length > 0
                        ? user.roles[0].name.charAt(0).toUpperCase() +
                        user.roles[0].name.slice(1)
                        : "User";
                    return (
                      <tr key={user.id}>
                        {/* <td>{i + 1}</td> */}
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge bg-${roleName.toLowerCase() === "admin"
                                ? "danger"
                                : "primary"
                              }`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${user.status === "active"
                                ? "bg-success"
                                : "bg-secondary"
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => askDelete(user)}

                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            {/* Profile Picture */}
            {/* <div className="col-12 text-center">
              <div className="position-relative d-inline-block">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}>
                    <i className="fas fa-user fa-3x text-secondary"></i>
                  </div>
                )}
                <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                  style={{ cursor: 'pointer' }}>
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    name="profile_picture"
                    onChange={handleEditChange}
                  />
                </label>
              </div>
            </div> */}

            {/* Name */}
            <div className="col-md-6">
              <label className="form-label">Name <span className="text-danger">*</span></label>
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
                placeholder="Enter email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
                disabled={!!editingUser}
              />
            </div>

            {/* Phone */}
            <div className="col-md-6">
              <label className="form-label">Phone</label>
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
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-md-12">
              <label className="form-label">Status <span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Address */}
            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Enter address"
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
              ></textarea>
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
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{userToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListUsers;
