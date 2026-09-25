import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Loader2, Plus, Search, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const DEPARTMENTS = ['PATROL', 'INVESTIGATION', 'ADMINISTRATION', 'WILDLIFE_RESCUE', 'ANALYTICS'];
const PERMISSIONS = ['VIEW_INCIDENTS', 'MANAGE_INCIDENTS', 'VIEW_CASES', 'MANAGE_CASES', 'VIEW_RESOURCES', 'MANAGE_RESOURCES', 'VIEW_ANALYTICS', 'MANAGE_ALERTS'];

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [form, setForm] = useState({
    userId: '',
    department: DEPARTMENTS[0],
    permissions: []
  });

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, []);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff');
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to load staff', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadStaff();
    loadUsers();
  }, [loadStaff, loadUsers]);

  const filtered = useMemo(() => {
    if (!query.trim()) return staff;
    const q = query.toLowerCase();
    return staff.filter((item) => {
      const name = item?.userId?.name || '';
      const email = item?.userId?.email || '';
      const dept = item?.department || '';
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
    });
  }, [query, staff]);

  const openCreate = () => {
    setEditing(null);
    setForm({ userId: '', department: DEPARTMENTS[0], permissions: [] });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      userId: row?.userId?._id || row?.userId || '',
      department: row?.department || DEPARTMENTS[0],
      permissions: Array.isArray(row?.permissions) ? row.permissions : []
    });
    setShowModal(true);
  };

  const togglePermission = (permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const saveStaff = async (event) => {
    event.preventDefault();
    try {
      if (editing?._id) {
        await api.put(`/staff/${editing._id}`, {
          department: form.department,
          permissions: form.permissions
        });
        notify('Staff updated');
      } else {
        await api.post('/staff', form);
        notify('Staff added');
      }
      setShowModal(false);
      await loadStaff();
    } catch (error) {
      notify(error?.response?.data?.message || 'Save failed', 'error');
    }
  };

  const removeStaff = async () => {
    if (!pendingDeleteId) return;
    try {
      await api.delete(`/staff/${pendingDeleteId}`);
      notify('Staff removed');
      setPendingDeleteId(null);
      await loadStaff();
    } catch (error) {
      notify(error?.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-morphism w-full max-w-md rounded-2xl p-6">
            <h3 className="mb-2 text-xl font-bold">Remove Staff Member</h3>
            <p className="mb-6 text-sm text-text-muted">This removes the staff profile from operations.</p>
            <div className="flex gap-3">
              <button onClick={removeStaff} className="flex-1 rounded-lg bg-red-600 py-2.5 font-semibold text-white">Remove</button>
              <button onClick={() => setPendingDeleteId(null)} className="flex-1 rounded-lg bg-surface-light py-2.5 font-semibold text-text">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-morphism w-full max-w-2xl rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editing ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-text-muted hover:bg-surface-light hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={saveStaff}>
              {!editing && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-muted">Select User</label>
                    <select
                      value={form.userId}
                      onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Choose a user...</option>
                      {users
                        .filter(u => !staff.some(s => (s.userId?._id || s.userId) === u._id))
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>

                  {form.userId && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Selected User Details</p>
                      {(() => {
                        const selected = users.find(u => u._id === form.userId);
                        return selected ? (
                          <div className="mt-2">
                            <p className="text-lg font-bold">{selected.name}</p>
                            <p className="text-sm text-text-muted">{selected.email}</p>
                            <div className="mt-2 inline-block rounded-full bg-surface-light px-2 py-0.5 text-[10px] font-bold">
                              ROLE: {selected.role}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-text-muted italic">Details not found.</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-text-muted">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  className="input-field"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-muted">Permissions</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PERMISSIONS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePermission(p)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${form.permissions.includes(p) ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-surface/40 text-text-muted'}`}
                    >
                      {p.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2">
                {editing ? <Edit2 size={16} /> : <UserPlus size={16} />}
                {editing ? 'Update Staff' : 'Create Staff'}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="mx-auto mt-12 max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black">Staff Operations</h1>
            <p className="text-text-muted">Manage teams, departments, and permissions in one place.</p>
          </div>
          <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add Staff
          </button>
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/40 p-4">
          <Search size={18} className="text-text-muted" />
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search by name, email, or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-full py-20 text-center text-text-muted">
              <Loader2 size={28} className="mx-auto mb-3 animate-spin" /> Loading staff...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/20 py-16 text-center">
              <Users size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted">No matching staff records.</p>
            </div>
          )}

          {!loading && filtered.map((row) => (
            <article key={row._id} className="glass-morphism rounded-2xl border border-white/10 p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{row?.userId?.name || 'Unknown'}</h3>
                  <p className="text-xs text-text-muted">{row?.userId?.email || 'No email'}</p>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {row?.department?.replace('_', ' ') || 'N/A'}
                </span>
              </div>

              <div className="mb-5 flex flex-wrap gap-1.5">
                {(row.permissions || []).slice(0, 4).map((p) => (
                  <span key={p} className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase text-text-muted">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
                {(row.permissions || []).length > 4 && (
                  <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase text-text-muted">
                    +{row.permissions.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(row)} className="flex-1 rounded-lg border border-white/10 bg-surface/40 px-3 py-2 text-sm hover:border-primary/30 hover:text-primary">
                  <span className="inline-flex items-center gap-1"><Edit2 size={14} /> Edit</span>
                </button>
                <button onClick={() => setPendingDeleteId(row._id)} className="flex-1 rounded-lg border border-white/10 bg-surface/40 px-3 py-2 text-sm hover:border-red-500/40 hover:text-red-400">
                  <span className="inline-flex items-center gap-1"><Trash2 size={14} /> Remove</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default StaffManagement;
