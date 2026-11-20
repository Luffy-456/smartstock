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
  ExternalLink
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

  // Format currency in Indian numbering system
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Sales Trend Chart Data
  const salesChartData = {
    labels: salesTrend.map((d) => d.period),
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: salesTrend.map((d) => d.total_revenue),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Category Valuation Doughnut Data
  const categoryChartData = {
    labels: categoryBreakdown.slice(0, 5).map((c) => c.category_name),
    datasets: [
      {
        data: categoryBreakdown.slice(0, 5).map((c) => c.valuation),
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-fluid px-3 px-lg-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Retail Operations Dashboard</h2>
          <p className="text-muted small mb-0">Real-time inventory levels, fulfillment metrics, and multi-location performance</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 align-self-start align-self-sm-auto"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Stock Valuation"
            value={formatINR(kpis?.total_inventory_valuation)}
            subtitle={`${kpis?.total_skus || 0} Active Catalog SKUs`}
            icon={IndianRupee}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Inventory Turnover Ratio"
            value={`${kpis?.turnover_ratio || 0.0}x`}
            subtitle={`COGS: ${formatINR(kpis?.cogs)}`}
            icon={TrendingUp}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Low Stock Alerts"
            value={kpis?.low_stock_count || 0}
            subtitle={`${kpis?.out_of_stock_count || 0} completely out of stock`}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Sales Revenue"
            value={formatINR(kpis?.total_revenue)}
            subtitle={`${kpis?.total_orders || 0} Sales Orders Processed`}
            icon={ShoppingCart}
            color="purple"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Monthly Sales Revenue Trend</span>
              <span className="badge bg-primary-subtle text-primary">2024–2026 Fiscal</span>
            </div>
            <div className="card-body" style={{ minHeight: '300px' }}>
              {salesTrend.length > 0 ? (
                <Bar
                  data={salesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `₹${value / 1000}k`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-muted py-5">Loading sales data...</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Category Stock Valuation</span>
              <span className="badge bg-secondary-subtle text-secondary">Top 5</span>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
              {categoryBreakdown.length > 0 ? (
                <div style={{ maxHeight: '260px' }}>
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5">Loading breakdown...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Low Stock Alerts & Recent Orders */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-danger fw-bold">
                <AlertTriangle size={18} />
                <span>Low Stock & Reorder Alerts</span>
              </div>
              <Link to="/products?filter=low_stock" className="small text-decoration-none">
                View All Catalog
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Reorder Point</th>
                    <th>Deficit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.length > 0 ? (
                    lowStockAlerts.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                          <span className="badge bg-light text-secondary border small">{item.sku}</span>
                        </td>
                        <td>
                          <span className={item.current_stock === 0 ? 'text-danger fw-bold' : 'text-warning fw-bold'}>
                            {item.current_stock}
                          </span>
                        </td>
                        <td>{item.reorder_point}</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger">+{item.deficit}</span>
                        </td>
                        <td>
                          <Link to="/suppliers" className="btn btn-outline-primary btn-sm py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            Order PO
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        All products are currently above their minimum reorder levels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                <ShoppingCart size={18} />
                <span>Recent Customer Orders</span>
              </div>
              <Link to="/orders" className="small text-decoration-none">
                View All Orders
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total (INR)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="fw-bold text-primary">{order.order_number}</td>
                        <td>{order.customer_name || 'Walk-in'}</td>
                        <td className="fw-semibold">{formatINR(order.total_amount)}</td>
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
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No orders recorded yet.
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
