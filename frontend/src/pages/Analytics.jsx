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
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/Badge';

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
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Supplier',
      'Current Stock',
      'Reorder Point',
      'Safety Stock',
      'Recommended Order Qty',
      'Estimated Cost (INR)',
      'Urgency',
    ];
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

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `StockSmart_Reorder_Recommendations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <BarChart3 size={12} className="me-1" />
              Intelligence & Forecasting
            </span>
            <span className="text-muted small">Demand-Driven Reorder Signals</span>
          </div>
          <h2 className="fw-bold mb-0 text-dark">Reporting & Stock Optimization</h2>
        </div>

        <button
          onClick={exportRecommendationsCSV}
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 shadow-xs px-3"
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
            subtitle="Current asset balance"
            icon={IndianRupee}
            color="emerald"
            trend={{ isPositive: true, text: 'Optimal' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Inventory Turnover Ratio"
            value={`${kpis?.turnover_ratio || 0.0}x`}
            subtitle="Annualized stock velocity"
            icon={TrendingUp}
            color="teal"
            trend={{ isPositive: true, text: 'High Demand' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Reorder Signals"
            value={recommendations.length}
            subtitle={`${kpis?.out_of_stock_count || 0} Critical Out-of-Stock`}
            icon={AlertTriangle}
            color="danger"
            trend={{ isPositive: false, text: 'Requires PO' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Sales Orders"
            value={kpis?.total_orders || 0}
            subtitle={`Gross Revenue: ${formatINR(kpis?.total_revenue)}`}
            icon={Package}
            color="purple"
            trend={{ isPositive: true, text: '+12% Growth' }}
          />
        </div>
      </div>

      {/* Reorder Recommendations Table */}
      <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '28px', height: '28px', backgroundColor: '#fff1f2', color: '#e11d48' }}
            >
              <AlertTriangle size={15} />
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">Automated Reorder Recommendations</h6>
              <span className="text-muted small">Safety stock & economic reorder quantities</span>
            </div>
          </div>
          <span
            className="badge rounded-pill fw-semibold"
            style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
          >
            {recommendations.length} Items Require Restock
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="text-center">Current Stock</th>
                <th className="text-center">Threshold</th>
                <th className="text-center">Recommended PO Qty</th>
                <th>Estimated Cost</th>
                <th>Urgency Level</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                    <div>Analyzing inventory velocities...</div>
                  </td>
                </tr>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <tr key={rec.product_id}>
                    <td>
                      <div className="fw-bold text-dark">{rec.product_name}</div>
                      <span
                        className="badge rounded-pill fw-medium"
                        style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}
                      >
                        {rec.sku}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border small">{rec.category}</span>
                    </td>
                    <td className="small text-muted">{rec.supplier_name}</td>
                    <td className="text-center">
                      <span
                        className="badge fw-bold"
                        style={{
                          backgroundColor: rec.current_stock === 0 ? '#fff1f2' : '#fffbeb',
                          color: rec.current_stock === 0 ? '#e11d48' : '#d97706',
                          fontSize: '0.8rem',
                        }}
                      >
                        {rec.current_stock}
                      </span>
                    </td>
                    <td className="text-center text-muted small">{rec.reorder_point}</td>
                    <td className="text-center">
                      <span
                        className="badge rounded-pill fw-bold"
                        style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                      >
                        +{rec.recommended_order_quantity} units
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{formatINR(rec.estimated_cost_inr)}</td>
                    <td>
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          backgroundColor:
                            rec.urgency === 'CRITICAL'
                              ? '#fff1f2'
                              : rec.urgency === 'HIGH'
                              ? '#fffbeb'
                              : '#eff6ff',
                          color:
                            rec.urgency === 'CRITICAL'
                              ? '#be123c'
                              : rec.urgency === 'HIGH'
                              ? '#b45309'
                              : '#1d4ed8',
                          border: `1px solid ${
                            rec.urgency === 'CRITICAL'
                              ? '#fecdd3'
                              : rec.urgency === 'HIGH'
                              ? '#fde68a'
                              : '#bfdbfe'
                          }`,
                          fontSize: '0.72rem',
                        }}
                      >
                        {rec.urgency}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted small">
                    <CheckCircle2 size={28} className="text-emerald-500 mb-2 d-block mx-auto" />
                    No critical restock recommendations needed. All items have adequate buffer!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products & Location Valuation */}
      <div className="row g-3">
        {/* Top Products */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0 text-dark">Top Revenue-Generating SKUs</h6>
              <span className="text-muted small">Highest gross margin contributors</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
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
                          <div className="fw-bold text-dark">{p.product__name}</div>
                          <span
                            className="badge rounded-pill fw-medium"
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}
                          >
                            {p.product__sku}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border small">
                            {p.product__category__name}
                          </span>
                        </td>
                        <td className="text-center fw-bold text-dark">{p.total_units_sold}</td>
                        <td className="text-end fw-bold" style={{ color: '#059669' }}>
                          {formatINR(p.total_revenue_generated)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted small">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Facility Inventory Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0 text-dark">Facility Valuation Breakdown</h6>
              <span className="text-muted small">Multi-warehouse stock capital allocation</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Facility Hub</th>
                    <th>Type</th>
                    <th className="text-center">Total Units</th>
                    <th className="text-end">Capital Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {locationBreakdown.length > 0 ? (
                    locationBreakdown.map((loc) => (
                      <tr key={loc.location_id}>
                        <td>
                          <div className="fw-bold text-dark">{loc.location_name}</div>
                          <span className="small text-muted">{loc.city} ({loc.location_code})</span>
                        </td>
                        <td>
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              backgroundColor: loc.location_type === 'WAREHOUSE' ? '#ecfdf5' : '#eff6ff',
                              color: loc.location_type === 'WAREHOUSE' ? '#065f46' : '#1e40af',
                              fontSize: '0.72rem',
                            }}
                          >
                            {loc.location_type}
                          </span>
                        </td>
                        <td className="text-center fw-bold text-dark">{loc.total_items}</td>
                        <td className="text-end fw-bold" style={{ color: '#059669' }}>
                          {formatINR(loc.total_valuation)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted small">
                        No facility data available.
                      </td>
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
