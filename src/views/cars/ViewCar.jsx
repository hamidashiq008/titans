import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../axios/Axios';
import { Button, Badge } from 'react-bootstrap';

const ViewCar = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = useMemo(() => user?.role === 'super-admin', [user]);

  const [car, setCar] = useState(location.state?.car || null);
  const [loading, setLoading] = useState(!location.state?.car);
  const [error, setError] = useState('');

  const [loadingImages, setLoadingImages] = useState({});

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/cars/${id}`);
        setCar(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load car');
      } finally {
        setLoading(false);
      }
    };

    if (!car) fetchCar();
  }, [car, id]);

  const images = useMemo(() => {
    const urls = car?.image_urls || (car?.images?.[0]?.image_urls) || [];
    return Array.isArray(urls) ? urls.map((u) => ({ url: typeof u === 'string' ? u : u.url })) : [];
  }, [car]);

  const colorHex = useMemo(() => {
    const c = (car?.colour || '').toString().trim();
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
  }, [car]);

  useEffect(() => {
    const initial = {};
    images.forEach((_, idx) => (initial[idx] = true));
    setLoadingImages(initial);
  }, [images]);

  const onImgLoaded = (idx) => setLoadingImages((prev) => ({ ...prev, [idx]: false }));

  if (loading) return <div className="container py-4">Loading…</div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;
  if (!car) return <div className="container py-4">Car not found</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">{car.name || 'Car Details'}</h3>
        <div>
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="d-inline-flex align-items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
            Back
          </Button>
        </div>
      </div>

      <div className="row g-4">
       
        <div className="col-lg-12">
          <div className="card p-3 shadow-sm">
            <div className="row g-3">
              <div className="col-6"><strong>Name: </strong> {car.name}</div>
              <div className="col-6"><strong>Model: </strong> {car?.model ? (car.model.charAt(0).toUpperCase() + car.model.slice(1)) : ''}</div>
              <div className="col-6"><strong>Source: </strong> {car.source ? (car.source.charAt(0).toUpperCase() + car.source.slice(1)) : ''}</div>
              <div className="col-6"><strong>Chassis No: </strong> {car.chasis_number}</div>
              <div className="col-6"><strong>Status: </strong> <Badge bg={car.status === 'available' ? 'success' : car.status === 'rented' ? 'warning' : 'secondary'}>{car.status ? (car.status.charAt(0).toUpperCase() + car.status.slice(1)) : ''}</Badge></div>
              <div className="col-6"><strong>Colour:</strong> <span className="ms-2 align-middle" style={{ width: 50, height: 20, display: 'inline-block', background: car.colour, border: '1px solid #ddd', verticalAlign: 'middle' }} /> </div>
              <div className="col-6"><strong>Rent Type: </strong>{car.rent_period.replaceAll('_', ' ') ? (car.rent_period.charAt(0).toUpperCase() + car.rent_period.slice(1)) : ''}</div>
              <div className="col-6"><strong>Rent Price: AED</strong>  {car.rent_price}</div>
              {/* <div className="col-12">
                {isSuperAdmin && (
                  <Button size="sm" variant="primary" onClick={() => navigate('/cars/list-cars')}>Manage Cars</Button>
                )}
              </div> */}
            </div>
          </div>
        </div>
         <div className="col-lg-12">
          {images.length > 0 ? (
            <div className="row g-3">
              {images.map((img, idx) => (
                <div key={idx} className="col-12 col-sm-6 col-md-4">
                  <div className="position-relative border rounded overflow-hidden" style={{ height: 200 }}>
                    {loadingImages[idx] && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                    <img
                      src={img.url}
                      alt={`Car view ${idx + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', opacity: loadingImages[idx] ? 0 : 1, transition: 'opacity .3s' }}
                      onLoad={() => onImgLoaded(idx)}
                      onError={() => onImgLoaded(idx)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">No images</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCar;
