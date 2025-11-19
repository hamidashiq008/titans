import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'
import { Modal, Carousel } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SketchPicker } from 'react-color'
import { useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { SingleCarDocument } from '../../pdf/CarsPdf';
import { CarsListDocument } from './AllCarsDown';


const ListCars = () => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'super-admin';
    const navigate = useNavigate();
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
    const [actionMenuId, setActionMenuId] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1
    })
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const [downloadingAll, setDownloadingAll] = useState(false)
    // Color picker state for Edit modal
    const [showColorPickerEdit, setShowColorPickerEdit] = useState(false)
    const colorPickerRefEdit = useRef(null)
    const inputRefEdit = useRef(null)

    // Convert rgb/rgba strings like "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)" to hex "#FF0000"
    const normalizeColorForPdf = (value) => {
        if (!value || typeof value !== 'string') return value || '';
        const v = value.trim();
        // Already hex
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v.toUpperCase();
        // rgb/rgba matcher
        const m = v.match(/^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/i);
        if (m) {
            const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
            const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
            const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
            const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
        // Fallback: return as-is
        return v;
    }

    const fetchCars = async (page = 1, search = '') => {
        try {
            setLoading(true)
            const { data } = await axios.get('/cars', {
                params: {
                    page,
                    per_page: pagination.perPage,
                    search,
                    sort_by: 'id',
                    sort_order: 'desc'
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

    // Close color picker when clicking outside in Edit modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                colorPickerRefEdit.current &&
                !colorPickerRefEdit.current.contains(event.target) &&
                inputRefEdit.current &&
                !inputRefEdit.current.contains(event.target)
            ) {
                setShowColorPickerEdit(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const onDocClick = (e) => {
            // Close any open action menu when clicking outside
            setActionMenuId(null)
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    const toggleActionMenu = (e, id) => {
        e.stopPropagation()
        const rect = e.currentTarget.getBoundingClientRect()
        const minWidth = 180
        const padding = 8
        const left = Math.max(8, Math.min(window.innerWidth - minWidth - 8, rect.right + window.scrollX - minWidth))
        const top = rect.bottom + window.scrollY + padding
        setMenuPosition({ top, left })
        setActionMenuId(prev => (prev === id ? null : id))
    }

    const handleDownloadPdf = async (car) => {
        try {
            const blob = await pdf(<SingleCarDocument car={car} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `car-${car?.id || 'details'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Failed to generate car PDF', e);
            toast.error('Failed to generate PDF');
        }
    }

    const handlePageChange = (page) => {
        fetchCars(page, searchTerm)
    }

    const handleEdit = (car) => {
        if (!car?.id) return;
        navigate(`/cars/edit/${car.id}`, { state: { car } });
    }

    const handleView = (car) => {
        if (!car?.id) return;
        navigate(`/cars/view/${car.id}`, { state: { car } });
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
        const rawUrls = car.image_urls || (car.images?.[0]?.image_urls) || [];
        const apiBase = (axios?.defaults?.baseURL || '').replace(/\/?api\/?$/i, '');
        const toAbsolute = (s) => {
            const url = (s || '').trim();
            if (!url) return '';
            if (/^https?:\/\//i.test(url)) return url; // already absolute
            const base = apiBase || window.location.origin;
            return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
        };
        const normalized = Array.isArray(rawUrls)
            ? rawUrls
                .map((u) => (typeof u === 'string' ? u : (u?.url ?? '')))
                .map(toAbsolute)
                .filter(Boolean)
            : [];
        const images = normalized.map((url) => ({ url }));
        console.log('images api', images)
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

    const handleDownloadAllPdf = async () => {
        if (downloadingAll) return;
        setDownloadingAll(true);
        try {
            // Fetch ALL cars without pagination for the PDF
            const { data } = await axios.get('/cars', {
                params: {
                    per_page: 10000, // Large number to get all cars
                    sort_by: 'id',
                    sort_order: 'desc'
                }
            });

            // Extract all cars from the response
            const allCars = Array.isArray(data) ? data : (data.data || []);

            console.log(`Downloading PDF with ${allCars.length} cars`);

            // Use ALL cars for PDF generation
            const blob = await pdf(<CarsListDocument cars={allCars} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all-cars-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            toast.success(`Downloaded PDF with ${allCars.length} cars`);
        } catch (e) {
            console.error('Failed to generate cars PDF', e);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloadingAll(false);
        }
    };
    return (
        <>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <div className="header d-flex justify-content-between align-items-center ">
                        <h3 className="mb-4 text-center d-flex align-items-center gap-2">
                            Car List
                        </h3>
                        <div className="d-flex align-items-center gap-2 g-2 mb-3">
                            <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={handleDownloadAllPdf} title="Download all as PDF" disabled={downloadingAll} aria-busy={downloadingAll}>

                                {downloadingAll ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.5 9.9A5.5 5.5 0 0 1 9.9.5a5.5 5.5 0 0 1 5.6 8.9H13V8a5 5 0 1 0-10 0v1.4H.5z" />
                                    <path d="M5 10.5a.5.5 0 0 1 .5-.5H7V6.5a.5.5 0 0 1 1 0V10h1.5a.5.5 0 0 1 .354.854l-2 2a.5.5 0 0 1-.708 0l-2-2A.5.5 0 0 1 5 10.5z" />
                                </svg>}
                                {downloadingAll ? 'Downloading...' : 'Download'}
                            </button>
                            <div>
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
                    {/* {loading && <div className="text-center py-3">Loading…</div>} */}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-dark">
                                <tr>
                                    {/* <th>#</th> */}
                                    <th>Preview</th>
                                    <th>Name</th>
                                    <th>Source</th>
                                    <th>Model</th>
                                    <th>Color</th>
                                    <th>Chassis No</th>
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
                                            {/* <td>{index + 1}</td> */}
                                            <td>
                                                <button
                                                    type="button"
                                                    className=" border-0 bg-transparent  text-white mx-auto d-flex align-items-center justify-content-center"
                                                    disabled={!car.images?.[0]?.image_urls?.length}
                                                    onClick={() => handleViewImages(car)}
                                                    aria-label="View Images"
                                                >
                                                    {
                                                        !car.images?.[0]?.image_urls?.length ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="40" height="40" role="img" aria-label="Stylized car">
                                                                {/* <!-- wheels --> */}
                                                                <circle cx="50" cy="75" r="12" fill="#222" />
                                                                <circle cx="150" cy="75" r="12" fill="#222" />
                                                                <circle cx="50" cy="75" r="6" fill="#bbb" />
                                                                <circle cx="150" cy="75" r="6" fill="#bbb" />

                                                                {/* <!-- body --> */}
                                                                <rect x="18" y="40" rx="10" ry="10" width="164" height="28" fill="#c0dfffff" />

                                                                {/* <!-- roof & windows --> */}
                                                                <path d="M40 40 Q60 18 100 18 Q140 18 160 40 Z" fill="#bcdeffff" />
                                                                <rect x="68" y="26" width="64" height="22" rx="4" ry="4" fill="#E3F2FD" />
                                                                <rect x="72" y="30" width="24" height="14" rx="2" ry="2" fill="#BBDEFB" />
                                                                <rect x="104" y="30" width="24" height="14" rx="2" ry="2" fill="#BBDEFB" />

                                                                {/* <!-- bumper & details --> */}
                                                                <rect x="12" y="56" width="18" height="8" rx="3" fill="#abcef7ffff" />
                                                                <rect x="170" y="56" width="18" height="8" rx="3" fill="#a8d0ffff" />
                                                                <circle cx="30" cy="62" r="2.5" fill="#FFF9C4" />
                                                                <circle cx="170" cy="62" r="2.5" fill="#FFF9C4" />

                                                                {/* <!-- subtle shadow --> */}
                                                                <ellipse cx="100" cy="82" rx="64" ry="8" fill="#000" opacity="0.08" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="40" height="40" role="img" aria-label="Stylized car">
                                                                {/* <!-- wheels --> */}
                                                                <circle cx="50" cy="75" r="12" fill="#222" />
                                                                <circle cx="150" cy="75" r="12" fill="#222" />
                                                                <circle cx="50" cy="75" r="6" fill="#bbb" />
                                                                <circle cx="150" cy="75" r="6" fill="#bbb" />

                                                                {/* <!-- body --> */}
                                                                <rect x="18" y="40" rx="10" ry="10" width="164" height="28" fill="#1976D2" />

                                                                {/* <!-- roof & windows --> */}
                                                                <path d="M40 40 Q60 18 100 18 Q140 18 160 40 Z" fill="#1976D2" />
                                                                <rect x="68" y="26" width="64" height="22" rx="4" ry="4" fill="#E3F2FD" />
                                                                <rect x="72" y="30" width="24" height="14" rx="2" ry="2" fill="#BBDEFB" />
                                                                <rect x="104" y="30" width="24" height="14" rx="2" ry="2" fill="#BBDEFB" />

                                                                {/* <!-- bumper & details --> */}
                                                                <rect x="12" y="56" width="18" height="8" rx="3" fill="#1565C0" />
                                                                <rect x="170" y="56" width="18" height="8" rx="3" fill="#1565C0" />
                                                                <circle cx="30" cy="62" r="2.5" fill="#FFF9C4" />
                                                                <circle cx="170" cy="62" r="2.5" fill="#FFF9C4" />

                                                                {/* <!-- subtle shadow --> */}
                                                                <ellipse cx="100" cy="82" rx="64" ry="8" fill="#000" opacity="0.08" />
                                                            </svg>

                                                        )
                                                    }



                                                </button>
                                            </td>
                                            <td>{car.name}</td>
                                            <td>{car.source}</td>
                                            <td>{car.model}</td>
                                            <td>
                                                <div
                                                    title={car.colour || ''}
                                                    style={{
                                                        width: '50px',
                                                        height: '24px',
                                                        margin: '0 auto',
                                                        display: 'flex',

                                                        borderRadius: '4px',
                                                        border: '1px solid #dee2e6',
                                                        backgroundColor: car.colour || 'transparent',
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                            </td>
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
                                            <td>{car.rent_period.replaceAll('_', ' ')}</td>

                                            <td>${car.rent_price}</td>
                                            <td className="position-relative">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={(e) => toggleActionMenu(e, car.id)}
                                                    aria-label="Actions"
                                                >
                                                    {/* Ellipsis icon */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                                    </svg>
                                                </button>
                                                {actionMenuId === car.id && (
                                                    <div
                                                        className="dropdown-menu show shadow border-0 rounded-3 p-2"
                                                        style={{ display: 'block', position: 'fixed', top: menuPosition.top, left: menuPosition.left, minWidth: 180, zIndex: 2000 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleView(car)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z" />
                                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
                                                            </svg>
                                                            View
                                                        </button>
                                                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleEdit(car)} disabled={!isSuperAdmin}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => askDelete(car)} disabled={!isSuperAdmin}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M5.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5z" />
                                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleDownloadPdf(car)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M.5 9.9A5.5 5.5 0 0 1 9.9.5a5.5 5.5 0 0 1 5.6 8.9H13V8a5 5 0 1 0-10 0v1.4H.5z" />
                                                                <path d="M5 10.5a.5.5 0 0 1 .5-.5H7V6.5a.5.5 0 0 1 1 0V10h1.5a.5.5 0 0 1 .354.854l-2 2a.5.5 0 0 1-.708 0l-2-2A.5.5 0 0 1 5 10.5z" />
                                                            </svg>
                                                            Download PDF
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
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
                        <Carousel
                            key={currentCarImages.map(i => i?.url || '').join('|')}
                            controls={currentCarImages.length > 1}
                            indicators={currentCarImages.length > 1}
                        >
                            {currentCarImages.map((img, idx) => (
                                <Carousel.Item key={idx}>
                                    {console.log('img', img?.url)}
                                    <div className="position-relative d-flex align-items-center justify-content-center" style={{ height: '500px' }}>
                                        {loadingImages[idx] && (
                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            src={img?.url || ''}
                                            alt={`Car view ${idx + 1}`}
                                            style={{
                                                maxHeight: '100%',
                                                maxWidth: '100%',

                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                backgroundColor: '#f8f9fa',
                                            }}
                                            onLoad={() => handleImageLoad(idx)}
                                            onError={() => handleImageLoad(idx)}
                                        />
                                    </div>
                                    {/* <Carousel.Caption>
                                        <p>Image {idx + 1} of {currentCarImages.length}</p>
                                    </Carousel.Caption> */}
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
