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
  X
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
    <div className="container-fluid px-3 px-lg-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Product Catalog Management</h2>
          <p className="text-muted small mb-0">Create, edit, and organize retail inventory SKUs, categories, and pricing</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 align-self-start align-self-sm-auto px-3"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by SKU, Product Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lowStockToggle"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-danger" htmlFor="lowStockToggle">
                  Show Low Stock Only
                </label>
              </div>
            </div>

            <div className="col-12 col-md-2 text-md-end text-muted small">
              Showing <strong>{products.length}</strong> items
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Cost (₹)</th>
                <th>Selling (₹)</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">Loading product catalog...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="rounded object-fit-cover"
                            style={{ width: '40px', height: '40px' }}
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}>
                            <Package size={20} />
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold text-dark">{p.name}</div>
                          <span className="badge bg-light text-secondary border small">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category_name}</td>
                    <td className="small text-muted">{p.supplier_name || 'N/A'}</td>
                    <td className="small">{formatINR(p.cost_price)}</td>
                    <td className="fw-semibold text-dark">{formatINR(p.selling_price)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <span className={`fw-bold ${p.is_low_stock ? 'text-danger' : 'text-dark'}`}>
                          {p.total_stock} {p.unit_of_measure}
                        </span>
                        {p.is_low_stock && (
                          <span className="badge bg-danger-subtle text-danger" title={`Reorder point: ${p.reorder_point}`}>
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
                          className="btn btn-outline-secondary"
                          title="View Inventory per Location"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-outline-secondary"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editProduct ? `Edit Product: ${editProduct.name}` : 'Add New Product to Catalog'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger small py-2 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <div>{formError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">SKU Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Product Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Primary Supplier</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      >
                        <option value="">No Supplier Assigned</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Cost Price (INR ₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Selling Price (INR ₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Unit of Measure</label>
                      <select
                        className="form-select form-select-sm"
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
                        className="form-control form-control-sm"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Safety Stock Buffer</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.safety_stock}
                        onChange={(e) => setFormData({ ...formData, safety_stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Catalog Status</label>
                      <select
                        className="form-select form-select-sm"
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
                        className="form-control form-control-sm"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        rows="2"
                        className="form-control form-control-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">{detailProduct.name}</h5>
                  <span className="badge bg-light text-secondary border small">{detailProduct.sku}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setDetailProduct(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Category</div>
                    <div className="fw-semibold">{detailProduct.category_name}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Supplier</div>
                    <div className="fw-semibold">{detailProduct.supplier_name || 'N/A'}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Reorder Point</div>
                    <div className="fw-semibold">{detailProduct.reorder_point} {detailProduct.unit_of_measure}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="small text-muted">Total On-Hand</div>
                    <div className="h5 fw-bold text-primary mb-0">{detailProduct.total_stock}</div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                  <Warehouse size={16} />
                  <span>Stock Distribution Across Warehouses & Retail Stores</span>
                </h6>

                <div className="table-responsive border rounded">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Location</th>
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
                            <td className="fw-semibold">{item.location_name}</td>
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
                          <td colSpan="6" className="text-center py-3 text-muted">
                            No inventory records allocated for this product across locations.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
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
