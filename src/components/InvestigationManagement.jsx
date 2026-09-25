import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Upload, 
  FileText, 
  Camera, 
  Video, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Flag
} from 'lucide-react';

const InvestigationManagement = ({ caseId, onInvestigationUpdate }) => {
    const [investigation, setInvestigation] = useState({
        findings: [],
        evidence: [],
        actions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form states
    const [newFinding, setNewFinding] = useState('');
    const [newAction, setNewAction] = useState('');
    const [newActionResult, setNewActionResult] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [evidenceDescription, setEvidenceDescription] = useState('');

    const fetchInvestigation = useCallback(async () => {
        if (!caseId) return;
        try {
            const response = await api.get(`/cases/${caseId}`);
            setInvestigation(response.data.investigation || {
                findings: [],
                evidence: [],
                actions: []
            });
        } catch (err) {
            console.error('Error fetching investigation:', err);
        }
    }, [caseId]);

    useEffect(() => {
        fetchInvestigation();
    }, [fetchInvestigation]);

    const handleAddFinding = async () => {
        if (!newFinding.trim()) {
            setError('Please enter a finding description');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            await api.put(`/cases/${caseId}/investigation`, {
                findings: {
                    type: 'NOTE',
                    description: newFinding
                }
            });
            
            setNewFinding('');
            setSuccess('Finding added successfully');
            fetchInvestigation();
            if (onInvestigationUpdate) onInvestigationUpdate();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add finding');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAction = async () => {
        if (!newAction.trim()) {
            setError('Please enter an action description');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            await api.put(`/cases/${caseId}/investigation`, {
                actions: {
                    action: newAction,
                    result: newActionResult
                }
            });
            
            setNewAction('');
            setNewActionResult('');
            setSuccess('Action added successfully');
            fetchInvestigation();
            if (onInvestigationUpdate) onInvestigationUpdate();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add action');
        } finally {
            setLoading(false);
        }
    };

    const handleEvidenceUpload = async () => {
        if (evidenceFiles.length === 0) {
            setError('Please select evidence files to upload');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            for (const file of evidenceFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('description', evidenceDescription);
                formData.append('evidenceType', file.type.startsWith('image/') ? 'PHOTO' : 'VIDEO');
                
                // This would need to be implemented on the backend
                // For now, we'll simulate the upload
                await api.put(`/cases/${caseId}/investigation`, {
                    evidence: {
                        evidenceType: file.type.startsWith('image/') ? 'PHOTO' : 'VIDEO',
                        url: URL.createObjectURL(file), // Temporary URL
                        description: evidenceDescription
                    }
                });
            }
            
            setEvidenceFiles([]);
            setEvidenceDescription('');
            setSuccess('Evidence uploaded successfully');
            fetchInvestigation();
            if (onInvestigationUpdate) onInvestigationUpdate();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload evidence');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setEvidenceFiles([...evidenceFiles, ...files]);
    };

    const removeEvidenceFile = (index) => {
        setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-8">
            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} />
                    {success}
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Investigation Findings */}
            <section className="p-6 glass-morphism">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText size={20} />
                    Investigation Findings
                </h3>
                
                {/* Add New Finding */}
                <div className="mb-6 p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Add New Finding</h4>
                    <div className="flex gap-3">
                        <textarea
                            className="input-field flex-1"
                            rows="3"
                            placeholder="Describe your investigation findings..."
                            value={newFinding}
                            onChange={(e) => setNewFinding(e.target.value)}
                        />
                        <button
                            onClick={handleAddFinding}
                            disabled={loading}
                            className="btn-primary px-6 py-2 self-end"
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                </div>
                
                {/* Existing Findings */}
                <div className="space-y-4">
                    {investigation.findings.length > 0 ? (
                        investigation.findings.map((finding, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-text-muted" />
                                        <span className="font-medium">
                                            {finding.addedBy?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <Clock size={14} />
                                        {formatDate(finding.addedAt)}
                                    </div>
                                </div>
                                <p className="text-text">{finding.description}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-muted text-center py-8">No investigation findings yet.</p>
                    )}
                </div>
            </section>

            {/* Actions Taken */}
            <section className="p-6 glass-morphism">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Flag size={20} />
                    Actions Taken
                </h3>
                
                {/* Add New Action */}
                <div className="mb-6 p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Record New Action</h4>
                    <div className="space-y-3">
                        <textarea
                            className="input-field"
                            rows="3"
                            placeholder="Describe the action taken..."
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value)}
                        />
                        <textarea
                            className="input-field"
                            rows="2"
                            placeholder="Result of the action (optional)..."
                            value={newActionResult}
                            onChange={(e) => setNewActionResult(e.target.value)}
                        />
                        <button
                            onClick={handleAddAction}
                            disabled={loading}
                            className="btn-primary px-6 py-2"
                        >
                            <Plus size={16} />
                            Record Action
                        </button>
                    </div>
                </div>
                
                {/* Existing Actions */}
                <div className="space-y-4">
                    {investigation.actions.length > 0 ? (
                        investigation.actions.map((action, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-text-muted" />
                                        <span className="font-medium">
                                            {action.takenBy?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <Clock size={14} />
                                        {formatDate(action.takenAt)}
                                    </div>
                                </div>
                                <p className="text-text mb-2">{action.action}</p>
                                {action.result && (
                                    <div className="bg-surface-light p-3 rounded text-sm">
                                        <strong>Result:</strong> {action.result}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-text-muted text-center py-8">No actions recorded yet.</p>
                    )}
                </div>
            </section>

            {/* Evidence Management */}
            <section className="p-6 glass-morphism">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Camera size={20} />
                    Evidence Management
                </h3>
                
                {/* Upload Evidence */}
                <div className="mb-6 p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Upload Evidence</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-text-muted">Description</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Describe this evidence..."
                                value={evidenceDescription}
                                onChange={(e) => setEvidenceDescription(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-text-muted">Files</label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <Upload size={32} className="mx-auto mb-3 text-text-muted" />
                                <p className="text-text-muted mb-3">Drag and drop or click to upload</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="evidence-upload"
                                />
                                <label
                                    htmlFor="evidence-upload"
                                    className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                    Choose Files
                                </label>
                            </div>
                            
                            {evidenceFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {evidenceFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {file.type.startsWith('image/') ? (
                                                    <Camera size={16} className="text-text-muted" />
                                                ) : file.type.startsWith('video/') ? (
                                                    <Video size={16} className="text-text-muted" />
                                                ) : (
                                                    <FileText size={16} className="text-text-muted" />
                                                )}
                                                <span className="text-sm">{file.name}</span>
                                                <span className="text-xs text-text-muted">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeEvidenceFile(index)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleEvidenceUpload}
                            disabled={loading || evidenceFiles.length === 0}
                            className="btn-primary px-6 py-2"
                        >
                            <Upload size={16} />
                            Upload Evidence
                        </button>
                    </div>
                </div>
                
                {/* Existing Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investigation.evidence.length > 0 ? (
                        investigation.evidence.map((evidence, index) => (
                            <div key={index} className="border border-border rounded-lg overflow-hidden">
                                {evidence.evidenceType === 'PHOTO' ? (
                                    <img
                                        src={evidence.url}
                                        alt={`Evidence ${index + 1}`}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : evidence.evidenceType === 'VIDEO' ? (
                                    <div className="w-full h-48 bg-surface-light flex items-center justify-center">
                                        <Video size={32} className="text-text-muted" />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-surface-light flex items-center justify-center">
                                        <FileText size={32} className="text-text-muted" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{evidence.evidenceType}</span>
                                        <span className="text-xs text-text-muted">
                                            {formatDate(evidence.uploadedAt)}
                                        </span>
                                    </div>
                                    {evidence.description && (
                                        <p className="text-sm text-text-muted mb-2">{evidence.description}</p>
                                    )}
                                    <p className="text-xs text-text-muted">
                                        Uploaded by {evidence.uploadedBy?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-8">
                            <Camera size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                            <p className="text-text-muted">No evidence uploaded yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default InvestigationManagement;
