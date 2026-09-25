import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import api from '../utils/api';
import { 
  FileText, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  Users,
  Plus,
  Save,
  X,
  Shield,
  Flame,
  TreePine,
  Heart,
  Users2,
  HelpCircle,
  Flag,
  Mail,
  Phone,
  UserCircle,
  Sparkles,
  ChevronRight,
  FileWarning
} from 'lucide-react';

const CaseManagement = () => {
    const navigate = useNavigate();
    const navPt = useFixedNavOffsetClass();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [threatReports, setThreatReports] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        threatType: '',
        search: ''
    });
    const [newCase, setNewCase] = useState({
        threatReportId: '',
        threatType: 'POACHING',
        location: { lat: 0, lng: 0, address: '' },
        reporterInfo: { name: '', email: '', phone: '', isAnonymous: false },
        dateTime: new Date().toISOString().slice(0, 16),
        priority: 'MEDIUM',
        assignedOfficer: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchCases();
        fetchStats();
        fetchOfficers();
        fetchThreatReports();
        // Intentional: initial load only; filter changes use Apply / clear actions.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOfficers = async () => {
        try {
            const response = await api.get('/auth/users');
            const officers = response.data.filter(user => user.role === 'OFFICER');
            setOfficers(officers || []);
        } catch (err) {
            console.error('Failed to fetch officers:', err);
        }
    };

    const fetchThreatReports = async () => {
        try {
            const response = await api.get('/threat-reports');
            setThreatReports(response.data.reports || []);
        } catch (err) {
            console.error('Failed to fetch threat reports:', err);
        }
    };

    const handleThreatReportChange = async (reportId) => {
        setNewCase({ ...newCase, threatReportId: reportId });
        
        if (reportId) {
            try {
                const response = await api.get(`/threat-reports/${reportId}`);
                const report = response.data;
                if (report && report.location) {
                    setNewCase(prev => ({
                        ...prev,
                        threatReportId: reportId,
                        location: report.location,
                        threatType: report.threatType || prev.threatType,
                        dateTime: report.dateTime ? new Date(report.dateTime).toISOString().slice(0, 16) : prev.dateTime,
                        reporterInfo: report.reporterInfo || prev.reporterInfo
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch threat report details:', err);
                if (err.response?.status === 404) {
                    console.warn('Threat report not found, it may have been deleted');
                    // Don't reset the form, just show a warning
                    setError('Selected threat report not found. It may have been deleted.');
                    setTimeout(() => setError(null), 3000);
                } else {
                    console.error('Error fetching threat report:', err);
                }
            }
        } else {
            // Reset form fields when no report is selected
            setNewCase(prev => ({
                ...prev,
                threatReportId: '',
                location: { lat: 0, lng: 0, address: '' },
                reporterInfo: { name: '', email: '', phone: '', isAnonymous: false },
                dateTime: new Date().toISOString().slice(0, 16),
                threatType: 'POACHING'
            }));
        }
    };

    const fetchCases = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.threatType) params.append('threatType', filters.threatType);
            
            const response = await api.get(`/cases?${params.toString()}`);
            setCases(response.data.cases || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch cases');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/cases/stats/overview');
            const statusStats = response.data.statusBreakdown || [];
            
            const newStats = {
                total: statusStats.reduce((sum, stat) => sum + stat.count, 0),
                new: statusStats.find(s => s._id === 'NEW')?.count || 0,
                inProgress: statusStats.find(s => s._id === 'IN_PROGRESS')?.count || 0,
                resolved: statusStats.find(s => s._id === 'RESOLVED')?.count || 0
            };
            
            setStats(newStats);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        fetchCases();
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            priority: '',
            threatType: '',
            search: ''
        });
        setTimeout(fetchCases, 0);
    };

    const handleCreateCase = async () => {
        // Frontend validation
        if (!newCase.location.address || !newCase.location.address.trim()) {
            setError('Please enter a location address before filing the case.');
            return;
        }
        if (!newCase.dateTime) {
            setError('Please set a date and time for the case.');
            return;
        }

        try {
            setError(null);
            console.log('Creating case with data:', newCase);

            const response = await api.post('/cases', newCase);
            console.log('Case created successfully:', response.data);

            setCases([response.data.case, ...cases]);
            setShowCreateForm(false);
            resetNewCaseForm();
            fetchStats();
        } catch (err) {
            console.error('Error creating case:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create case');
        }
    };

    const resetNewCaseForm = () => {
        setNewCase({
            threatReportId: '',
            threatType: 'POACHING',
            location: { lat: 0, lng: 0, address: '' },
            reporterInfo: { name: '', email: '', phone: '', isAnonymous: false },
            dateTime: new Date().toISOString().slice(0, 16),
            priority: 'MEDIUM',
            assignedOfficer: ''
        });
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

    const filteredCases = cases.filter(case_ => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                case_.caseId?.toLowerCase().includes(searchLower) ||
                case_.threatType?.toLowerCase().includes(searchLower) ||
                case_.location?.address?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

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

    return (
        <div className="min-h-screen pb-16">
            <Navbar />
            <main className={`max-w-7xl mx-auto px-6 animate-fade-in ${navPt || 'mt-12'}`}>
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Case Management</h1>
                            <p className="text-text-muted">Manage and track wildlife threat cases</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 btn-primary"
                        >
                            <Plus size={20} />
                            <span>File New Case</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Total Cases</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="text-primary" size={24} />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">New Cases</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                            </div>
                            <AlertTriangle className="text-blue-600" size={24} />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                            </div>
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>

                    <div className="p-6 glass-morphism">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 glass-morphism mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold">Filters</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="form-group">
                            <label className="text-sm font-medium text-text-muted">Search</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-text-muted" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="Search cases..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-medium text-text-muted">Status</label>
                            <select
                                className="input-field"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="NEW">New</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-medium text-text-muted">Priority</label>
                            <select
                                className="input-field"
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                            >
                                <option value="">All Priority</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="text-sm font-medium text-text-muted">Threat Type</label>
                            <select
                                className="input-field"
                                value={filters.threatType}
                                onChange={(e) => handleFilterChange('threatType', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="POACHING">Poaching</option>
                                <option value="FOREST_FIRE">Forest Fire</option>
                                <option value="INJURED_ANIMAL">Injured Animal</option>
                                <option value="ILLEGAL_LOGGING">Illegal Logging</option>
                                <option value="HUMAN_WILDLIFE_CONFLICT">Human-Wildlife Conflict</option>
                            </select>
                        </div>

                        <div className="flex gap-2 items-end">
                            <button
                                onClick={applyFilters}
                                className="btn-primary flex-1"
                            >
                                Apply
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cases Table */}
                <div className="glass-morphism">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold">Cases ({filteredCases.length})</h3>
                    </div>
                    
                    {error ? (
                        <div className="p-6 text-center text-danger">
                            {error}
                        </div>
                    ) : filteredCases.length === 0 ? (
                        <div className="p-12 text-center text-text-muted">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No cases found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 font-semibold">Case ID</th>
                                        <th className="text-left p-4 font-semibold">Threat Type</th>
                                        <th className="text-left p-4 font-semibold">Location</th>
                                        <th className="text-left p-4 font-semibold">Assigned Officer</th>
                                        <th className="text-left p-4 font-semibold">Priority</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-left p-4 font-semibold">Created</th>
                                        <th className="text-left p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCases.map((case_) => (
                                        <tr key={case_._id} className="border-b border-border hover:bg-surface-light transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-medium">{case_.caseId}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{formatThreatType(case_.threatType)}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-text-muted" />
                                                    <span className="text-sm truncate max-w-xs">
                                                        {case_.location?.address || 'Unknown location'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {case_.assignedOfficer ? (
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-text-muted" />
                                                        <span className="text-sm">{case_.assignedOfficer.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-text-muted">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                                                    {case_.priority}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                                                    {case_.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-text-muted" />
                                                    <span className="text-sm">
                                                        {new Date(case_.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => navigate(`/cases/${case_.caseId}`)}
                                                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    <Eye size={16} />
                                                    <span className="text-sm">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Case Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-emerald-600 px-6 py-5 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <FileWarning size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">File New Case</h2>
                                            <p className="text-white/80 text-sm">Create a new wildlife threat case</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setShowCreateForm(false); setError(null); }}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {/* Section 1: Case Details */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                            <Sparkles size={16} className="text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800">Case Details</h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Threat Report */}
                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <FileText size={14} className="text-primary" />
                                                Linked Threat Report
                                            </label>
                                            <select
                                                className="input-field bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={newCase.threatReportId}
                                                onChange={(e) => handleThreatReportChange(e.target.value)}
                                            >
                                                <option value="">Select Threat Report (Optional)</option>
                                                {threatReports.map(report => (
                                                    <option key={report._id} value={report._id}>
                                                        {report.reportId} - {formatThreatType(report.threatType)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Threat Type */}
                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <AlertTriangle size={14} className="text-primary" />
                                                Threat Type
                                            </label>
                                            <select
                                                className="input-field bg-white text-gray-900 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={newCase.threatType}
                                                onChange={(e) => setNewCase({ ...newCase, threatType: e.target.value })}
                                            >
                                                <option value="POACHING">🦏 Poaching</option>
                                                <option value="FOREST_FIRE">🔥 Forest Fire</option>
                                                <option value="INJURED_ANIMAL">🩹 Injured Animal</option>
                                                <option value="ILLEGAL_LOGGING">🌲 Illegal Logging</option>
                                                <option value="HUMAN_WILDLIFE_CONFLICT">🐘 Human-Wildlife Conflict</option>
                                                <option value="OTHER">❓ Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Location & Time */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                            <MapPin size={16} className="text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800">Location & Time</h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Location */}
                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <MapPin size={14} className="text-blue-600" />
                                                Location Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="input-field bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                                                    placeholder="Enter the incident location (required)"
                                                    value={newCase.location.address}
                                                    onChange={(e) => setNewCase({ 
                                                        ...newCase, 
                                                        location: { ...newCase.location, address: e.target.value }
                                                    })}
                                                />
                                                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Date & Time */}
                                            <div className="form-group">
                                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                    <Calendar size={14} className="text-blue-600" />
                                                    Date & Time
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="datetime-local"
                                                        className="input-field bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                                                        value={newCase.dateTime}
                                                        onChange={(e) => setNewCase({ ...newCase, dateTime: e.target.value })}
                                                    />
                                                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="form-group">
                                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                    <Flag size={14} className="text-blue-600" />
                                                    Priority Level
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (
                                                        <button
                                                            key={priority}
                                                            type="button"
                                                            onClick={() => setNewCase({ ...newCase, priority })}
                                                            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                                                newCase.priority === priority
                                                                    ? priority === 'LOW' ? 'bg-gray-600 text-white shadow-md scale-105'
                                                                    : priority === 'MEDIUM' ? 'bg-blue-600 text-white shadow-md scale-105'
                                                                    : priority === 'HIGH' ? 'bg-orange-600 text-white shadow-md scale-105'
                                                                    : 'bg-red-600 text-white shadow-md scale-105'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {priority.charAt(0) + priority.slice(1).toLowerCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Assignment */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-purple-100 rounded-lg">
                                            <Shield size={16} className="text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800">Assignment</h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                            <User size={14} className="text-purple-600" />
                                            Assign Officer
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="input-field bg-white text-gray-900 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pl-10 appearance-none"
                                                value={newCase.assignedOfficer}
                                                onChange={(e) => setNewCase({ ...newCase, assignedOfficer: e.target.value })}
                                            >
                                                <option value="">Select Officer (Optional)</option>
                                                {officers.map(officer => (
                                                    <option key={officer._id} value={officer._id}>
                                                        {officer.name} - {officer.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <UserCircle size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <ChevronRight size={16} className="absolute right-3 top-3 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Reporter Information */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-amber-100 rounded-lg">
                                            <UserCircle size={16} className="text-amber-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-800">Reporter Information</h3>
                                        <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <User size={14} className="text-amber-600" />
                                                Name
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="input-field bg-white text-gray-900 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pl-10"
                                                    placeholder="Reporter name"
                                                    value={newCase.reporterInfo.name}
                                                    onChange={(e) => setNewCase({ 
                                                        ...newCase, 
                                                        reporterInfo: { ...newCase.reporterInfo, name: e.target.value }
                                                    })}
                                                />
                                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Mail size={14} className="text-amber-600" />
                                                Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    className="input-field bg-white text-gray-900 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pl-10"
                                                    placeholder="Email address"
                                                    value={newCase.reporterInfo.email}
                                                    onChange={(e) => setNewCase({ 
                                                        ...newCase, 
                                                        reporterInfo: { ...newCase.reporterInfo, email: e.target.value }
                                                    })}
                                                />
                                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Phone size={14} className="text-amber-600" />
                                                Phone
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    className="input-field bg-white text-gray-900 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pl-10"
                                                    placeholder="Phone number"
                                                    value={newCase.reporterInfo.phone}
                                                    onChange={(e) => setNewCase({ 
                                                        ...newCase, 
                                                        reporterInfo: { ...newCase.reporterInfo, phone: e.target.value }
                                                    })}
                                                />
                                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Anonymous Checkbox */}
                                    <label className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="anonymous"
                                                className="sr-only peer"
                                                checked={newCase.reporterInfo.isAnonymous}
                                                onChange={(e) => setNewCase({ 
                                                    ...newCase, 
                                                    reporterInfo: { ...newCase.reporterInfo, isAnonymous: e.target.checked }
                                                })}
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                <CheckCircle size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            <span className="text-sm text-gray-600">Keep reporter anonymous</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                {error && (
                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                        <AlertTriangle size={14} className="flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500" />
                                        Fields marked with <span className="text-red-500 font-bold">*</span> are required
                                    </p>
                                    <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowCreateForm(false); setError(null); }}
                                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateCase}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium"
                                    >
                                        <Save size={18} />
                                        <span>File Case</span>
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CaseManagement;
