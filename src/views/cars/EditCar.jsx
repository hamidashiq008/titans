import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios/Axios';
import { toast } from 'react-toastify';
import { SketchPicker } from 'react-color';

export default function EditCar() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialFromState = location.state?.car;
  const [loading, setLoading] = useState(!initialFromState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    source: '',
    model: '',
    colour: '',
    chasis_number: '',
    status: '',
    rent_period: '',
    rent_price: '',
    available_for_sale: false,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prefill
  useEffect(() => {
    const fill = (c) => {
      setForm({
        name: c?.name || '',
        source: c?.source || '',
        model: c?.model || '',
        colour: c?.colour || '',
        chasis_number: c?.chasis_number || '',
        status: c?.status || '',
        rent_period: c?.rent_period || '',
        rent_price: c?.rent_price ?? '',
        available_for_sale: !!c?.available_for_sale,
      });
      const urls = c?.image_urls || (c?.images?.[0]?.image_urls) || [];
      const normalized = Array.isArray(urls)
        ? urls.map((u) => {
            if (typeof u === 'string') return { id: Math.random().toString(36).slice(2), serverId: null, url: u };
            return { id: Math.random().toString(36).slice(2), serverId: u.id ?? null, url: u.url ?? u };
          })
        : [];
      setExistingImages(normalized);
      setNewImages([]);
    };

    if (initialFromState) {
      fill(initialFromState);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/cars/${id}`);
        fill(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load car');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, initialFromState]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const prepared = files.map((file) => ({ file, url: URL.createObjectURL(file), id: Math.random().toString(36).slice(2) }));
    setNewImages((prev) => [...prev, ...prepared]);
  };

  const removeExistingImage = (id) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (id) => {
    setNewImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  useEffect(() => () => {
    newImages.forEach((img) => {
      if (img?.url?.startsWith('blob:')) URL.revokeObjectURL(img.url);
    });
  }, [newImages]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.source) fd.append('source', form.source);
      if (form.model) fd.append('model', form.model);
      if (form.colour) fd.append('colour', form.colour);
      if (form.chasis_number) fd.append('chasis_number', form.chasis_number);
      if (form.status) fd.append('status', form.status);
      if (form.rent_period) fd.append('rent_period', form.rent_period);
      if (form.rent_price !== '' && form.rent_price !== null && form.rent_price !== undefined) fd.append('rent_price', form.rent_price);
      fd.append('available_for_sale', form.available_for_sale ? '1' : '0');

      newImages.forEach((img, index) => {
        if (img.file) fd.append(`images[${index}]`, img.file);
      });

      existingImages.forEach((img) => {
        if (img.serverId) fd.append('existing_image_ids[]', img.serverId);
      });

      await axios.post(`/cars/${id}?_method=PUT`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Car updated successfully');
      navigate('/cars/list-cars');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save car');
    } finally {
      setSaving(false);
    }
  };

  const colorHex = useMemo(() => {
    const c = (form.colour || '').toString().trim();
    if (!c) return '';
    if (c.startsWith('#')) return c.toUpperCase();
    const m = c.match(/^rgba?\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*)(?:,(\s*\d*\.?\d+\s*))?\)$/i);
    if (m) {
      const r = Math.max(0, Math.min(255, parseInt(m[1])));
      const g = Math.max(0, Math.min(255, parseInt(m[2])));
      const b = Math.max(0, Math.min(255, parseInt(m[3])));
      const toHex = (n) => n.toString(16).padStart(2, '0');
      return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
    }
    return c;
  }, [form.colour]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">Edit Car</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Car Name</label>
              <input className="form-control" name="name" value={form.name} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Source</label>
              <select className="form-select" name="source" value={form.source} onChange={onChange}>
                <option value="">Select source</option>
                <option value="showroom">Showroom</option>
                <option value="private">Private</option>
                <option value="imported">Imported</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Model</label>
              <input className="form-control" name="model" value={form.model} onChange={onChange} />
            </div>
            <div className="col-md-6 position-relative">
              <label className="form-label">Colour</label>
              <div className="d-flex">
                <input
                  ref={inputRef}
                  className="form-control"
                  name="colour"
                  value={form.colour}
                  onFocus={() => setShowColorPicker(true)}
                  onChange={onChange}
                  placeholder="Click to pick color"
                />
                <div className="ms-2 border rounded" style={{ width: 40, height: 38, backgroundColor: form.colour || '#ffffff' }} />
              </div>
              {showColorPicker && (
                <div ref={colorPickerRef} className="position-absolute" style={{ zIndex: 1000, marginTop: 8 }}>
                  <SketchPicker
                    color={form.colour || '#ffffff'}
                    onChange={(color) => {
                      const rgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}${color.rgb.a !== 1 ? `, ${color.rgb.a}` : ''})`;
                      setForm((p) => ({ ...p, colour: rgb }));
                    }}
                  />
                </div>
              )}
              <small className="text-muted">{colorHex}</small>
            </div>
            <div className="col-md-6">
              <label className="form-label">Chassis Number</label>
              <input className="form-control" name="chasis_number" value={form.chasis_number} onChange={onChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Car Status</label>
              <select className="form-select" name="status" value={form.status} onChange={onChange}>
                <option value="">Select status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Rent Type</label>
              <select className="form-select" name="rent_period" value={form.rent_period} onChange={onChange}>
                <option value="">Select rent duration</option>
                <option value="monthly">Monthly</option>
                <option value="15_days">15 Days</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Rent Price</label>
              <input className="form-control" type="number" name="rent_price" value={form.rent_price} onChange={onChange} />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="available_for_sale" name="available_for_sale" checked={form.available_for_sale} onChange={onChange} />
                <label className="form-check-label" htmlFor="available_for_sale">Available for sale</label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Images</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                name="images"
                multiple
                onChange={onFilesSelected}
              />
              <div className="d-flex flex-wrap gap-3 mt-3">
                {existingImages.map((image) => (
                  <div key={`existing-${image.id}`} className="position-relative" style={{ width: '150px', height: '100px' }}>
                    <img
                      src={image.url}
                      alt="Existing"
                      className="img-fluid rounded border"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                      onClick={() => removeExistingImage(image.id)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newImages.map((image) => (
                  <div key={`new-${image.id}`} className="position-relative" style={{ width: '150px', height: '100px' }}>
                    <img
                      src={image.url}
                      alt="New"
                      className="img-fluid rounded border"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                      onClick={() => removeNewImage(image.id)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
