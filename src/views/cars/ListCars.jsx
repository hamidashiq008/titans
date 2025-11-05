import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'
import { Modal, Carousel } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const ListCars = () => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'super-admin';
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCar, setEditingCar] = useState(null)
    const [showImageModal, setShowImageModal] = useState(false)
    const [currentCarImages, setCurrentCarImages] = useState([])
    const [loadingImages, setLoadingImages] = useState({})
    const [editForm, setEditForm] = useState({
        name: '',
        source: '',
        model: '',
        colour: '',
        chasis_number: '',
        status: '',
        rent_period: '',
        rent_price: '',
        available_for_sale: false,
        images: [],
        existingImages: []
    })
    const [saving, setSaving] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [carToDelete, setCarToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1
    })

    const fetchCars = async (page = 1, search = '') => {
        try {
            setLoading(true)
            const { data } = await axios.get('/cars', {
                params: {
                    page,
                    per_page: pagination.perPage,
                    search
                }
            })

            if (Array.isArray(data)) {
                // Handle array response (backward compatibility)
                setCars(data)
                setPagination(prev => ({
                    ...prev,
                    currentPage: 1,
                    total: data.length,
                    lastPage: 1
                }))
            } else {
                // Handle paginated response
                setCars(data.data || [])
                setPagination({
                    currentPage: data.current_page || 1,
                    perPage: data.per_page || 10,
                    total: data.total || 0,
                    lastPage: data.last_page || 1
                })
            }
        } catch (e) {
            console.error('Error fetching cars:', e)
            setError(e?.response?.data?.message || e.message || 'Failed to load cars')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCars(1, searchTerm)
    }, [searchTerm])

    const handlePageChange = (page) => {
        fetchCars(page, searchTerm)
    }

    const handleEdit = (car) => {
        setEditingCar(car)
        const urls = car.image_urls || (car.images?.[0]?.image_urls) || []
        setEditForm({
            name: car.name || '',
            source: car.source || '',
            model: car.model || '',
            colour: car.colour || '',
            chasis_number: car.chasis_number || '',
            status: car.status || '',
            rent_period: car.rent_period || '',
            rent_price: car.rent_price || '',
            available_for_sale: car.available_for_sale || false,
            images: [],
            existingImages: Array.isArray(urls) ? urls.map(url => ({
                url: typeof url === 'string' ? url : url.url,
                id: Math.random().toString(36).substr(2, 9)
            })) : []
        })
        setShowModal(true)
    }

    const handleEditChange = (e) => {
        const { name, value, type, checked, files } = e.target

        if (type === 'file') {
            const newImages = Array.from(files).map(file => ({
                file,
                url: URL.createObjectURL(file),
                id: Math.random().toString(36).substr(2, 9)
            }))

            setEditForm(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }))
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }
    }

    const removeEditImage = (id, isNew = true) => {
        if (isNew) {
            setEditForm(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== id)
            }))
        } else {
            setEditForm(prev => ({
                ...prev,
                existingImages: prev.existingImages.filter(img => img.id !== id)
            }))
        }
    }

    const closeModal = () => {
        // Revoke object URLs for new images to prevent memory leaks
        editForm.images.forEach(image => {
            URL.revokeObjectURL(image.url)
        })

        setShowModal(false)
        setEditingCar(null)
        setEditForm({
            name: '',
            source: '',
            model: '',
            colour: '',
            chasis_number: '',
            status: '',
            rent_period: '',
            rent_price: '',
            available_for_sale: false,
            images: [],
            existingImages: []
        })
    }

    const saveEdit = async () => {
        try {
            setSaving(true)
            const formData = new FormData()

            // Append all form data
            Object.entries(editForm).forEach(([key, value]) => {
                if (key === 'images' || key === 'existingImages') return
                // Convert boolean to 0 or 1 for available_for_sale
                if (key === 'available_for_sale') {
                    formData.append(key, value ? '1' : '0')
                } else {
                    formData.append(key, value)
                }
            })

            // Append new images
            editForm.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image.file)
            })

            // Append existing image IDs that weren't removed
            editForm.existingImages.forEach(image => {
                if (image.id) {
                    formData.append('existing_image_ids[]', image.id)
                }
            })

            const response = await axios.post(`/cars/${editingCar.id}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            // Update the cars list with the new data
            setCars(cars.map(car => {
                if (car.id === editingCar.id) {
                    // Preserve the existing image structure in the response
                    if (!response.data.image_urls && response.data.images?.[0]?.image_urls) {
                        response.data.image_urls = response.data.images[0].image_urls;
                    }
                    return response.data;
                }
                return car;
            }))
            toast.success('Car updated successfully')
            closeModal()
        } catch (error) {
            console.error('Error updating car:', error)
            toast.error(error.response?.data?.message || 'Failed to update car')
        } finally {
            setSaving(false)
        }
    }

    const askDelete = (car) => {
        setCarToDelete(car)
        setShowDeleteModal(true)
    }

    const cancelDelete = () => {
        setShowDeleteModal(false)
        setCarToDelete(null)
    }

    const confirmDelete = async () => {
        if (!carToDelete) return
        setDeleting(true)
        try {
            await axios.delete(`/cars/${carToDelete.id}`)
            setCars((prev) => prev.filter((c) => c.id !== carToDelete.id))
            toast.success('Car deleted successfully')
            cancelDelete()
        } catch (e) {
            console.error(e)
            toast.error(e?.response?.data?.message || e.message || 'Failed to delete car')
        } finally {
            setDeleting(false)
        }
    }

    const handleViewImages = (car) => {
        const urls = car.image_urls || (car.images?.[0]?.image_urls) || [];
        const images = Array.isArray(urls) ? urls.map(url => ({ url })) : [];
        setCurrentCarImages(images);
        // Initialize loading state for all images
        const initialLoadingState = {};
        images.forEach((_, index) => {
            initialLoadingState[index] = true;
        });
        setLoadingImages(initialLoadingState);
        setShowImageModal(true);
    };

    const handleImageLoad = (index) => {
        setLoadingImages(prev => ({
            ...prev,
            [index]: false
        }));
    };

    const handleImageModalClose = () => {
        setShowImageModal(false)
        setCurrentCarImages([])
        setLoadingImages({})
    }

    return (
        <>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <div className="header d-flex justify-content-between align-items-center ">

                        <h3 className="mb-4 text-center">Car List</h3>
                        <div className=" g-2 mb-3">
                            <div className="">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Car"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {loading && <div className="text-center py-3">Loading…</div>}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Car Preview</th>
                                    <th>Car Name</th>
                                    <th>Source</th>
                                    <th>Model</th>
                                    <th>Colour</th>
                                    <th>Chasis No</th>
                                    <th>Status</th>
                                    <th>Rent Type</th>
                                    <th>Rent Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const q = searchTerm.trim().toLowerCase()
                                    const base = (!loading && cars.length > 0) ? cars : []
                                    const list = q
                                        ? base.filter((car) => {
                                            const name = (car.name || '').toString().toLowerCase()
                                            const model = (car.model || '').toString().toLowerCase()
                                            const chasis = (car.chasis_number || '').toString().toLowerCase()
                                            return name.includes(q) || model.includes(q) || chasis.includes(q)
                                        })
                                        : base
                                    if (list.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="10" className="text-center text-muted py-3">
                                                    {loading ? 'Loading…' : 'No cars available'}
                                                </td>
                                            </tr>
                                        )
                                    }
                                    console.log('List:', list); // Debug log
                                    return list.map((car, index) => (
                                        <tr key={car.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn bg-secondary text-white me-2"
                                                    disabled={!car.images?.[0]?.image_urls?.length}
                                                    onClick={() => handleViewImages(car)}
                                                    aria-label="View Images"
                                                >


                                                    images
                                                </button>
                                            </td>
                                            <td>{car.name}</td>
                                            <td>{car.source}</td>
                                            <td>{car.model}</td>
                                            <td>{car.colour}</td>
                                            <td>{car.chasis_number}</td>
                                            <td>
                                                <div className="badge-wrapp d-flex align-items-center justify-content-center">
                                                    <span
                                                        className={`badge rounded-pill text-white  px-2 ${(() => {
                                                            const s = (car.status || '').toString().trim().toLowerCase()
                                                            if (s === 'available') return 'bg-success'
                                                            if (s === 'rented') return 'bg-warning text-dark'
                                                            if (s === 'maintenance' || s === 'under maintenance') return 'bg-info'
                                                            return 'bg-secondary'
                                                        })()}`}
                                                    >
                                                        {car.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{car.rent_period}</td>
                                            <td>Rs. {car.rent_price}</td>

                                            {isSuperAdmin ? (
                                                <td>
                                                    <button type="button" className="btn btn-sm btn-link text-primary me-2" onClick={() => handleEdit(car)} aria-label="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.293l6.5-6.5z" />
                                                        </svg>
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => askDelete(car)} aria-label="Delete">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5z" />
                                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            ) : <td>
                                                <button type="button" className="btn btn-sm btn-link text-primary" onClick={() => handleEdit(car)} aria-label="View">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                    </svg>
                                                </button>
                                            </td>}
                                        </tr>
                                    ))
                                })()}
                            </tbody>
                        </table>
                        {pagination.total > 0 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div className="text-muted">
                                    Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} cars
                                </div>
                                <nav aria-label="Page navigation">
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {/* Show first page */}
                                        {pagination.currentPage > 2 && (
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                                            </li>
                                        )}

                                        {/* Show ellipsis if needed */}
                                        {pagination.currentPage > 3 && (
                                            <li className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        )}

                                        {/* Show previous page */}
                                        {pagination.currentPage > 1 && (
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                                                    {pagination.currentPage - 1}
                                                </button>
                                            </li>
                                        )}

                                        {/* Current page */}
                                        <li className="page-item active">
                                            <span className="page-link">
                                                {pagination.currentPage}
                                            </span>
                                        </li>

                                        {/* Show next page */}
                                        {pagination.currentPage < pagination.lastPage && (
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                                                    {pagination.currentPage + 1}
                                                </button>
                                            </li>
                                        )}

                                        {/* Show ellipsis if needed */}
                                        {pagination.currentPage < pagination.lastPage - 2 && (
                                            <li className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        )}

                                        {/* Show last page */}
                                        {pagination.currentPage < pagination.lastPage - 1 && (
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => handlePageChange(pagination.lastPage)}>
                                                    {pagination.lastPage}
                                                </button>
                                            </li>
                                        )}

                                        <li className={`page-item ${pagination.currentPage === pagination.lastPage ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.lastPage}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                    {showModal && (
                        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                            <div className="d-flex align-items-center justify-content-center h-100 p-3">
                                <div className="bg-white rounded shadow p-3" style={{ width: '100%', maxWidth: 720 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="m-0">Edit Car</h5>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeModal}>Close</button>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Car Name</label>
                                            <input type="text" className="form-control" name="name" disabled={!isSuperAdmin} value={editForm.name} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Source</label>
                                            <select className="form-select" name="source" disabled={!isSuperAdmin} value={editForm.source} onChange={handleEditChange}>
                                                <option value="">Select source</option>
                                                <option value="showroom">Showroom</option>
                                                <option value="private">Private</option>
                                                <option value="imported">Imported</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Model</label>
                                            <input type="text" className="form-control" name="model" disabled={!isSuperAdmin} value={editForm.model} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Colour</label>
                                            <input type="text" className="form-control" name="colour" disabled={!isSuperAdmin} value={editForm.colour} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Chassis Number</label>
                                            <input type="text" className="form-control" name="chasis_number" disabled={!isSuperAdmin} value={editForm.chasis_number} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Car Status</label>
                                            <select className="form-select" name="status" disabled={!isSuperAdmin} value={editForm.status} onChange={handleEditChange}>
                                                <option value="">Select status</option>
                                                <option value="available">Available</option>
                                                <option value="rented">Rented</option>
                                                <option value="maintenance">Under Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Rent Type</label>
                                            <select className="form-select" name="rent_period" disabled={!isSuperAdmin} value={editForm.rent_period} onChange={handleEditChange}>
                                                <option value="">Select rent duration</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="15days">15 Days</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="daily">Daily</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Rent Price</label>
                                            <input type="number" className="form-control" name="rent_price" disabled={!isSuperAdmin} value={editForm.rent_price} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Images</label>
                                            <input
                                                type="file"
                                                className="form-control mb-3"
                                                multiple
                                                accept="image/*"
                                                onChange={handleEditChange}
                                                name="images"
                                                disabled={!isSuperAdmin}
                                            />

                                            {/* Existing Images */}
                                            <div className="d-flex flex-wrap gap-3 mb-3">
                                                {editForm.existingImages.map((image, index) => (
                                                    <div key={`existing-${image.id}`} className="position-relative" style={{ width: '150px', height: '100px' }}>
                                                        <img
                                                            src={image.url}
                                                            alt={`Car image ${index + 1}`}
                                                            className="img-fluid rounded border"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                        {
                                                            isSuperAdmin ? (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                                                                    onClick={() => removeEditImage(image.id, false)}
                                                                    style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    ×
                                                                </button>
                                                            ) : null
                                                        }
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Newly Added Images */}
                                            <div className="d-flex flex-wrap gap-3">
                                                {editForm.images.map((image, index) => (
                                                    <div key={`new-${image.id}`} className="position-relative" style={{ width: '150px', height: '100px' }}>
                                                        <img
                                                            src={image.url}
                                                            alt={`New image ${index + 1}`}
                                                            className="img-fluid rounded border"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                        {
                                                            isSuperAdmin ? (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                                                                    onClick={() => removeEditImage(image.id, true)}
                                                                    style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    ×
                                                                </button>
                                                            ) : null}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="col-md-6 d-flex align-items-end">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" disabled={!isSuperAdmin} id="edit_available_for_sale" name="available_for_sale" checked={editForm.available_for_sale} onChange={handleEditChange} />
                                                <label className="form-check-label" htmlFor="edit_available_for_sale">Available for sale</label>
                                            </div>
                                        </div>
                                        {isSuperAdmin && (
                                            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                                                <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                                                    {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                                    Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showDeleteModal && (
                        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                            <div className="d-flex align-items-center justify-content-center h-100 p-3">
                                <div className="bg-white rounded shadow p-4" style={{ width: '100%', maxWidth: 480 }}>
                                    <h5 className="mb-2">Delete Car</h5>
                                    <p className="mb-4">Are you sure you want to delete {carToDelete?.name ? (<strong>{carToDelete.name}</strong>) : 'this car'}?</p>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={cancelDelete} disabled={deleting}>Cancel</button>
                                        <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                                            {deleting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Slider Modal */}
            <Modal
                show={showImageModal}
                onHide={handleImageModalClose}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Car Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentCarImages.length > 0 ? (
                        <Carousel>
                            {currentCarImages.map((img, idx) => (
                                <Carousel.Item key={idx}>
                                    <div className="position-relative" style={{ minHeight: '300px' }}>
                                        {loadingImages[idx] && (
                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            className="d-block w-100"
                                            src={img.url}
                                            alt={`Car view ${idx + 1}`}
                                            style={{
                                                maxHeight: '500px',
                                                objectFit: 'contain',
                                                opacity: loadingImages[idx] ? 0 : 1,
                                                transition: 'opacity 0.3s ease-in-out'
                                            }}
                                            onLoad={() => handleImageLoad(idx)}
                                            onError={() => handleImageLoad(idx)}
                                        />
                                    </div>
                                    <Carousel.Caption>
                                        <p>Image {idx + 1} of {currentCarImages.length}</p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <div className="text-center py-4">
                            <p>No images available for this car</p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ListCars
