import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'

const ListCars = () => {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCar, setEditingCar] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        source: '',
        model: '',
        colour: '',
        chasis_number: '',
        status: '',
        rent_period: '',
        rent_price: '',
        available_for_sale: false
    })
    const [saving, setSaving] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [carToDelete, setCarToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const { data } = await axios.get('/cars')
                if (mounted) setCars(Array.isArray(data) ? data : (data?.data || []))
            } catch (e) {
                console.error(e)
                if (mounted) setError(e?.response?.data?.message || e.message || 'Failed to load cars')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const openEdit = (car) => {
        setEditingCar(car)
        setEditForm({
            name: car.name || '',
            source: car.source || '',
            model: car.model || '',
            colour: car.colour || '',
            chasis_number: car.chasis_number || '',
            status: car.status || '',
            rent_period: car.rent_period || '',
            rent_price: car.rent_price ?? '',
            available_for_sale: !!car.available_for_sale
        })
        setShowModal(true)
    }

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target
        setEditForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingCar(null)
    }

    const saveEdit = async () => {
        if (!editingCar) return
        setSaving(true)
        const payload = {
            name: editForm.name,
            source: editForm.source,
            model: editForm.model,
            colour: editForm.colour,
            chasis_number: editForm.chasis_number,
            status: editForm.status,
            rent_period: editForm.rent_period,
            rent_price: Number(editForm.rent_price),
            available_for_sale: editForm.available_for_sale ? 1 : 0
        }
        try {
            const { data } = await axios.put(`/cars/${editingCar.id}`, payload)
            setCars((prev) => prev.map((c) => (c.id === editingCar.id ? { ...c, ...payload, ...data } : c)))
            toast.success('Car updated successfully')
            closeModal()
        } catch (e) {
            console.error(e)
            toast.error(e?.response?.data?.message || e.message || 'Failed to update car')
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
    return (
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
                                return list.map((car, index) => (
                                    <tr key={car.id}>
                                        <td>{index + 1}</td>
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
                                        <td>
                                            <button type="button" className="btn btn-sm btn-link text-primary me-2" onClick={() => openEdit(car)} aria-label="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.293l6.5-6.5z"/>
                                                </svg>
                                            </button>
                                            <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => askDelete(car)} aria-label="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5z"/>
                                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            })()}
                        </tbody>
                    </table>
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
                                        <input type="text" className="form-control" name="name" value={editForm.name} onChange={handleEditChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Source</label>
                                        <select className="form-select" name="source" value={editForm.source} onChange={handleEditChange}>
                                            <option value="">Select source</option>
                                            <option value="showroom">Showroom</option>
                                            <option value="private">Private</option>
                                            <option value="imported">Imported</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Model</label>
                                        <input type="text" className="form-control" name="model" value={editForm.model} onChange={handleEditChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Colour</label>
                                        <input type="text" className="form-control" name="colour" value={editForm.colour} onChange={handleEditChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Chassis Number</label>
                                        <input type="text" className="form-control" name="chasis_number" value={editForm.chasis_number} onChange={handleEditChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Car Status</label>
                                        <select className="form-select" name="status" value={editForm.status} onChange={handleEditChange}>
                                            <option value="">Select status</option>
                                            <option value="available">Available</option>
                                            <option value="rented">Rented</option>
                                            <option value="maintenance">Under Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Rent Type</label>
                                        <select className="form-select" name="rent_period" value={editForm.rent_period} onChange={handleEditChange}>
                                            <option value="">Select rent duration</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="15days">15 Days</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="daily">Daily</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Rent Price</label>
                                        <input type="number" className="form-control" name="rent_price" value={editForm.rent_price} onChange={handleEditChange} />
                                    </div>
                                    <div className="col-md-6 d-flex align-items-end">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="edit_available_for_sale" name="available_for_sale" checked={editForm.available_for_sale} onChange={handleEditChange} />
                                            <label className="form-check-label" htmlFor="edit_available_for_sale">Available for sale</label>
                                        </div>
                                    </div>
                                    <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                                            {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                            Save Changes
                                        </button>
                                    </div>
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
    )
}

export default ListCars
