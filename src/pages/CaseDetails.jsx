import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InvestigationManagement from '../components/InvestigationManagement';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Calendar,
  Flag,
  Users,
  MessageSquare
} from 'lucide-react';

const CaseDetails = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const navPt = useFixedNavOffsetClass();
    const [case_, setCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchCaseDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/cases/${caseId}`);
            setCase(response.data);
            setEditData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch case details');
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    const handleSaveEdit = async () => {
        try {
            await api.put(`/cases/${caseId}`, editData);
            setCase(editData);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update case');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'NEW': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'UNDER_INVESTIGATION': 'bg-orange-100 text-orange-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'bg-gray-100 text-gray-800',
            'MEDIUM': 'bg-blue-100 text-blue-800',
            'HIGH': 'bg-orange-100 text-orange-800',
            'CRITICAL': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const formatThreatType = (type) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-16">
                <Navbar />
                <main className={`max-w-7xl mx-auto px-6 ${navPt || 'mt-12'}`}>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pb-16">
                <Navbar />
                <main className={`max-w-7xl mx-auto px-6 ${navPt || 'mt-12'}`}>
                    <div className="bg-red-500/10 border border-danger text-danger p-6 rounded-lg">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    if (!case_) {
        return (
            <div className="min-h-screen pb-16">
                <Navbar />
                <main className={`max-w-7xl mx-auto px-6 ${navPt || 'mt-12'}`}>
                    <div className="text-center text-text-muted">Case not found</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className={`max-w-7xl mx-auto px-6 animate-fade-in ${navPt || 'mt-12'}`}>
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/case-management')}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Cases
                    </button>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Case {case_.caseId}</h1>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(case_.status)}`}>
                                    {case_.status.replace(/_/g, ' ')}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(case_.priority)}`}>
                                    {case_.priority} Priority
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border mb-8">
                    <nav className="flex gap-8">
                        {['overview', 'investigation', 'evidence', 'timeline'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-2 border-b-2 transition-colors capitalize ${
                                    activeTab === tab
                                        ? 'border-primary text-primary font-medium'
                                        : 'border-transparent text-text-muted hover:text-primary'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Basic Information */}
                            <section className="p-6 glass-morphism">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText size={20} />
                                    Basic Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Threat Type</label>
                                        <p className="mt-1">{formatThreatType(case_.threatType)}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Date & Time</label>
                                        <p className="mt-1">{new Date(case_.dateTime).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-text-muted">Description</label>
                                        <p className="mt-1">{case_.description || 'No description available'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Location */}
                            <section className="p-6 glass-morphism">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <MapPin size={20} />
                                    Location
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Address</label>
                                        <p className="mt-1">{case_.location?.address || 'No address provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Coordinates</label>
                                        <p className="mt-1 font-mono text-sm">
                                            {case_.location?.lat?.toFixed(6)}, {case_.location?.lng?.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Assignment */}
                            <section className="p-6 glass-morphism">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Users size={20} />
                                    Assignment
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Assigned Officer</label>
                                        <p className="mt-1">
                                            {case_.assignedOfficer ? (
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-text-muted" />
                                                    {case_.assignedOfficer.name}
                                                </div>
                                            ) : (
                                                <span className="text-text-muted">Unassigned</span>
                                            )}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Assigned Team</label>
                                        <p className="mt-1">
                                            {case_.assignedTeam ? (
                                                case_.assignedTeam.name
                                            ) : (
                                                <span className="text-text-muted">No team assigned</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Reporter Information */}
                            <section className="p-6 glass-morphism">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Reporter Information
                                </h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-text-muted">Name</label>
                                        <p className="mt-1">
                                            {case_.reporterInfo?.isAnonymous ? 'Anonymous' : case_.reporterInfo?.name || 'N/A'}
                                        </p>
                                    </div>
                                    
                                    {case_.reporterInfo?.email && !case_.reporterInfo?.isAnonymous && (
                                        <div>
                                            <label className="text-sm font-medium text-text-muted">Email</label>
                                            <p className="mt-1">{case_.reporterInfo.email}</p>
                                        </div>
                                    )}
                                    
                                    {case_.reporterInfo?.phone && !case_.reporterInfo?.isAnonymous && (
                                        <div>
                                            <label className="text-sm font-medium text-text-muted">Phone</label>
                                            <p className="mt-1">{case_.reporterInfo.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Quick Actions */}
                            <section className="p-6 glass-morphism">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                
                                <div className="space-y-3">
                                    {case_.status === 'NEW' && (
                                        <button className="w-full btn-primary">
                                            Assign to Officer
                                        </button>
                                    )}
                                    
                                    {case_.status === 'IN_PROGRESS' && (
                                        <button className="w-full btn-primary">
                                            Start Investigation
                                        </button>
                                    )}
                                    
                                    {case_.status === 'UNDER_INVESTIGATION' && (
                                        <button className="w-full btn-primary">
                                            Mark as Resolved
                                        </button>
                                    )}
                                    
                                    {case_.status === 'RESOLVED' && (
                                        <button className="w-full border border-border rounded-lg hover:bg-surface-light transition-colors">
                                            Close Case
                                        </button>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'investigation' && (
                    <InvestigationManagement 
                        caseId={caseId} 
                        onInvestigationUpdate={fetchCaseDetails}
                    />
                )}

                {activeTab === 'evidence' && (
                    <section className="p-6 glass-morphism">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Camera size={20} />
                                Evidence
                            </h3>
                            <button className="flex items-center gap-2 btn-primary">
                                <Plus size={16} />
                                Upload Evidence
                            </button>
                        </div>
                        
                        {case_.investigation?.evidence?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {case_.investigation.evidence.map((evidence, index) => (
                                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                                        {evidence.evidenceType === 'PHOTO' ? (
                                            <img
                                                src={evidence.url}
                                                alt={`Evidence ${index + 1}`}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-surface-light flex items-center justify-center">
                                                <Camera size={32} className="text-text-muted" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">{evidence.evidenceType}</span>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(evidence.uploadedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {evidence.description && (
                                                <p className="text-sm text-text-muted">{evidence.description}</p>
                                            )}
                                            <p className="text-xs text-text-muted mt-2">
                                                Uploaded by {evidence.uploadedBy?.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-center py-8">No evidence uploaded yet.</p>
                        )}
                    </section>
                )}

                {activeTab === 'timeline' && (
                    <section className="p-6 glass-morphism">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Clock size={20} />
                            Case Timeline
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-4 h-4 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">Case Created</span>
                                        <span className="text-sm text-text-muted">
                                            {new Date(case_.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-muted">Case was created from threat report.</p>
                                </div>
                            </div>

                            {case_.assignedOfficer && (
                                <div className="flex gap-4">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">Case Assigned</span>
                                            <span className="text-sm text-text-muted">
                                                {new Date(case_.updatedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted">
                                            Assigned to {case_.assignedOfficer.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {case_.investigation?.actions?.map((action, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="w-4 h-4 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">Action Taken</span>
                                            <span className="text-sm text-text-muted">
                                                {new Date(action.takenAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted">{action.action}</p>
                                        {action.result && (
                                            <p className="text-sm text-text-muted mt-1">
                                                Result: {action.result}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {case_.resolution && (
                                <div className="flex gap-4">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">Case Resolved</span>
                                            <span className="text-sm text-text-muted">
                                                {new Date(case_.resolution.resolvedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted">{case_.resolution.actionSummary}</p>
                                        {case_.resolution.outcome && (
                                            <p className="text-sm text-text-muted mt-1">
                                                Outcome: {case_.resolution.outcome}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default CaseDetails;
