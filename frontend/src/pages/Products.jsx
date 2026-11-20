import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge } from '../components/Badge';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  AlertCircle,
  Warehouse,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('filter') === 'low_stock');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    supplier: '',
    description: '',
    unit_of_measure: 'piece',
    cost_price: '',
    selling_price: '',
    reorder_point: 10,
    safety_stock: 5,
    image_url: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      let url = `/products/?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (lowStockOnly) url += `low_stock=true&`;

      const [prodRes, catRes, supRes] = await Promise.all([
        api.get(url),
        api.get('/categories/'),
        api.get('/suppliers/'),
      ]);

      setProducts(prodRes.data.results || prodRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
      setSuppliers(supRes.data.results || supRes.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, selectedCategory, lowStockOnly]);

  const handleOpenAdd = () => {
    setEditProduct(null);
    setFormData({
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      name: '',
      category: categories[0]?.id || '',
      supplier: suppliers[0]?.id || '',
      description: '',
      unit_of_measure: 'piece',
      cost_price: '',
      selling_price: '',
      reorder_point: 15,
      safety_stock: 5,
      image_url: '',
      status: 'ACTIVE',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      supplier: p.supplier || '',
      description: p.description || '',
      unit_of_measure: p.unit_of_measure,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      reorder_point: p.reorder_point,
      safety_stock: p.safety_stock,
      image_url: p.image_url || '',
      status: p.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenDetail = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/`);
      setDetailProduct(res.data);
    } catch (err) {
      console.error('Failed to load product detail', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}/`, formData);
      } else {
        await api.post('/products/', formData);
      }
      setShowModal(false);
      fetchCatalog();
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save product';
      setFormError(msg);
    } finally {
      setSaving(false);
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
    <div className="container-fluid px-3 px-xl-4 fade-in">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-semibold"
              style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            >
              <Package size={12} className="me-1" />
              SKU Catalog
            </span>
            <span className="text-muted small">Real-time Stock & Margins</span>
          </div>
          <h2 className="fw-bold mb-0 text-dark">Product Catalog Management</h2>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm px-3">
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-1"
                  placeholder="Search by SKU, product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-link text-muted p-1 border-start-0 text-decoration-none"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-12 col-sm-6 col-md-4">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Switch & Counter */}
            <div className="col-12 col-sm-6 col-md-3 d-flex align-items-center justify-content-between justify-content-md-end gap-2">
              <div
                className="form-check form-switch mb-0 d-flex align-items-center gap-2 px-2 py-1 rounded"
                style={{ backgroundColor: lowStockOnly ? '#fff1f2' : '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  id="lowStockToggle"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
                <label
                  className="form-check-label small fw-semibold"
                  htmlFor="lowStockToggle"
                  style={{ color: lowStockOnly ? '#e11d48' : '#475569', fontSize: '0.8rem' }}
                >
                  Low Stock Only
                </label>
              </div>

              <span className="badge bg-light text-secondary border small px-2 py-1.5">
                {products.length} Items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                    <div>Loading catalog SKUs...</div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const marginPct =
                    p.selling_price && p.cost_price
                      ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(0)
                      : null;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="rounded-3 object-fit-cover shadow-xs border"
                              style={{ width: '42px', height: '42px' }}
                            />
                          ) : (
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center shadow-xs"
                              style={{
                                width: '42px',
                                height: '42px',
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #d1fae5',
                              }}
                            >
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{p.name}</div>
                            <span
                              className="badge rounded-pill fw-medium"
                              style={{
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.7rem',
                              }}
                            >
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border fw-medium" style={{ fontSize: '0.75rem' }}>
                          {p.category_name}
                        </span>
                      </td>
                      <td className="small text-muted">{p.supplier_name || '—'}</td>
                      <td className="small text-muted">{formatINR(p.cost_price)}</td>
                      <td>
                        <div className="fw-bold text-dark">{formatINR(p.selling_price)}</div>
                        {marginPct && (
                          <span className="text-success small fw-medium" style={{ fontSize: '0.7rem' }}>
                            {marginPct}% margin
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <span
                            className="badge fw-bold"
                            style={{
                              backgroundColor: p.is_low_stock ? '#fff1f2' : '#ecfdf5',
                              color: p.is_low_stock ? '#e11d48' : '#065f46',
                              fontSize: '0.8rem',
                            }}
                          >
                            {p.total_stock} {p.unit_of_measure}
                          </span>
                          {p.is_low_stock && (
                            <span
                              className="badge rounded-pill"
                              style={{ backgroundColor: '#ffe4e6', color: '#be123c', fontSize: '0.65rem' }}
                              title={`Min safety threshold: ${p.reorder_point}`}
                            >
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleOpenDetail(p.id)}
                            className="btn btn-outline-secondary py-1 px-2"
                            title="View Multi-Location Inventory Breakdown"
                          >
                            <Eye size={14} className="text-emerald-700" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-outline-secondary py-1 px-2"
                            title="Edit SKU Details"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted small">
                    <Package size={28} className="text-muted mb-2 d-block mx-auto" />
                    No products found matching the given filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">
                    {editProduct ? `Edit Product: ${editProduct.name}` : 'Add New Product to Catalog'}
                  </h5>
                  <span className="text-muted small">Configure SKU specifications and thresholds</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-modern alert-modern-danger py-2 mb-3">
                      <AlertCircle size={16} />
                      <div>{formError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">SKU Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Primary Supplier</label>
                      <select
                        className="form-select"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      >
                        <option value="">No Supplier Assigned</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Cost Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Selling Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Unit of Measure</label>
                      <select
                        className="form-select"
                        value={formData.unit_of_measure}
                        onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      >
                        <option value="piece">Piece</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="box">Box</option>
                        <option value="meter">Meter</option>
                        <option value="litre">Litre</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Reorder Threshold Point</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Safety Stock Buffer</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.safety_stock}
                        onChange={(e) => setFormData({ ...formData, safety_stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Catalog Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISCONTINUED">DISCONTINUED</option>
                        <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Image URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Location Detail Modal */}
      {detailProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0 text-dark">{detailProduct.name}</h5>
                  <span className="badge bg-light text-secondary border small">{detailProduct.sku}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setDetailProduct(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Category</div>
                    <div className="fw-bold text-dark">{detailProduct.category_name}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Primary Supplier</div>
                    <div className="fw-bold text-dark">{detailProduct.supplier_name || 'N/A'}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Safety Reorder Point</div>
                    <div className="fw-bold text-dark">
                      {detailProduct.reorder_point} {detailProduct.unit_of_measure}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Total Available Stock</div>
                    <div className="h4 fw-bold text-emerald-600 mb-0" style={{ color: '#059669' }}>
                      {detailProduct.total_stock}
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                  <Warehouse size={16} className="text-emerald-600" />
                  <span>Warehouse & Retail Store Stock Breakdown</span>
                </h6>

                <div className="table-responsive border rounded-3 overflow-hidden">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Location Name</th>
                        <th>Type</th>
                        <th>Aisle / Shelf</th>
                        <th>On Hand</th>
                        <th>Reserved</th>
                        <th>Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailProduct.inventory_items && detailProduct.inventory_items.length > 0 ? (
                        detailProduct.inventory_items.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-bold text-dark">{item.location_name}</td>
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
                            <td className="text-warning fw-semibold">{item.quantity_reserved}</td>
                            <td className="fw-bold text-success">{item.quantity_available}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted small">
                            No warehouse allocation recorded yet for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetailProduct(null)}>
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
