import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusBadge } from '../components/Badge';
import {
  Warehouse,
  ArrowRightLeft,
  SlidersHorizontal,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  User,
  XCircle,
  Truck
} from 'lucide-react';

export const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'transfers', 'adjustments', 'locations'
  const [inventoryItems, setInventoryItems] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    from_location: '',
    to_location: '',
    notes: '',
    items: [{ product: '', quantity: 1 }],
  });

  // Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    location: '',
    product: '',
    adjusted_quantity: 0,
    reason: 'AUDIT_DISCREPANCY',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, trfRes, adjRes, locRes, prodRes] = await Promise.all([
        api.get(`/inventory-items/?search=${encodeURIComponent(search)}${selectedLocation ? `&location=${selectedLocation}` : ''}`),
        api.get('/transfers/'),
        api.get('/adjustments/'),
        api.get('/locations/'),
        api.get('/products/?status=ACTIVE'),
      ]);

      setInventoryItems(invRes.data.results || invRes.data || []);
      setTransfers(trfRes.data.results || trfRes.data || []);
      setAdjustments(adjRes.data.results || adjRes.data || []);
      setLocations(locRes.data.results || locRes.data || []);
      setProducts(prodRes.data.results || prodRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedLocation]);

  const handleOpenTransfer = () => {
    setTransferForm({
      from_location: locations[0]?.id || '',
      to_location: locations[1]?.id || '',
      notes: '',
      items: [{ product: products[0]?.id || '', quantity: 10 }],
    });
    setModalError('');
    setShowTransferModal(true);
  };

  const handleOpenAdjust = () => {
    setAdjustForm({
      location: locations[0]?.id || '',
      product: products[0]?.id || '',
      adjusted_quantity: 50,
      reason: 'AUDIT_DISCREPANCY',
      notes: '',
    });
    setModalError('');
    setShowAdjustModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (transferForm.from_location === transferForm.to_location) {
      setModalError('Source and Destination locations must be different.');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      const transferNumber = `TRF-${Date.now().toString().slice(-6)}`;
      await api.post('/transfers/', {
        transfer_number: transferNumber,
        ...transferForm,
      });
      setShowTransferModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransfer = async (id) => {
    try {
      await api.post(`/transfers/${id}/complete/`);
      fetchData();
    } catch (err) {
      alert('Failed to complete transfer: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelTransfer = async (id) => {
    try {
      await api.post(`/transfers/${id}/cancel/`);
      fetchData();
    } catch (err) {
      alert('Failed to cancel transfer: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await api.post('/adjustments/', adjustForm);
      setShowAdjustModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to record adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Multi-Location Inventory & Stock Transfers</h2>
          <p className="text-muted small mb-0">Track real-time inventory balances across warehouses and retail stores, move stock, and record adjustments</p>
        </div>
        <div className="d-flex gap-2 align-self-start align-self-sm-auto">
          <button onClick={handleOpenAdjust} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
            <SlidersHorizontal size={14} />
            <span>Stock Adjustment</span>
          </button>
          <button onClick={handleOpenTransfer} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <ArrowRightLeft size={14} />
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2 gap-1">
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            All Stock Levels ({inventoryItems.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            Stock Transfers ({transfers.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'adjustments' ? 'active' : ''}`}
            onClick={() => setActiveTab('adjustments')}
          >
            Audit Adjustments ({adjustments.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            Facilities & Locations ({locations.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: Stock Levels */}
      {activeTab === 'stock' && (
        <>
          <div className="card mb-3 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-5">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search product SKU, name, or aisle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <select
                    className="form-select form-select-sm"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Locations (Warehouses & Stores)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.location_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Facility / Location</th>
                    <th>Location Type</th>
                    <th>Aisle / Shelf</th>
                    <th>On-Hand</th>
                    <th>Reserved</th>
                    <th>Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">Loading inventory items...</td>
                    </tr>
                  ) : inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold text-dark">{item.product_name}</div>
                          <span className="badge bg-light text-secondary border small">{item.product_sku}</span>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.location_name}</div>
                          <span className="small text-muted">{item.location_code}</span>
                        </td>
                        <td>
                          <span className={`badge ${item.location_type === 'WAREHOUSE' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`}>
                            {item.location_type}
                          </span>
                        </td>
                        <td className="text-muted small">{item.aisle_shelf || '—'}</td>
                        <td className="fw-bold">{item.quantity_on_hand}</td>
                        <td className="text-warning">{item.quantity_reserved}</td>
                        <td className="fw-bold text-success">{item.quantity_available}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No inventory records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Transfers */}
      {activeTab === 'transfers' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Transfer #</th>
                  <th>Source Facility</th>
                  <th>Destination Facility</th>
                  <th>Status</th>
                  <th>Initiated By</th>
                  <th>Transfer Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length > 0 ? (
                  transfers.map((trf) => (
                    <tr key={trf.id}>
                      <td className="fw-bold text-primary">{trf.transfer_number}</td>
                      <td>{trf.from_location_name}</td>
                      <td>{trf.to_location_name}</td>
                      <td>
                        <StatusBadge status={trf.status} />
                      </td>
                      <td className="small text-muted">{trf.initiated_by_username || 'Admin'}</td>
                      <td className="small text-muted">
                        {new Date(trf.transfer_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-end">
                        {trf.status === 'PENDING' || trf.status === 'IN_TRANSIT' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleCompleteTransfer(trf.id)}
                              className="btn btn-success btn-sm py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Receive / Complete
                            </button>
                            <button
                              onClick={() => handleCancelTransfer(trf.id)}
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No stock transfers recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Adjustments */}
      {activeTab === 'adjustments' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Adjustment #</th>
                  <th>Location</th>
                  <th>Product</th>
                  <th>Previous Qty</th>
                  <th>Adjusted Qty</th>
                  <th>Difference</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.length > 0 ? (
                  adjustments.map((adj) => (
                    <tr key={adj.id}>
                      <td className="fw-bold">{adj.adjustment_number}</td>
                      <td>{adj.location_name}</td>
                      <td>
                        <div className="fw-semibold">{adj.product_name}</div>
                        <span className="small text-muted">{adj.product_sku}</span>
                      </td>
                      <td>{adj.previous_quantity}</td>
                      <td className="fw-bold">{adj.adjusted_quantity}</td>
                      <td>
                        <span className={`badge ${adj.difference > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{adj.reason}</span>
                      </td>
                      <td className="small text-muted">{adj.adjusted_by_username || 'System'}</td>
                      <td className="small text-muted">
                        {new Date(adj.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      No stock adjustments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Locations Directory */}
      {activeTab === 'locations' && (
        <div className="row g-3">
          {locations.map((loc) => (
            <div key={loc.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100 p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{loc.name}</h5>
                    <span className="badge bg-light text-secondary border small">{loc.code}</span>
                  </div>
                  <span className={`badge ${loc.location_type === 'WAREHOUSE' ? 'bg-primary' : 'bg-success'}`}>
                    {loc.location_type}
                  </span>
                </div>
                <div className="small text-muted mb-3 d-flex align-items-center gap-1">
                  <MapPin size={14} />
                  <span>{loc.address}, {loc.city}, {loc.state} - {loc.pincode}</span>
                </div>
                <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center small">
                  <div>
                    <User size={13} className="me-1 text-muted" />
                    <strong>{loc.manager_name}</strong>
                  </div>
                  <div>
                    <Phone size={13} className="me-1 text-muted" />
                    <span>{loc.contact_phone}</span>
                  </div>
                </div>
                <div className="bg-light rounded p-2 mt-2 d-flex justify-content-around text-center small">
                  <div>
                    <div className="text-muted">Unique SKUs</div>
                    <div className="fw-bold">{loc.total_skus || 0}</div>
                  </div>
                  <div className="border-start"></div>
                  <div>
                    <div className="text-muted">Total Stock Units</div>
                    <div className="fw-bold text-primary">{loc.total_items || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Initiate Inter-Facility Stock Transfer</h5>
                <button type="button" className="btn-close" onClick={() => setShowTransferModal(false)}></button>
              </div>
              <form onSubmit={handleTransferSubmit}>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger small py-2">{modalError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Source Facility (Dispatch From)</label>
                    <select
                      className="form-select form-select-sm"
                      value={transferForm.from_location}
                      onChange={(e) => setTransferForm({ ...transferForm, from_location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.location_type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Destination Facility (Deliver To)</label>
                    <select
                      className="form-select form-select-sm"
                      value={transferForm.to_location}
                      onChange={(e) => setTransferForm({ ...transferForm, to_location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.location_type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Product</label>
                    <select
                      className="form-select form-select-sm"
                      value={transferForm.items[0].product}
                      onChange={(e) => setTransferForm({
                        ...transferForm,
                        items: [{ ...transferForm.items[0], product: e.target.value }]
                      })}
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Transfer Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-sm"
                      value={transferForm.items[0].quantity}
                      onChange={(e) => setTransferForm({
                        ...transferForm,
                        items: [{ ...transferForm.items[0], quantity: parseInt(e.target.value) || 1 }]
                      })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notes / Transit Route</label>
                    <textarea
                      rows="2"
                      className="form-control form-control-sm"
                      placeholder="e.g. Dispatched via BlueDart / Store emergency replenishment"
                      value={transferForm.notes}
                      onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Dispatching...' : 'Dispatch Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Physical Stock Adjustment</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <form onSubmit={handleAdjustSubmit}>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger small py-2">{modalError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Facility / Location</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustForm.location}
                      onChange={(e) => setAdjustForm({ ...adjustForm, location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Product</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustForm.product}
                      onChange={(e) => setAdjustForm({ ...adjustForm, product: e.target.value })}
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Counted Physical Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      value={adjustForm.adjusted_quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, adjusted_quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Adjustment Reason</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustForm.reason}
                      onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    >
                      <option value="AUDIT_DISCREPANCY">Audit Discrepancy / Shrinkage</option>
                      <option value="DAMAGE">Damage / Breakage</option>
                      <option value="EXPIRY">Expiry / Obsolete</option>
                      <option value="RETURN">Customer Return</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Audit Notes</label>
                    <textarea
                      rows="2"
                      className="form-control form-control-sm"
                      placeholder="Audit justification or supervisor notes..."
                      value={adjustForm.notes}
                      onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdjustModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm" disabled={submitting}>
                    {submitting ? 'Applying...' : 'Apply Stock Correction'}
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
