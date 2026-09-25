import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Send, Camera, MapPin, AlertCircle, User, Clock, Flag } from 'lucide-react';

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

const ThreatReport = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        threatType: 'POACHING',
        description: '',
        dateTime: new Date().toISOString().slice(0, 16),
        urgencyLevel: 'MEDIUM',
        reporterInfo: {
            name: '',
            email: '',
            phone: '',
            isAnonymous: false
        }
    });
    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState('');
    const [media, setMedia] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

        if (!formData.reporterInfo.name && !formData.reporterInfo.isAnonymous) {
            setError('Please provide your name or report anonymously');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        try {
            const reportData = {
                ...formData,
                location: {
                    lat: position.lat,
                    lng: position.lng,
                    address: address || 'Selected Location'
                },
                media: media.map(file => ({
                    url: file.url || URL.createObjectURL(file),
                    mediaType: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'
                }))
            };

            await api.post('/threat-reports', reportData);
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit threat report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setMedia([...media, ...files]);
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    if (success) {
        return (
            <div className="min-h-screen pb-16">
                <Navbar />
                <main className="max-w-4xl mx-auto px-6 mt-12 animate-fade-in">
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-green-600" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 text-green-600">Threat Report Submitted Successfully!</h1>
                        <p className="text-text-muted mb-8">Your report has been received and will be reviewed by our team.</p>
                        <p className="text-sm text-text-muted">Redirecting to dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 mt-12 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Report Wildlife Threat</h1>
                    <p className="text-text-muted">Help protect wildlife by reporting threats quickly and accurately.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Basic Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="p-8 glass-morphism">
                            <h3 className="flex items-center gap-3 mb-6 text-primary text-xl font-bold">
                                <AlertCircle size={20} /> Threat Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="text-sm font-medium text-text-muted">Threat Type *</label>
                                    <select
                                        className="input-field"
                                        value={formData.threatType}
                                        onChange={(e) => setFormData({ ...formData, threatType: e.target.value })}
                                        required
                                    >
                                        <option value="POACHING">Poaching</option>
                                        <option value="FOREST_FIRE">Forest Fire</option>
                                        <option value="INJURED_ANIMAL">Injured Animal</option>
                                        <option value="ILLEGAL_LOGGING">Illegal Logging</option>
                                        <option value="HUMAN_WILDLIFE_CONFLICT">Human-Wildlife Conflict</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="text-sm font-medium text-text-muted">Urgency Level</label>
                                    <select
                                        className="input-field"
                                        value={formData.urgencyLevel}
                                        onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>

                                <div className="form-group md:col-span-2">
                                    <label className="text-sm font-medium text-text-muted">Date & Time of Incident *</label>
                                    <input
                                        type="datetime-local"
                                        className="input-field"
                                        value={formData.dateTime}
                                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group mt-6">
                                <label className="text-sm font-medium text-text-muted">Detailed Description *</label>
                                <textarea
                                    rows="6"
                                    className="input-field"
                                    placeholder="Describe the threat in detail. Include what you observed, any suspicious activities, animal behavior, etc."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                        </section>

                        <section className="p-8 glass-morphism">
                            <h3 className="flex items-center gap-3 mb-6 text-primary text-xl font-bold">
                                <User size={20} /> Reporter Information
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={formData.reporterInfo.isAnonymous}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            reporterInfo: { ...formData.reporterInfo, isAnonymous: e.target.checked }
                                        })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <label htmlFor="anonymous" className="text-sm font-medium">
                                        Report anonymously
                                    </label>
                                </div>

                                {!formData.reporterInfo.isAnonymous && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="text-sm font-medium text-text-muted">Your Name *</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="John Doe"
                                                value={formData.reporterInfo.name}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    reporterInfo: { ...formData.reporterInfo, name: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="text-sm font-medium text-text-muted">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                placeholder="+94 77 123 4567"
                                                value={formData.reporterInfo.phone}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    reporterInfo: { ...formData.reporterInfo, phone: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="form-group md:col-span-2">
                                            <label className="text-sm font-medium text-text-muted">Email Address</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                placeholder="john@example.com"
                                                value={formData.reporterInfo.email}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    reporterInfo: { ...formData.reporterInfo, email: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="p-8 glass-morphism">
                            <h3 className="flex items-center gap-3 mb-6 text-primary text-xl font-bold">
                                <Camera size={20} /> Evidence (Photos/Videos)
                            </h3>
                            
                            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                                <Camera size={32} className="mx-auto mb-4 text-text-muted" />
                                <p className="text-text-muted mb-4">Upload photos or videos as evidence</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                    Choose Files
                                </label>
                            </div>

                            {media.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {media.map((file, index) => (
                                        <div key={index} className="relative group">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-24 bg-surface-light rounded-lg flex items-center justify-center">
                                                    <Camera size={24} className="text-text-muted" />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(index)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Location */}
                    <div className="space-y-8">
                        <section className="p-8 glass-morphism h-full flex flex-col">
                            <h3 className="flex items-center gap-3 mb-4 text-primary text-xl font-bold">
                                <MapPin size={20} /> Location
                            </h3>
                            
                            <p className="text-sm text-text-muted mb-4">Click on the map to mark the exact location of the threat.</p>
                            
                            <div className="rounded-2xl overflow-hidden border border-border mb-4 flex-grow relative">
                                <MapContainer
                                    center={position ? [position.lat, position.lng] : [7.8731, 80.7718]}
                                    zoom={position ? 13 : 7}
                                    scrollWheelZoom={true}
                                    style={{ height: '400px', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>

                            <div className="form-group">
                                <label className="text-sm font-medium text-text-muted">Address Description</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Near the main entrance, 100m from the road..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            {position && (
                                <div className="bg-surface-light p-3 rounded-lg font-mono text-sm mb-4">
                                    <div>Lat: {position.lat.toFixed(6)}</div>
                                    <div>Lng: {position.lng.toFixed(6)}</div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-danger text-danger p-3 rounded-lg text-sm text-center mb-4">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary w-full flex items-center justify-center gap-3 mt-auto"
                                disabled={isSubmitting}
                            >
                                <Send size={18} />
                                {isSubmitting ? 'Submitting...' : 'Submit Threat Report'}
                            </button>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ThreatReport;
