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
  Truck,
  Building,
  Check,
  X,
  Layers,
  ArrowRight
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
    <div className="container-fluid px-3 px-xl-4 fade-in">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-semibold"
              style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            >
              <Warehouse size={12} className="me-1" />
              Multi-Facility Operations
            </span>
            <span className="text-muted small">Warehouses & Retail Outlets</span>
          </div>
          <h2 className="fw-bold mb-0 text-dark">Inventory & Stock Movement</h2>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={handleOpenAdjust}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
          >
            <SlidersHorizontal size={14} className="text-amber-500" />
            <span>Audit Correction</span>
          </button>
          <button
            onClick={handleOpenTransfer}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm px-3"
          >
            <ArrowRightLeft size={14} />
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      {/* Modern Tabs Pill Switcher */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div className="nav-pills-emerald">
          <button
            className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Levels ({inventoryItems.length})
          </button>
          <button
            className={`nav-link ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            Transfers ({transfers.length})
          </button>
          <button
            className={`nav-link ${activeTab === 'adjustments' ? 'active' : ''}`}
            onClick={() => setActiveTab('adjustments')}
          >
            Adjustments ({adjustments.length})
          </button>
          <button
            className={`nav-link ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            Facilities ({locations.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Stock Levels */}
      {activeTab === 'stock' && (
        <>
          <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-1"
                      placeholder="Search SKU, product name, or aisle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <select
                    className="form-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Facilities (Warehouses & Stores)</option>
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

          <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Facility</th>
                    <th>Facility Type</th>
                    <th>Aisle / Shelf</th>
                    <th>On-Hand</th>
                    <th>Reserved</th>
                    <th>Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                        <div>Loading inventory items...</div>
                      </td>
                    </tr>
                  ) : inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-bold text-dark">{item.product_name}</div>
                          <span
                            className="badge rounded-pill fw-medium"
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}
                          >
                            {item.product_sku}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.location_name}</div>
                          <span className="small text-muted">{item.location_code}</span>
                        </td>
                        <td>
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              backgroundColor: item.location_type === 'WAREHOUSE' ? '#ecfdf5' : '#eff6ff',
                              color: item.location_type === 'WAREHOUSE' ? '#065f46' : '#1e40af',
                              fontSize: '0.72rem',
                            }}
                          >
                            {item.location_type}
                          </span>
                        </td>
                        <td className="text-muted small">{item.aisle_shelf || '—'}</td>
                        <td className="fw-bold text-dark">{item.quantity_on_hand}</td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning-emphasis">
                            {item.quantity_reserved}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge fw-bold"
                            style={{
                              backgroundColor: item.quantity_available > 0 ? '#ecfdf5' : '#fff1f2',
                              color: item.quantity_available > 0 ? '#059669' : '#e11d48',
                              fontSize: '0.85rem',
                            }}
                          >
                            {item.quantity_available}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted small">
                        <Warehouse size={28} className="text-muted mb-2 d-block mx-auto" />
                        No inventory records found matching your filters.
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
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Transfer #</th>
                  <th>Source Facility</th>
                  <th>Destination</th>
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
                      <td className="fw-bold" style={{ color: '#059669' }}>
                        {trf.transfer_number}
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{trf.from_location_name}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 fw-semibold text-dark">
                          <ArrowRight size={13} className="text-emerald-600" />
                          <span>{trf.to_location_name}</span>
                        </div>
                      </td>
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
                              className="btn btn-sm btn-primary py-1 px-2.5"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Receive Goods
                            </button>
                            <button
                              onClick={() => handleCancelTransfer(trf.id)}
                              className="btn btn-sm btn-outline-danger py-1 px-2"
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
                    <td colSpan="7" className="text-center py-5 text-muted small">
                      <ArrowRightLeft size={28} className="text-muted mb-2 d-block mx-auto" />
                      No stock transfers recorded yet. Click "Transfer Stock" to dispatch items.
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
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Adjustment #</th>
                  <th>Facility</th>
                  <th>Product</th>
                  <th>Previous Qty</th>
                  <th>Counted Qty</th>
                  <th>Variance</th>
                  <th>Audit Reason</th>
                  <th>Audited By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.length > 0 ? (
                  adjustments.map((adj) => (
                    <tr key={adj.id}>
                      <td className="fw-bold text-dark">{adj.adjustment_number}</td>
                      <td>{adj.location_name}</td>
                      <td>
                        <div className="fw-bold text-dark">{adj.product_name}</div>
                        <span className="small text-muted">{adj.product_sku}</span>
                      </td>
                      <td>{adj.previous_quantity}</td>
                      <td className="fw-bold text-dark">{adj.adjusted_quantity}</td>
                      <td>
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: adj.difference > 0 ? '#ecfdf5' : '#fff1f2',
                            color: adj.difference > 0 ? '#059669' : '#e11d48',
                            fontSize: '0.75rem',
                          }}
                        >
                          {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">{adj.reason}</span>
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
                    <td colSpan="9" className="text-center py-5 text-muted small">
                      <SlidersHorizontal size={28} className="text-muted mb-2 d-block mx-auto" />
                      No inventory audit corrections recorded.
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
              <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '1rem' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">{loc.name}</h5>
                    <span
                      className="badge rounded-pill fw-medium"
                      style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}
                    >
                      {loc.code}
                    </span>
                  </div>
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{
                      backgroundColor: loc.location_type === 'WAREHOUSE' ? '#ecfdf5' : '#eff6ff',
                      color: loc.location_type === 'WAREHOUSE' ? '#065f46' : '#1e40af',
                      fontSize: '0.75rem',
                    }}
                  >
                    {loc.location_type}
                  </span>
                </div>

                <div className="small text-muted mb-3 d-flex align-items-start gap-1.5">
                  <MapPin size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {loc.address}, {loc.city}, {loc.state} - {loc.pincode}
                  </span>
                </div>

                <div className="border-top pt-3 mt-auto d-flex justify-content-between align-items-center small text-muted">
                  <div className="d-flex align-items-center gap-1">
                    <User size={13} className="text-muted" />
                    <span className="fw-semibold text-dark">{loc.manager_name}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Phone size={13} className="text-muted" />
                    <span>{loc.contact_phone}</span>
                  </div>
                </div>

                <div
                  className="rounded-3 p-2.5 mt-3 d-flex justify-content-around text-center small"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Unique SKUs</div>
                    <div className="fw-bold text-dark h6 mb-0">{loc.total_skus || 0}</div>
                  </div>
                  <div className="border-start"></div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total Stock Units</div>
                    <div className="fw-bold h6 mb-0" style={{ color: '#059669' }}>
                      {loc.total_items || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Initiate Inter-Facility Stock Transfer</h5>
                  <span className="text-muted small">Move inventory securely between storage facilities</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowTransferModal(false)}></button>
              </div>
              <form onSubmit={handleTransferSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-modern alert-modern-danger py-2 mb-3">
                      <AlertCircle size={16} />
                      <div>{modalError}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Source Facility (Dispatch From)</label>
                    <select
                      className="form-select"
                      value={transferForm.from_location}
                      onChange={(e) => setTransferForm({ ...transferForm, from_location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.location_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Destination Facility (Deliver To)</label>
                    <select
                      className="form-select"
                      value={transferForm.to_location}
                      onChange={(e) => setTransferForm({ ...transferForm, to_location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.location_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Product SKU</label>
                    <select
                      className="form-select"
                      value={transferForm.items[0].product}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          items: [{ ...transferForm.items[0], product: e.target.value }],
                        })
                      }
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Transfer Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={transferForm.items[0].quantity}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          items: [{ ...transferForm.items[0], quantity: parseInt(e.target.value) || 1 }],
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Dispatch Route / Vehicle Notes</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="e.g. Dispatched via Transit Van / Store stock emergency request"
                      value={transferForm.notes}
                      onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3" disabled={submitting}>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Record Physical Stock Correction</h5>
                  <span className="text-muted small">Update verified inventory counts from audit</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <form onSubmit={handleAdjustSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-modern alert-modern-danger py-2 mb-3">
                      <AlertCircle size={16} />
                      <div>{modalError}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Facility / Location</label>
                    <select
                      className="form-select"
                      value={adjustForm.location}
                      onChange={(e) => setAdjustForm({ ...adjustForm, location: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Product</label>
                    <select
                      className="form-select"
                      value={adjustForm.product}
                      onChange={(e) => setAdjustForm({ ...adjustForm, product: e.target.value })}
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Counted Physical Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={adjustForm.adjusted_quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, adjusted_quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Adjustment Reason</label>
                    <select
                      className="form-select"
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
                      className="form-control"
                      placeholder="Audit justification or supervisor notes..."
                      value={adjustForm.notes}
                      onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAdjustModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3" disabled={submitting}>
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
