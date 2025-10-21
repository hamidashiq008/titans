import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'

const AddCars = () => {
    const [formData, setFormData] = useState({
        name: '',
        source: '',
        model: '',
        colour: '',
        chasis_number: '',
        status: '',
        rent_period: '',
        rent_price: '',
        available_for_sale: false,
        image: null
    })
    const [imagePreview, setImagePreview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        const url = file ? URL.createObjectURL(file) : ''
        setImagePreview(url)
        setFormData((prev) => ({ ...prev, image: file }))
    }

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview)
        }
    }, [imagePreview])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)
        const payload = {
            name: formData.name,
            source: formData.source,
            model: formData.model,
            colour: formData.colour,
            chasis_number: formData.chasis_number,
            status: formData.status,
            rent_period: formData.rent_period,
            rent_price: Number(formData.rent_price),
            available_for_sale: formData.available_for_sale ? 1 : 0,
        }
        try {
            let response
            if (formData.image) {
                const fd = new FormData()
                Object.entries(payload).forEach(([key, val]) => {
                    fd.append(key, String(val))
                })
                fd.append('image', formData.image)
                response = await axios.post('/cars', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } else {
                response = await axios.post('/cars', payload)
            }
            const { data } = response
            console.log('Car added:', data)
            toast.success('Car added successfully')
            setFormData({
                name: '',
                source: '',
                model: '',
                colour: '',
                chasis_number: '',
                status: '',
                rent_period: '',
                rent_price: '',
                available_for_sale: false,
                image: null
            })
            if (imagePreview) URL.revokeObjectURL(imagePreview)
            setImagePreview('')
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Failed to add car'
            console.error(error)
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className=''>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <h3 className="mb-4 text-center">Add Car</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Car Name */}
                            <div className="col-md-6">
                                <label className="form-label">Car Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter car name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Source Dropdown */}
                            <div className="col-md-6">
                                <label className="form-label">Source</label>
                                <select className="form-select" name="source" value={formData.source} onChange={handleChange}>
                                    <option value="">Select source</option>
                                    <option value="showroom">Showroom</option>
                                    <option value="private">Private</option>
                                    <option value="imported">Imported</option>
                                </select>
                            </div>

                            {/* Model */}
                            <div className="col-md-6">
                                <label className="form-label">Model</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Colour */}
                            <div className="col-md-6">
                                <label className="form-label">Colour</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter colour"
                                    name="colour"
                                    value={formData.colour}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Chassis Number */}
                            <div className="col-md-6">
                                <label className="form-label">Chassis Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter chassis number"
                                    name="chasis_number"
                                    value={formData.chasis_number}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Car Status Dropdown */}
                            <div className="col-md-6">
                                <label className="form-label">Car Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    <option value="">Select status</option>
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="maintenance">Under Maintenance</option>
                                </select>
                            </div>

                            {/* Rent Type Dropdown */}
                            <div className="col-md-6">
                                <label className="form-label">Rent Type</label>
                                <select className="form-select" name="rent_period" value={formData.rent_period} onChange={handleChange}>
                                    <option value="">Select rent duration</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="15days">15 Days</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="daily">Daily</option>
                                </select>
                            </div>

                            {/* Rent Price */}
                            <div className="col-md-6">
                                <label className="form-label">Rent Price</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter rent price"
                                    name="rent_price"
                                    value={formData.rent_price}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Image</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    name="image"
                                    onChange={handleFileChange}
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 img-fluid rounded border"
                                        style={{ maxWidth: '220px' }}
                                    />
                                )}
                            </div>

                            <div className="col-md-6 d-flex align-items-start mt-5 pt-2">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="available_for_sale"
                                        name="available_for_sale"
                                        checked={formData.available_for_sale}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="available_for_sale">
                                        Available for sale
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="col-12 text-center mt-3">
                                <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting} aria-busy={isSubmitting}>
                                    {isSubmitting && (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    )}
                                    {isSubmitting ? 'Adding...' : 'Add Car'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddCars
