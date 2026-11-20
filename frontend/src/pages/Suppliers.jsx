import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusBadge } from '../components/Badge';
import {
  Truck,
  Plus,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';

export const Suppliers = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'suppliers'
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');

  // Modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [viewPO, setViewPO] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // PO Form
  const [newPO, setNewPO] = useState({
    supplier: '',
    destination_location: '',
    expected_delivery_date: '',
    notes: '',
    items: [],
  });

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    lead_time_days: 7,
    rating: 4.5,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, poRes, locRes, prodRes] = await Promise.all([
        api.get(`/suppliers/?search=${encodeURIComponent(search)}`),
        api.get('/purchase-orders/'),
        api.get('/locations/'),
        api.get('/products/?status=ACTIVE'),
      ]);

      setSuppliers(supRes.data.results || supRes.data || []);
      setPurchaseOrders(poRes.data.results || poRes.data || []);
      setLocations(locRes.data.results || locRes.data || []);
      setProducts(prodRes.data.results || prodRes.data || []);
    } catch (err) {
      console.error('Failed to load supplier data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenCreatePO = () => {
    setNewPO({
      supplier: suppliers[0]?.id || '',
      destination_location: locations[0]?.id || '',
      expected_delivery_date: '',
      notes: '',
      items: [
        {
          product: products[0]?.id || '',
          quantity_ordered: 100,
          unit_cost: products[0]?.cost_price || 0,
        },
      ],
    });
    setModalError('');
    setShowPOModal(true);
  };

  const handleAddPOItem = () => {
    if (products.length === 0) return;
    setNewPO({
      ...newPO,
      items: [
        ...newPO.items,
        {
          product: products[0].id,
          quantity_ordered: 50,
          unit_cost: products[0].cost_price,
        },
      ],
    });
  };

  const handleRemovePOItem = (index) => {
    const updated = newPO.items.filter((_, i) => i !== index);
    setNewPO({ ...newPO, items: updated });
  };

  const handlePOItemChange = (index, field, value) => {
    const updated = [...newPO.items];
    if (field === 'product') {
      const selected = products.find((p) => p.id === parseInt(value));
      updated[index].product = value;
      if (selected) {
        updated[index].unit_cost = selected.cost_price;
      }
    } else if (field === 'quantity_ordered') {
      updated[index].quantity_ordered = parseInt(value) || 1;
    } else if (field === 'unit_cost') {
      updated[index].unit_cost = parseFloat(value) || 0;
    }
    setNewPO({ ...newPO, items: updated });
  };

  const calculatePOTotal = () => {
    return newPO.items.reduce((sum, it) => sum + it.quantity_ordered * it.unit_cost, 0);
  };

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (newPO.items.length === 0) {
      setModalError('Please add at least one line item.');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      const poNumber = `PO-${Date.now().toString().slice(-6)}`;
      await api.post('/purchase-orders/', {
        po_number: poNumber,
        status: 'ORDERED',
        ...newPO,
      });
      setShowPOModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceivePO = async (poId) => {
    if (!window.confirm('Mark this Purchase Order as Received? Physical inventory will be automatically credited to the destination warehouse.')) return;
    try {
      await api.post(`/purchase-orders/${poId}/receive_po/`);
      fetchData();
      if (viewPO && viewPO.id === poId) {
        const res = await api.get(`/purchase-orders/${poId}/`);
        setViewPO(res.data);
      }
    } catch (err) {
      alert('Failed to receive PO: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelPO = async (poId) => {
    try {
      await api.post(`/purchase-orders/${poId}/cancel_po/`);
      fetchData();
    } catch (err) {
      alert('Failed to cancel PO: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await api.post('/suppliers/', supplierForm);
      setShowSupplierModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="container-fluid px-3 px-lg-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Supplier Management & Purchase Orders</h2>
          <p className="text-muted small mb-0">Manage manufacturer relationships, delivery lead times, and replenish warehouse inventory via Purchase Orders</p>
        </div>
        <div className="d-flex gap-2 align-self-start align-self-sm-auto">
          <button
            onClick={() => {
              setModalError('');
              setShowSupplierModal(true);
            }}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <Plus size={14} />
            <span>Add Supplier</span>
          </button>
          <button
            onClick={handleOpenCreatePO}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            <Plus size={14} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2 gap-1">
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            Suppliers Directory ({suppliers.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: Purchase Orders */}
      {activeTab === 'pos' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Destination Warehouse</th>
                  <th>Total Cost (INR)</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">Loading purchase orders...</td>
                  </tr>
                ) : purchaseOrders.length > 0 ? (
                  purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td className="fw-bold text-primary">{po.po_number}</td>
                      <td>
                        <div className="fw-semibold text-dark">{po.supplier_name}</div>
                      </td>
                      <td>
                        <div>{po.destination_name}</div>
                        <span className="badge bg-light text-secondary border small">{po.destination_code}</span>
                      </td>
                      <td className="fw-bold">{formatINR(po.total_amount)}</td>
                      <td>
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="small text-muted">
                        {new Date(po.order_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="small text-muted">
                        {po.expected_delivery_date || 'Standard Lead'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => setViewPO(po)}
                            className="btn btn-outline-secondary"
                            title="View PO Details"
                          >
                            <Eye size={14} />
                          </button>
                          {(po.status === 'ORDERED' || po.status === 'DRAFT') && (
                            <button
                              onClick={() => handleReceivePO(po.id)}
                              className="btn btn-success btn-sm py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              title="Receive stock into warehouse"
                            >
                              Receive Stock
                            </button>
                          )}
                          {po.status === 'ORDERED' && (
                            <button
                              onClick={() => handleCancelPO(po.id)}
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="row g-3">
          {suppliers.map((sup) => (
            <div key={sup.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100 p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{sup.name}</h5>
                    <div className="small text-muted">{sup.contact_person}</div>
                  </div>
                  <div className="d-flex align-items-center gap-1 badge bg-warning-subtle text-warning-emphasis">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span className="fw-bold">{sup.rating}</span>
                  </div>
                </div>

                <div className="small text-muted mb-2 d-flex align-items-center gap-1">
                  <MapPin size={14} />
                  <span>{sup.address}, {sup.city}, {sup.state}</span>
                </div>

                <div className="small mb-3">
                  <div className="d-flex align-items-center gap-1 text-muted">
                    <Phone size={13} />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-muted">
                    <Mail size={13} />
                    <span>{sup.email}</span>
                  </div>
                </div>

                <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center small">
                  <div>
                    <span className="text-muted">Avg Lead Time: </span>
                    <strong>{sup.lead_time_days} days</strong>
                  </div>
                  <div>
                    <span className="badge bg-light text-secondary border">
                      {sup.gstin || 'GST Unregistered'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showPOModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Supplier Purchase Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowPOModal(false)}></button>
              </div>
              <form onSubmit={handlePOSubmit}>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger small py-2 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <div>{modalError}</div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Supplier</label>
                      <select
                        className="form-select form-select-sm"
                        value={newPO.supplier}
                        onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                        required
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Destination Facility</label>
                      <select
                        className="form-select form-select-sm"
                        value={newPO.destination_location}
                        onChange={(e) => setNewPO({ ...newPO, destination_location: e.target.value })}
                        required
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name} ({loc.location_type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Expected Delivery Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={newPO.expected_delivery_date}
                        onChange={(e) => setNewPO({ ...newPO, expected_delivery_date: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Procurement Notes</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Bulk quarterly replenishment"
                        value={newPO.notes}
                        onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* PO Line Items */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">Procurement Items</h6>
                    <button
                      type="button"
                      onClick={handleAddPOItem}
                      className="btn btn-outline-primary btn-sm py-0 px-2"
                      style={{ fontSize: '0.8rem' }}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="border rounded p-2 mb-3 bg-light">
                    {newPO.items.map((item, index) => (
                      <div key={index} className="row g-2 align-items-center mb-2">
                        <div className="col-6">
                          <select
                            className="form-select form-select-sm"
                            value={item.product}
                            onChange={(e) => handlePOItemChange(index, 'product', e.target.value)}
                            required
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} [{p.sku}] - Cost: ₹{p.cost_price}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-2">
                          <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm"
                            placeholder="Units"
                            value={item.quantity_ordered}
                            onChange={(e) => handlePOItemChange(index, 'quantity_ordered', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-3 text-end fw-semibold text-dark small">
                          {formatINR(item.quantity_ordered * item.unit_cost)}
                        </div>
                        <div className="col-1 text-end">
                          {newPO.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePOItem(index)}
                              className="btn btn-outline-danger btn-sm p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center fw-bold">
                      <span>Total Procurement Cost:</span>
                      <span className="text-primary h5 mb-0">{formatINR(calculatePOTotal())}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPOModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Placing Order...' : 'Submit Purchase Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register New Supplier</h5>
                <button type="button" className="btn-close" onClick={() => setShowSupplierModal(false)}></button>
              </div>
              <form onSubmit={handleSupplierSubmit}>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger small py-2">{modalError}</div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Supplier Company Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Contact Person</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={supplierForm.contact_person}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Street Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={supplierForm.city}
                        onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={supplierForm.state}
                        onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">GSTIN</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={supplierForm.gstin}
                        onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Lead Time (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        value={supplierForm.lead_time_days}
                        onChange={(e) => setSupplierForm({ ...supplierForm, lead_time_days: parseInt(e.target.value) || 7 })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSupplierModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Registering...' : 'Register Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PO View Modal */}
      {viewPO && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Purchase Order: {viewPO.po_number}</h5>
                  <span className="text-muted small">Placed on {new Date(viewPO.order_date).toLocaleString('en-IN')}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setViewPO(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Supplier</div>
                    <div className="fw-semibold">{viewPO.supplier_name}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Destination</div>
                    <div className="fw-semibold">{viewPO.destination_name}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Status</div>
                    <div><StatusBadge status={viewPO.status} /></div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Actual Received Date</div>
                    <div className="small">{viewPO.actual_delivery_date ? new Date(viewPO.actual_delivery_date).toLocaleString('en-IN') : 'Pending'}</div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Procured Line Items</h6>
                <div className="table-responsive border rounded mb-3">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product SKU</th>
                        <th>Product Name</th>
                        <th className="text-center">Ordered</th>
                        <th className="text-center">Received</th>
                        <th className="text-end">Unit Cost</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPO.items && viewPO.items.length > 0 ? (
                        viewPO.items.map((it) => (
                          <tr key={it.id}>
                            <td className="fw-bold text-primary">{it.product_sku}</td>
                            <td>{it.product_name}</td>
                            <td className="text-center">{it.quantity_ordered}</td>
                            <td className="text-center fw-bold">{it.quantity_received}</td>
                            <td className="text-end">{formatINR(it.unit_cost)}</td>
                            <td className="text-end fw-semibold">{formatINR(it.subtotal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-2 text-muted">No items</td>
                        </tr>
                      )}
                      <tr className="table-light fw-bold">
                        <td colSpan="5" className="text-end">Total PO Amount:</td>
                        <td className="text-end text-primary h6 mb-0">{formatINR(viewPO.total_amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <div>
                  {(viewPO.status === 'ORDERED' || viewPO.status === 'DRAFT') && (
                    <button
                      onClick={() => handleReceivePO(viewPO.id)}
                      className="btn btn-success btn-sm"
                    >
                      Receive Stock into Warehouse
                    </button>
                  )}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewPO(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
