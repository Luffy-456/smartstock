import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Users as UsersIcon, Plus, UserCheck, Shield, AlertCircle, Mail, Phone, Lock, User } from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/users/'),
        api.get('/roles/'),
      ]);
      setUsers(uRes.data.results || uRes.data || []);
      setRoles(rRes.data.results || rRes.data || []);
      if (rRes.data && rRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, role: rRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/users/register/', formData);
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: roles[0]?.id || '',
      });
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-xl-4 fade-in">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-semibold"
              style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            >
              <Shield size={12} className="me-1" />
              Role-Based Access Control
            </span>
            <span className="text-muted small">System Security & Permissions</span>
          </div>
          <h2 className="fw-bold mb-0 text-dark">User Management & Credentials</h2>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setShowModal(true);
          }}
          className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm px-3"
        >
          <Plus size={16} />
          <span>Add System User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Contact Phone</th>
                <th>Role & Permissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                    <div>Loading system user accounts...</div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isAdmin = u.role_name === 'Admin' || u.is_superuser;
                  const isManager = u.role_name === 'Warehouse Manager';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                            style={{
                              width: '38px',
                              height: '38px',
                              background: isAdmin
                                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                : isManager
                                ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                                : 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
                              fontSize: '0.85rem',
                            }}
                          >
                            {(u.first_name?.[0] || u.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">
                              {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                            </div>
                            {u.is_superuser && (
                              <span
                                className="badge rounded-pill fw-medium"
                                style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.65rem' }}
                              >
                                Superuser
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold text-dark">{u.username}</td>
                      <td className="small text-muted">{u.email}</td>
                      <td className="small text-muted">{u.phone || '—'}</td>
                      <td>
                        <span
                          className="badge rounded-pill fw-semibold"
                          style={{
                            backgroundColor: isAdmin
                              ? '#ecfdf5'
                              : isManager
                              ? '#eff6ff'
                              : '#fffbeb',
                            color: isAdmin
                              ? '#065f46'
                              : isManager
                              ? '#1e40af'
                              : '#92400e',
                            border: `1px solid ${
                              isAdmin
                                ? '#a7f3d0'
                                : isManager
                                ? '#bfdbfe'
                                : '#fde68a'
                            }`,
                            fontSize: '0.72rem',
                          }}
                        >
                          {u.role_name || 'Standard User'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge rounded-pill fw-medium d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: u.is_active ? '#ecfdf5' : '#f1f5f9',
                            color: u.is_active ? '#065f46' : '#64748b',
                            fontSize: '0.72rem',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: u.is_active ? '#10b981' : '#94a3b8',
                            }}
                          ></span>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted small">
                    <UsersIcon size={28} className="text-muted mb-2 d-block mx-auto" />
                    No users recorded in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Create System User</h5>
                  <span className="text-muted small">Assign enterprise credentials & operational role</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {errorMsg && (
                    <div className="alert alert-modern alert-modern-danger py-2 mb-3">
                      <AlertCircle size={16} />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Initial Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+91 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Operational Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3" disabled={submitting}>
                    {submitting ? 'Creating User...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
