import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'
import { X, Droplet } from 'react-feather'
import { SketchPicker } from 'react-color'

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
        images: []
    })
    const [imagePreviews, setImagePreviews] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const newImagePreviews = files.map(file => ({
            id: URL.createObjectURL(file),
            file,
            url: URL.createObjectURL(file)
        }))

        setImagePreviews(prev => [...prev, ...newImagePreviews])
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImagePreviews.map(p => p.file)]
        }))
    }

    const removeImage = useCallback((index) => {
        setImagePreviews(prev => {
            const newPreviews = [...prev]
            // Only revoke the URL if it's a blob URL (starts with 'blob:')
            if (newPreviews[index]?.url?.startsWith('blob:')) {
                URL.revokeObjectURL(newPreviews[index].url)
            }
            newPreviews.splice(index, 1)
            return newPreviews
        })

        setFormData(prev => {
            const newImages = [...prev.images]
            // Remove the image at the specified index
            newImages.splice(index, 1)
            return { ...prev, images: newImages }
        })
    }, [])

    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url))
        }
    }, [imagePreviews])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)
        
        try {
            const fd = new FormData()
            
            // Add all form data
            const formDataToSend = {
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
            
            // Append all form data to FormData
            Object.entries(formDataToSend).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    fd.append(key, String(value))
                }
            })
            
            // Append each image file
            formData.images.forEach((image, index) => {
                // Only append if the image is a File object
                if (image instanceof File) {
                    fd.append(`images[${index}]`, image)
                }
            })
            
            const response = await axios.post('/cars', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
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
                images: []
            })
setImagePreviews([])
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

                            {/* Color Picker */}
                            <div className="col-md-6 position-relative">
                                <label className="form-label">Color</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Select color"
                                        name="colour"
                                        value={formData.colour}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="button"
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                    >
                                        <Droplet size={16} />
                                    </button>
                                    {formData.colour && (
                                        <div 
                                            className="color-preview" 
                                            style={{
                                                width: '38px', 
                                                height: '44px', 
                                                backgroundColor: formData.colour,
                                                border: '1px solid #ced4da',
                                                borderRadius: '0 4px 4px 0'
                                            }}
                                        />
                                    )}
                                </div>
                                {showColorPicker && (
                                    <div className="position-absolute" style={{ zIndex: 1000, marginTop: '5px' }}>
                                        <div className="position-relative">
                                            <div 
                                                className="position-absolute" 
                                                style={{ top: 0, right: 0, zIndex: 1001 }}
                                                onClick={() => setShowColorPicker(false)}
                                            >
                                                <X size={20} style={{ cursor: 'pointer', color: '#666' }} />
                                            </div>
                                            <SketchPicker 
                                                color={formData.colour || '#ffffff'}
                                                onChangeComplete={(color) => {
                                                    const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}${color.rgb.a !== 1 ? `, ${color.rgb.a}` : ''})`
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        colour: rgb
                                                    }))
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
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

                            <div className="col-md-12 mb-3">
                                <label className="form-label">Car Images</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    name="images"
                                    multiple
                                    onChange={handleFileChange}
                                />
                                <div className="d-flex flex-wrap gap-3 mt-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={preview.id} className="position-relative" style={{ width: '200px' }}>
                                            <img
                                                src={preview.url}
                                                alt={`Preview ${index + 1}`}
                                                className="img-fluid rounded border"
                                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                                                onClick={() => removeImage(index)}
                                                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
