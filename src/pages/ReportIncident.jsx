import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import ImageUpload from '../components/ImageUpload';
import api from '../utils/api';
import { Send, Camera, MapPin, AlertCircle } from 'lucide-react';

// Fix Leaflet marker icon issue
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const ReportIncident = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'ILLEGAL_LOGGING',
    });
    const [position, setPosition] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => {
                    console.error('Error getting location:', err);
                }
            );
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            setError('Please select a location on the map');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('location', JSON.stringify({
                lat: position.lat,
                lng: position.lng,
                address: 'Selected Location'
            }));

            // Append images if any
            photos.forEach((photo) => {
                if (typeof photo !== 'string') {
                    formDataToSend.append('images', photo);
                }
            });

            await api.post('/incidents', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 mt-12 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Report an Incident</h1>
                    <p className="text-text-muted">Provide accurate details to help us take quick action.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-8">
                        <section className="p-8 glass-morphism">
                            <h3 className="flex items-center gap-3 mb-6 text-primary text-xl font-bold"><AlertCircle size={20} /> Basic Information</h3>
                            <div className="form-group">
                                <label className="text-sm font-medium text-text-muted">Incident Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Brief summary (e.g., Poaching near North Ridge)"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-sm font-medium text-text-muted">Category</label>
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="ILLEGAL_LOGGING">Illegal Logging</option>
                                    <option value="FOREST_FIRE">Forest Fire</option>
                                    <option value="POACHING">Poaching</option>
                                    <option value="ANIMAL_CONFLICT">Human-Wildlife Conflict</option>
                                    <option value="TRAPPED_INJURED_ANIMAL">Trapped/Injured Animal</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="text-sm font-medium text-text-muted">Detailed Description</label>
                                <textarea
                                    rows="4"
                                    className="input-field"
                                    placeholder="Describe what you saw in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                        </section>

                        <section className="p-8 glass-morphism">
                            <h3 className="flex items-center gap-3 mb-6 text-primary text-xl font-bold"><Camera size={20} /> Media Upload (Optional)</h3>
                            <ImageUpload 
                                images={photos} 
                                onChange={setPhotos} 
                                maxImages={5} 
                            />
                        </section>
                    </div>

                    <div className="flex flex-col gap-8">
                        <section className="p-8 glass-morphism h-full flex flex-col">
                            <h3 className="flex items-center gap-3 mb-4 text-primary text-xl font-bold"><MapPin size={20} /> Incident Location</h3>
                            <p className="text-sm text-text-muted mb-4">Click on the map to mark the exact location.</p>
                            <div className="rounded-2xl overflow-hidden border border-border mb-4 flex-grow relative">
                                <MapContainer center={position ? [position.lat, position.lng] : [7.8731, 80.7718]} zoom={position ? 13 : 7} scrollWheelZoom={true} style={{ height: '100%', minHeight: '350px', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                            {position && (
                                <div className="bg-surface-light p-3 rounded-lg font-mono text-sm mb-4">
                                    Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
                                </div>
                            )}
                            {error && <div className="bg-red-500/10 border border-danger text-danger p-3 rounded-lg text-sm text-center mb-4">{error}</div>}
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3 mt-auto" disabled={isSubmitting}>
                                <Send size={18} />
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ReportIncident;
