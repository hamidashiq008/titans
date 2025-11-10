import React, { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import axios from '../../axios/Axios'
import { X, Droplet } from 'react-feather'
import { SketchPicker } from 'react-color'
import { useNavigate } from 'react-router-dom'
const CAR_CATEGORIES = [
    {
        type: 'SUV',
        cars: [
            'Toyota Land Cruiser',
            'Toyota Land Cruiser Prado',
            'Toyota Fortuner',
            'Nissan Patrol',
            'Nissan X-Trail',
            'Nissan Kicks',
            'Mitsubishi Pajero',
            'Mitsubishi Outlander',
            'Kia Sportage',
            'Kia Sorento',
            'Kia Seltos',
            'Hyundai Tucson',
            'Hyundai Santa Fe',
            'Hyundai Palisade',
            'Hyundai Creta',
            'Honda CR-V',
            'Honda HR-V',
            'Mazda CX-5',
            'Mazda CX-9',
            'Lexus LX',
            'Lexus RX',
            'Lexus NX',
            'Lexus GX',
            'BMW X1',
            'BMW X3',
            'BMW X5',
            'BMW X7',
            'Mercedes-Benz GLC',
            'Mercedes-Benz GLE',
            'Mercedes-Benz GLS',
            'Mercedes-Benz G-Class',
            'Audi Q3',
            'Audi Q5',
            'Audi Q7',
            'Audi Q8',
            'Volkswagen Tiguan',
            'Volkswagen Touareg',
            'Peugeot 3008',
            'Peugeot 5008',
            'Renault Duster',
            'Renault Koleos',
            'Volvo XC40',
            'Volvo XC60',
            'Volvo XC90',
            'Chevrolet Captiva',
            'Chevrolet Tahoe',
            'Chevrolet Suburban',
            'GMC Yukon',
            'GMC Terrain',
            'Infiniti QX50',
            'Infiniti QX60',
            'Infiniti QX80',
            'Range Rover',
            'Range Rover Sport',
            'Land Rover Defender',
            'Land Rover Discovery',
            'Porsche Cayenne',
            'Porsche Macan',
            'Jaguar F-Pace',
            'Tesla Model X',
            'Tesla Model Y',
            'MG ZS',
            'MG HS',
            'BYD Atto 3',
            'Geely Coolray',
            'Haval H6',
            'Chery Tiggo 8',
            'Jetour T2'
        ]
    },
    {
        type: 'Sedan',
        cars: [
            'Toyota Corolla',
            'Toyota Camry',
            'Toyota Avalon',
            'Nissan Altima',
            'Nissan Maxima',
            'Nissan Sunny',
            'Honda Accord',
            'Honda Civic',
            'Hyundai Elantra',
            'Hyundai Sonata',
            'Hyundai Accent',
            'Kia Cerato',
            'Kia Rio',
            'Mazda 3',
            'Mazda 6',
            'Lexus ES',
            'Lexus LS',
            'BMW 3 Series',
            'BMW 5 Series',
            'BMW 7 Series',
            'Mercedes-Benz C-Class',
            'Mercedes-Benz E-Class',
            'Mercedes-Benz S-Class',
            'Audi A3',
            'Audi A4',
            'Audi A6',
            'Audi A8',
            'Volkswagen Passat',
            'Volkswagen Jetta',
            'Peugeot 508',
            'Renault Symbol',
            'Renault Megane',
            'Chevrolet Malibu',
            'Chevrolet Impala',
            'Ford Fusion',
            'Infiniti Q50',
            'Infiniti Q70',
            'Genesis G70',
            'Genesis G80',
            'Genesis G90',
            'BYD Seal',
            'Tesla Model 3',
            'Polestar 2',
            'MG 5',
            'Chery Arrizo 6',
            'GAC Empow'
        ]
    },
    {
        type: 'Pickup / Truck',
        cars: [
            'Toyota Hilux',
            'Nissan Navara',
            'Nissan Frontier',
            'Mitsubishi L200',
            'Isuzu D-Max',
            'Ford F-150',
            'Chevrolet Silverado',
            'GMC Sierra',
            'Ram 1500',
            'Mazda BT-50',
            'Great Wall Wingle',
            'JAC T8'
        ]
    },
    {
        type: 'Coupe / Sports',
        cars: [
            'Toyota Supra',
            'Nissan Z',
            'Ford Mustang',
            'Chevrolet Camaro',
            'Dodge Challenger',
            'BMW Z4',
            'BMW 4 Series Coupe',
            'Audi TT',
            'Audi R8',
            'Mercedes-Benz AMG GT',
            'Porsche 911',
            'Porsche 718 Cayman',
            'Porsche 718 Boxster',
            'Jaguar F-Type',
            'Lexus RC',
            'Lexus LC',
            'Aston Martin Vantage',
            'Ferrari F8 Tributo',
            'Ferrari Roma',
            'Lamborghini Huracán',
            'Lamborghini Aventador',
            'McLaren 720S',
            'McLaren Artura'
        ]
    },
    {
        type: 'Hatchback / Compact',
        cars: [
            'Toyota Yaris',
            'Hyundai i20',
            'Kia Picanto',
            'Kia Pegas',
            'Honda Jazz',
            'Suzuki Swift',
            'Suzuki Baleno',
            'Mazda 2',
            'Volkswagen Golf',
            'Mini Cooper',
            'Ford Focus',
            'Peugeot 208',
            'Renault Clio',
            'MG 3'
        ]
    },
    {
        type: 'Luxury / Executive',
        cars: [
            'Rolls-Royce Phantom',
            'Rolls-Royce Ghost',
            'Rolls-Royce Cullinan',
            'Bentley Bentayga',
            'Bentley Continental GT',
            'Bentley Flying Spur',
            'Mercedes-Maybach S-Class',
            'BMW 7 Series',
            'Audi A8',
            'Genesis G90',
            'Lexus LS'
        ]
    },
    {
        type: 'Electric / Hybrid',
        cars: [
            'Tesla Model S',
            'Tesla Model 3',
            'Tesla Model X',
            'Tesla Model Y',
            'BYD Atto 3',
            'BYD Dolphin',
            'Hyundai Ioniq 5',
            'Hyundai Ioniq 6',
            'Kia EV6',
            'BMW i4',
            'BMW i7',
            'Mercedes EQS',
            'Mercedes EQE',
            'Audi e-tron',
            'Porsche Taycan',
            'Polestar 2',
            'Nissan Leaf',
            'Toyota Prius',
            'Lexus UX Hybrid'
        ]
    },
    {
        type: 'Commercial / Van / Bus',
        cars: [
            'Toyota Hiace',
            'Nissan Urvan',
            'Hyundai Staria',
            'Hyundai H-1',
            'Kia Carnival',
            'Kia Bongo',
            'Ford Transit',
            'Mercedes-Benz Sprinter',
            'Volkswagen Transporter',
            'Isuzu N-Series',
            'Hino 300',
            'Iveco Daily'
        ]
    }
]
const AddCars = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        type: '',
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
    const colorPickerRef = useRef(null)
    const inputRef = useRef(null)

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowColorPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        // If type changes, also reset the car name
        if (name === 'type') {
            setFormData((prev) => ({
                ...prev,
                type: value,
                name: ''
            }))
            return
        }
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
                type: '',
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
            navigate('/cars/list-cars')
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Failed to add car'
            console.error(error)
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }
    // Compute cars for the selected category
    const selectedCategory = CAR_CATEGORIES.find(c => c.type === formData.type)
    const filteredCars = selectedCategory ? selectedCategory.cars : []

    return (
        <div className=''>
            <div className="container py-4">
                <div className="card shadow-sm p-4">
                    <h3 className="mb-4 text-center">Add Car</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Type */}
                            <div className="col-md-6">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="">Select type</option>
                                    {CAR_CATEGORIES.map(cat => (
                                        <option key={cat.type} value={cat.type}>{cat.type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Car Name (dependent) */}
                            <div className="col-md-6">
                                <label className="form-label">Car</label>
                                <select
                                    className="form-select"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!formData.type}
                                >
                                    <option value="">{formData.type ? 'Select car' : 'Select type first'}</option>
                                    {filteredCars.map(car => (
                                        <option key={car} value={car}>{car}</option>
                                    ))}
                                </select>
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
                                <div className="input-group" style={{ cursor: 'pointer' }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="form-control"
                                        placeholder="Click to select color"
                                        name="colour"
                                        value={formData.colour}
                                        onChange={handleChange}
                                        readOnly
                                        onClick={() => setShowColorPicker(true)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {formData.colour && (
                                        <div
                                            className="color-preview"
                                            style={{
                                                width: '38px',
                                                height: '44px',
                                                backgroundColor: formData.colour,
                                                border: '1px solid #ced4da',
                                                borderRadius: '0 4px 4px 0',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowColorPicker(true)}
                                        />
                                    )}
                                </div>
                                {showColorPicker && (
                                    <div
                                        ref={colorPickerRef}
                                        className="position-absolute"
                                        style={{ zIndex: 1000, marginTop: '5px' }}
                                    >
                                        <div className="position-relative">
                                            <SketchPicker
                                                color={formData.colour || '#ffffff'}
                                                onChange={(color) => {
                                                    const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}${color.rgb.a !== 1 ? `, ${color.rgb.a}` : ''})`
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        colour: rgb
                                                    }))
                                                }}
                                                onChangeComplete={() => {
                                                    // Optional: Add any completion logic here if needed
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
                                    <option value="15_days">15 Days</option>
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

                            <div className="col-md-12">
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

                            <div className="col-md-6 d-flex align-items-start mt-1 pt-2">
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
