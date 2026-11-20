import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Users as UsersIcon, Plus, UserCheck, Shield, AlertCircle } from 'lucide-react';

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
    <div className="container-fluid px-3 px-lg-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">User Management & Access Control</h2>
          <p className="text-muted small mb-0">Manage system users, credentials, and role-based operational permissions</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setShowModal(true);
          }}
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 align-self-start align-self-sm-auto px-3"
        >
          <Plus size={16} />
          <span>Add System User</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role & Permissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">Loading user accounts...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                          {u.first_name ? u.first_name[0] : u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{u.first_name} {u.last_name}</div>
                          {u.is_staff && <span className="badge bg-danger-subtle text-danger small">Superuser</span>}
                        </div>
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{u.username}</td>
                    <td>{u.email}</td>
                    <td className="small text-muted">{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.role_name === 'Admin' ? 'bg-danger-subtle text-danger' : u.role_name === 'Warehouse Manager' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        {u.role_name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'bg-success-subtle text-success' : 'bg-secondary'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create System User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {errorMsg && (
                    <div className="alert alert-danger small py-2 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+91 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Role</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
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
