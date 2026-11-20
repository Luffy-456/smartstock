import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  BarChart3,
  Download,
  AlertTriangle,
  TrendingUp,
  Package,
  IndianRupee,
  Building,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const Analytics = () => {
  const [kpis, setKpis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [locationBreakdown, setLocationBreakdown] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [kpiRes, recRes, catRes, locRes, topRes] = await Promise.all([
        api.get('/analytics/kpis/'),
        api.get('/analytics/reorder-recommendations/'),
        api.get('/analytics/category-breakdown/'),
        api.get('/analytics/location-breakdown/'),
        api.get('/analytics/top-products/'),
      ]);

      setKpis(kpiRes.data);
      setRecommendations(recRes.data || []);
      setCategoryBreakdown(catRes.data || []);
      setLocationBreakdown(locRes.data || []);
      setTopProducts(topRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const exportRecommendationsCSV = () => {
    if (recommendations.length === 0) return;
    const headers = ['SKU', 'Product Name', 'Category', 'Supplier', 'Current Stock', 'Reorder Point', 'Safety Stock', 'Recommended Order Qty', 'Estimated Cost (INR)', 'Urgency'];
    const rows = recommendations.map((r) => [
      r.sku,
      `"${r.product_name}"`,
      r.category,
      `"${r.supplier_name}"`,
      r.current_stock,
      r.reorder_point,
      r.safety_stock,
      r.recommended_order_quantity,
      r.estimated_cost_inr,
      r.urgency,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSmart_Reorder_Recommendations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid px-3 px-lg-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Reporting, KPIs & Inventory Analytics</h2>
          <p className="text-muted small mb-0">Actionable insights on inventory turnover, stockouts, demand patterns, and replenishment recommendations</p>
        </div>
        <button
          onClick={exportRecommendationsCSV}
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 align-self-start align-self-sm-auto px-3"
          disabled={recommendations.length === 0}
        >
          <Download size={15} />
          <span>Export Reorder CSV Report</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Stock Valuation"
            value={formatINR(kpis?.total_inventory_valuation)}
            subtitle="Capital locked in inventory"
            icon={IndianRupee}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Inventory Turnover Ratio"
            value={`${kpis?.turnover_ratio || 0.0}x`}
            subtitle="Velocity of inventory movement"
            icon={TrendingUp}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Reorder Alerts"
            value={recommendations.length}
            subtitle={`${kpis?.out_of_stock_count || 0} Out-of-Stock SKUs`}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Sales Orders"
            value={kpis?.total_orders || 0}
            subtitle={`Gross Revenue: ${formatINR(kpis?.total_revenue)}`}
            icon={Package}
            color="purple"
          />
        </div>
      </div>

      {/* Reorder Recommendations Table */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 fw-bold text-danger">
            <AlertTriangle size={18} />
            <span>Optimal Reorder & Replenishment Plan</span>
          </div>
          <span className="badge bg-danger-subtle text-danger">
            {recommendations.length} Products Require Attention
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="text-center">Current Stock</th>
                <th className="text-center">Reorder Point</th>
                <th className="text-center">Recommended PO Qty</th>
                <th>Estimated Cost</th>
                <th>Urgency Level</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">Calculating inventory analytics...</td>
                </tr>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <tr key={rec.product_id}>
                    <td>
                      <div className="fw-semibold text-dark">{rec.product_name}</div>
                      <span className="badge bg-light text-secondary border small">{rec.sku}</span>
                    </td>
                    <td>{rec.category}</td>
                    <td className="small text-muted">{rec.supplier_name}</td>
                    <td className="text-center">
                      <span className={rec.current_stock === 0 ? 'text-danger fw-bold' : 'text-warning fw-bold'}>
                        {rec.current_stock}
                      </span>
                    </td>
                    <td className="text-center">{rec.reorder_point}</td>
                    <td className="text-center">
                      <span className="badge bg-primary-subtle text-primary fw-bold fs-6">
                        {rec.recommended_order_quantity} units
                      </span>
                    </td>
                    <td className="fw-semibold">{formatINR(rec.estimated_cost_inr)}</td>
                    <td>
                      <span
                        className={`badge ${
                          rec.urgency === 'CRITICAL'
                            ? 'bg-danger text-white'
                            : rec.urgency === 'HIGH'
                            ? 'bg-warning text-dark'
                            : 'bg-info text-dark'
                        }`}
                      >
                        {rec.urgency}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No critical stockout or reorder alerts. All items are adequately buffered!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products & Location Valuation */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header fw-bold text-dark">Top Revenue-Generating SKUs</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="text-center">Units Sold</th>
                    <th className="text-end">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length > 0 ? (
                    topProducts.map((p) => (
                      <tr key={p.product__id}>
                        <td>
                          <div className="fw-semibold text-dark">{p.product__name}</div>
                          <span className="small text-muted">{p.product__sku}</span>
                        </td>
                        <td>{p.product__category__name}</td>
                        <td className="text-center fw-bold text-primary">{p.total_units_sold}</td>
                        <td className="text-end fw-bold">{formatINR(p.total_revenue_generated)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No sales recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header fw-bold text-dark">Facility Inventory Breakdown</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Type</th>
                    <th className="text-center">Total Stock</th>
                    <th className="text-end">Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {locationBreakdown.length > 0 ? (
                    locationBreakdown.map((loc) => (
                      <tr key={loc.location_id}>
                        <td>
                          <div className="fw-semibold text-dark">{loc.location_name}</div>
                          <span className="small text-muted">{loc.city} ({loc.location_code})</span>
                        </td>
                        <td>
                          <span className={`badge ${loc.location_type === 'WAREHOUSE' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`}>
                            {loc.location_type}
                          </span>
                        </td>
                        <td className="text-center fw-bold">{loc.total_items}</td>
                        <td className="text-end fw-semibold text-dark">{formatINR(loc.total_valuation)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No facilities found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
