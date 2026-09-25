import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Plus, Clock, MapPin, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';

const CitizenDashboard = () => {
    const [threatReports, setThreatReports] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [threatRes, incidentRes] = await Promise.all([
                    api.get('/threat-reports/mine'),
                    api.get('/incidents/mine')
                ]);
                setThreatReports(threatRes.data);
                setIncidents(incidentRes.data);
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const canDelete = (report) => {
        // Can delete if status is SUBMITTED or PENDING (not yet reviewed)
        const deletableStatuses = ['SUBMITTED', 'PENDING'];
        return deletableStatuses.includes(report.status);
    };

    const handleDelete = async (report, type) => {
        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            return;
        }

        try {
            if (type === 'incident') {
                await api.delete(`/incidents/${report._id}/mine`);
                setIncidents(incidents.filter(i => i._id !== report._id));
            } else {
                await api.delete(`/threat-reports/${report._id}/mine`);
                setThreatReports(threatReports.filter(t => t._id !== report._id));
            }
        } catch (err) {
            console.error('Failed to delete report:', err);
            alert(err.response?.data?.message || 'Failed to delete report. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': 
            case 'SUBMITTED': 
            case 'UNDER_REVIEW': 
                return 'status-orange';
            case 'VALIDATED': 
            case 'IN_PROGRESS': 
            case 'RESOLVED': 
                return 'status-purple';
            case 'REJECTED': 
            case 'CLOSED': 
                return 'status-red';
            default: return '';
        }
    };

    const allReports = [...threatReports, ...incidents];

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className="max-w-6xl mx-auto px-6 mt-28 animate-fade-in">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Reports</h1>
                        <p className="text-text-muted">Track the status of your reported incidents and wildlife threats.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/report" className="btn-primary flex items-center gap-2">
                            <Plus size={20} />
                            New Incident
                        </Link>
                        <Link to="/threat-report" className="btn-secondary flex items-center gap-2">
                            <Plus size={20} />
                            New Threat Report
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 text-center glass-morphism">
                        <span className="block text-text-muted text-sm mb-2">Total Reports</span>
                        <span className="text-3xl font-extrabold text-primary">{allReports.length}</span>
                    </div>
                    <div className="p-6 text-center glass-morphism">
                        <span className="block text-text-muted text-sm mb-2">Resolved</span>
                        <span className="text-3xl font-extrabold text-primary">
                            {allReports.filter(i => ['VALIDATED', 'RESOLVED', 'CLOSED'].includes(i.status)).length}
                        </span>
                    </div>
                    <div className="p-6 text-center glass-morphism">
                        <span className="block text-text-muted text-sm mb-2">Pending</span>
                        <span className="text-3xl font-extrabold text-primary">
                            {allReports.filter(i => ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(i.status)).length}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading your reports...</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {allReports.length === 0 ? (
                            <div className="py-16 px-8 text-center flex flex-col items-center gap-4 glass-morphism">
                                <AlertCircle size={48} className="text-text-muted" />
                                <h3 className="text-2xl font-bold">No reports found</h3>
                                <p className="text-text-muted max-w-md">You haven't reported any incidents or wildlife threats yet. Help us protect wildlife by reporting threats you encounter.</p>
                                <div className="flex gap-3">
                                    <Link to="/report" className="btn-primary">Report an Incident</Link>
                                    <Link to="/threat-report" className="btn-secondary">Report a Threat</Link>
                                </div>
                            </div>
                        ) : (
                            allReports.map((report) => (
                                <div key={report._id} className="p-6 px-10 glass-morphism transition-all hover:translate-x-2 hover:bg-surface/90 cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-4 mb-1">
                                                <span className={`status-badge ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                                                    <Clock size={14} />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {report.threatType ? 'Threat Report' : 'Incident'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold">
                                                {report.title || (report.threatType ? report.threatType.replace('_', ' ') : 'Incident Report')}
                                            </h3>
                                            {report.urgencyLevel && (
                                                <p className="text-sm font-semibold text-primary">{report.urgencyLevel}</p>
                                            )}
                                            {report.category && (
                                                <p className="text-sm text-text-muted">{report.category.replace('_', ' ')}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <MapPin size={14} />
                                                <span>Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {canDelete(report) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(report, report.threatType ? 'threat' : 'incident');
                                                    }}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete report"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <ChevronRight className="text-text-muted" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CitizenDashboard;
