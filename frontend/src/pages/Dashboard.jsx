import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/Badge';
import {
  IndianRupee,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Warehouse,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [locationBreakdown, setLocationBreakdown] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, catRes, locRes, alertsRes, ordRes] = await Promise.all([
        api.get('/analytics/kpis/'),
        api.get('/analytics/sales-trend/'),
        api.get('/analytics/category-breakdown/'),
        api.get('/analytics/location-breakdown/'),
        api.get('/products/low_stock_alerts/'),
        api.get('/orders/?ordering=-order_date'),
      ]);

      setKpis(kpiRes.data);
      setSalesTrend(trendRes.data || []);
      setCategoryBreakdown(catRes.data || []);
      setLocationBreakdown(locRes.data || []);
      setLowStockAlerts(alertsRes.data || []);
      setRecentOrders(ordRes.data.results || ordRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Emerald-themed Sales Chart
  const salesChartData = {
    labels: salesTrend.map((d) => d.period),
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: salesTrend.map((d) => d.total_revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        hoverBackgroundColor: '#059669',
        borderColor: '#059669',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  // Emerald/Mint Doughnut Palette
  const categoryChartData = {
    labels: categoryBreakdown.slice(0, 5).map((c) => c.category_name),
    datasets: [
      {
        data: categoryBreakdown.slice(0, 5).map((c) => c.valuation),
        backgroundColor: [
          '#059669', // Emerald
          '#10b981', // Mint Emerald
          '#14b8a6', // Teal
          '#0284c7', // Sky
          '#f59e0b', // Amber
        ],
        hoverOffset: 4,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="container-fluid px-3 px-xl-4 fade-in">
      {/* Top Welcome & Quick Action Banner */}
      <div
        className="card mb-4 border-0 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)',
          borderLeft: '4px solid #10b981',
        }}
      >
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge rounded-pill" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                  <Sparkles size={12} className="me-1" />
                  Live Intelligence
                </span>
                <span className="text-muted small">Updated in real-time</span>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                Retail Inventory & Fulfillment
              </h2>
              <p className="text-muted small mb-0">
                Multi-location stock distribution, reorder prediction, and automated order tracking.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                onClick={fetchDashboardData}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin text-emerald-600' : 'text-emerald-600'} />
                <span>{loading ? 'Refreshing...' : 'Sync Data'}</span>
              </button>
              <Link to="/products" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                <Package size={14} />
                <span>View SKUs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Stock Valuation"
            value={formatINR(kpis?.total_inventory_valuation)}
            subtitle={`${kpis?.total_skus || 0} Catalog SKUs Tracked`}
            icon={IndianRupee}
            color="emerald"
            trend={{ isPositive: true, text: 'Optimal' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Inventory Turnover"
            value={`${kpis?.turnover_ratio || 0.0}x`}
            subtitle={`COGS: ${formatINR(kpis?.cogs)}`}
            icon={TrendingUp}
            color="teal"
            trend={{ isPositive: true, text: 'Healthy Velocity' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Low Stock SKUs"
            value={kpis?.low_stock_count || 0}
            subtitle={`${kpis?.out_of_stock_count || 0} Completely Depleted`}
            icon={AlertTriangle}
            color="danger"
            trend={{ isPositive: false, text: 'Action Needed' }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Gross Sales Revenue"
            value={formatINR(kpis?.total_revenue)}
            subtitle={`${kpis?.total_orders || 0} Completed Orders`}
            icon={ShoppingCart}
            color="purple"
            trend={{ isPositive: true, text: '+14.2%' }}
          />
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="row g-3 mb-4">
        {/* Sales Trend Bar Chart */}
        <div className="col-12 col-lg-8">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">Monthly Revenue Trend</h6>
                <span className="text-muted small">Aggregated monthly sales volume</span>
              </div>
              <span
                className="badge rounded-pill fw-semibold"
                style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
              >
                Fiscal Period
              </span>
            </div>
            <div className="card-body" style={{ minHeight: '310px' }}>
              {salesTrend.length > 0 ? (
                <Bar
                  data={salesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#0f172a',
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                          label: (context) => ` Revenue: ₹${context.raw?.toLocaleString('en-IN')}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { size: 11 } },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(226, 232, 240, 0.6)' },
                        ticks: {
                          color: '#64748b',
                          font: { size: 11 },
                          callback: (value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-muted py-5">
                  <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                  <div>Loading sales metrics...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown Doughnut Chart */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div>
                <h6 className="fw-bold mb-0 text-dark">Category Valuation</h6>
                <span className="text-muted small">Asset allocation by top categories</span>
              </div>
              <span className="badge bg-light text-secondary border">Top 5</span>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '310px' }}>
              {categoryBreakdown.length > 0 ? (
                <div style={{ width: '100%', height: '240px' }}>
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11, family: 'Inter' },
                            padding: 14,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` ₹${context.raw?.toLocaleString('en-IN')}`,
                          },
                        },
                      },
                      cutout: '72%',
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                  <div>Computing category distribution...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Feeds: Low Stock Alerts & Recent Orders */}
      <div className="row g-3">
        {/* Low Stock Alerts */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', backgroundColor: '#fff1f2', color: '#e11d48' }}
                >
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Low Stock Watchlist</h6>
                  <span className="text-muted small">Items below minimum safety threshold</span>
                </div>
              </div>
              <Link to="/products?filter=low_stock" className="small text-emerald-600 fw-semibold d-flex align-items-center gap-1">
                <span>View All</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Stock</th>
                    <th>Reorder At</th>
                    <th>Deficit</th>
                    <th className="text-end">Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.length > 0 ? (
                    lowStockAlerts.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                            {item.sku}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge fw-bold"
                            style={{
                              backgroundColor: item.current_stock === 0 ? '#fff1f2' : '#fffbeb',
                              color: item.current_stock === 0 ? '#e11d48' : '#d97706',
                              fontSize: '0.8rem',
                            }}
                          >
                            {item.current_stock}
                          </span>
                        </td>
                        <td className="text-muted small">{item.reorder_point}</td>
                        <td>
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{ backgroundColor: '#fff1f2', color: '#be123c', fontSize: '0.72rem' }}
                          >
                            +{item.deficit} needed
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            to="/suppliers"
                            className="btn btn-outline-primary btn-sm py-1 px-2.5"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Order PO
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        <CheckCircle2 size={24} className="text-emerald-500 mb-1 d-block mx-auto" />
                        All catalog items are securely above safety stock levels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Customer Orders */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', color: '#059669' }}
                >
                  <ShoppingCart size={15} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Recent Customer Orders</h6>
                  <span className="text-muted small">Latest fulfillment & checkout pipeline</span>
                </div>
              </div>
              <Link to="/orders" className="small text-emerald-600 fw-semibold d-flex align-items-center gap-1">
                <span>View All</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className="fw-bold" style={{ color: '#059669', fontSize: '0.85rem' }}>
                            {order.order_number}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-secondary small fw-bold"
                              style={{ width: '24px', height: '24px', backgroundColor: '#f1f5f9', fontSize: '0.7rem' }}
                            >
                              {(order.customer_name?.[0] || 'C').toUpperCase()}
                            </div>
                            <span className="small fw-medium text-dark">{order.customer_name || 'Walk-in Customer'}</span>
                          </div>
                        </td>
                        <td className="fw-semibold text-dark">{formatINR(order.total_amount)}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="small text-muted">
                          {new Date(order.order_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        <Clock size={20} className="text-muted mb-1 d-block mx-auto" />
                        No customer orders recorded yet.
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
