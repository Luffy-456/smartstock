import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusBadge } from '../components/Badge';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Order creation form
  const [newOrder, setNewOrder] = useState({
    customer: '',
    location: '',
    payment_method: 'UPI',
    payment_status: 'PAID',
    notes: '',
    items: [],
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/orders/?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const [ordRes, custRes, locRes, prodRes] = await Promise.all([
        api.get(url),
        api.get('/customers/'),
        api.get('/locations/'),
        api.get('/products/?status=ACTIVE'),
      ]);

      setOrders(ordRes.data.results || ordRes.data || []);
      setCustomers(custRes.data.results || custRes.data || []);
      setLocations(locRes.data.results || locRes.data || []);
      setProducts(prodRes.data.results || prodRes.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setNewOrder({
      customer: customers[0]?.id || '',
      location: locations[0]?.id || '',
      payment_method: 'UPI',
      payment_status: 'PAID',
      notes: '',
      items: [
        {
          product: products[0]?.id || '',
          quantity: 1,
          unit_price: products[0]?.selling_price || 0,
        },
      ],
    });
    setErrorMsg('');
    setShowCreateModal(true);
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setNewOrder({
      ...newOrder,
      items: [
        ...newOrder.items,
        {
          product: products[0].id,
          quantity: 1,
          unit_price: products[0].selling_price,
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const updated = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newOrder.items];
    if (field === 'product') {
      const selected = products.find((p) => p.id === parseInt(value));
      updated[index].product = value;
      if (selected) {
        updated[index].unit_price = selected.selling_price;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = parseInt(value) || 1;
    } else if (field === 'unit_price') {
      updated[index].unit_price = parseFloat(value) || 0;
    }
    setNewOrder({ ...newOrder, items: updated });
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) {
      setErrorMsg('Please add at least one line item to the order.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      await api.post('/orders/', {
        order_number: orderNumber,
        ...newOrder,
      });
      setShowCreateModal(false);
      fetchOrders();
    } catch (err) {
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create sales order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`/orders/${orderId}/update_status/`, { status: newStatus });
      fetchOrders();
      if (viewOrder && viewOrder.id === orderId) {
        const res = await api.get(`/orders/${orderId}/`);
        setViewOrder(res.data);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
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
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Customer Sales Orders & Fulfillment</h2>
          <p className="text-muted small mb-0">Manage omnichannel sales orders from placement through picking, packing, and shipment with auto-stock deduction</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 align-self-start align-self-sm-auto px-3"
        >
          <Plus size={16} />
          <span>New Sales Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card mb-4 border-0 shadow-sm">
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
                  placeholder="Search by Order #, Customer Name, or Phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Fulfillment Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="PROCESSING">Processing / Picking</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped / Dispatched</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="col-12 col-md-3 text-md-end text-muted small">
              Showing <strong>{orders.length}</strong> orders
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Fulfillment Facility</th>
                <th>Payment</th>
                <th>Total (INR)</th>
                <th>Status</th>
                <th>Order Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">Loading orders...</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="fw-bold text-primary">{ord.order_number}</td>
                    <td>
                      <div className="fw-semibold text-dark">{ord.customer_name || 'Walk-in'}</div>
                      <span className="small text-muted">{ord.customer_phone || ''}</span>
                    </td>
                    <td>
                      <div>{ord.location_name}</div>
                      <span className="badge bg-light text-secondary border small">{ord.location_code}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">{ord.payment_method}</span>
                      <span className={`badge ${ord.payment_status === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{formatINR(ord.total_amount)}</td>
                    <td>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="small text-muted">
                      {new Date(ord.order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => setViewOrder(ord)}
                          className="btn btn-outline-secondary"
                          title="View Order Details"
                        >
                          <Eye size={14} />
                        </button>
                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                            className="btn btn-outline-primary"
                            title="Start Processing & Deduct Stock"
                          >
                            Process
                          </button>
                        )}
                        {ord.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PACKED')}
                            className="btn btn-outline-info"
                            title="Mark Packed"
                          >
                            Pack
                          </button>
                        )}
                        {ord.status === 'PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'SHIPPED')}
                            className="btn btn-outline-primary"
                            title="Ship Order"
                          >
                            Ship
                          </button>
                        )}
                        {ord.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                            className="btn btn-outline-success"
                            title="Mark Delivered"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Customer Sales Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  {errorMsg && (
                    <div className="alert alert-danger small py-2 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Customer</label>
                      <select
                        className="form-select form-select-sm"
                        value={newOrder.customer}
                        onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                        required
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Fulfillment Facility / Location</label>
                      <select
                        className="form-select form-select-sm"
                        value={newOrder.location}
                        onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
                        required
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name} ({loc.location_type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Payment Method</label>
                      <select
                        className="form-select form-select-sm"
                        value={newOrder.payment_method}
                        onChange={(e) => setNewOrder({ ...newOrder, payment_method: e.target.value })}
                      >
                        <option value="UPI">UPI / QR Code</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="DEBIT_CARD">Debit Card</option>
                        <option value="CASH">Cash on Delivery</option>
                        <option value="NET_BANKING">Net Banking</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Payment Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={newOrder.payment_status}
                        onChange={(e) => setNewOrder({ ...newOrder, payment_status: e.target.value })}
                      >
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Notes</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Express delivery / Gift wrap"
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">Order Items</h6>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn btn-outline-primary btn-sm py-0 px-2"
                      style={{ fontSize: '0.8rem' }}
                    >
                      + Add Product Item
                    </button>
                  </div>

                  <div className="border rounded p-2 mb-3 bg-light">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="row g-2 align-items-center mb-2">
                        <div className="col-6">
                          <select
                            className="form-select form-select-sm"
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            required
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} [{p.sku}] - ₹{p.selling_price}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-2">
                          <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-3 text-end fw-semibold text-dark small">
                          {formatINR(item.quantity * item.unit_price)}
                        </div>
                        <div className="col-1 text-end">
                          {newOrder.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="btn btn-outline-danger btn-sm p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center fw-bold">
                      <span>Total Calculated Amount:</span>
                      <span className="text-primary h5 mb-0">{formatINR(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Creating Order...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Order: {viewOrder.order_number}</h5>
                  <span className="text-muted small">Placed on {new Date(viewOrder.order_date).toLocaleString('en-IN')}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setViewOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Customer</div>
                    <div className="fw-semibold">{viewOrder.customer_name || 'Walk-in'}</div>
                    <div className="small text-muted">{viewOrder.customer_phone}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Fulfillment Hub</div>
                    <div className="fw-semibold">{viewOrder.location_name}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Payment</div>
                    <div className="fw-semibold">{viewOrder.payment_method} ({viewOrder.payment_status})</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Fulfillment Status</div>
                    <div><StatusBadge status={viewOrder.status} /></div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Order Line Items</h6>
                <div className="table-responsive border rounded mb-3">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product SKU</th>
                        <th>Product Name</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOrder.items && viewOrder.items.length > 0 ? (
                        viewOrder.items.map((it) => (
                          <tr key={it.id}>
                            <td className="fw-bold text-primary">{it.product_sku}</td>
                            <td>{it.product_name}</td>
                            <td className="text-center">{it.quantity}</td>
                            <td className="text-end">{formatINR(it.unit_price)}</td>
                            <td className="text-end fw-semibold">{formatINR(it.subtotal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-2 text-muted">No items found</td>
                        </tr>
                      )}
                      <tr className="table-light fw-bold">
                        <td colSpan="4" className="text-end">Grand Total:</td>
                        <td className="text-end text-primary h6 mb-0">{formatINR(viewOrder.total_amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {viewOrder.notes && (
                  <div className="small text-muted mb-2">
                    <strong>Order Notes:</strong> {viewOrder.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <div>
                  {viewOrder.status !== 'CANCELLED' && viewOrder.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(viewOrder.id, 'CANCELLED')}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Cancel Order & Restock
                    </button>
                  )}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewOrder(null)}>
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
