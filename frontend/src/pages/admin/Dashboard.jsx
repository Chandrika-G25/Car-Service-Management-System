import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loading message="Loading administrative executive metrics..." />;

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};
  const recentRequests = analytics?.recent_requests || [];
  const engineerWorkload = analytics?.engineers_workload || [];

  // Line Chart Data for Monthly Service Volume
  const lineChartData = {
    labels: charts.monthly_labels || ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
    datasets: [
      {
        label: 'Completed Services',
        data: charts.monthly_services || [0, 0, 0, 0, 0, 0],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#ffffff',
        pointRadius: 5,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', precision: 0 },
      },
    },
  };

  // Status Distribution Doughnut Chart
  const statusDist = charts.status_distribution || {};
  const doughnutData = {
    labels: Object.keys(statusDist).map((k) => k.replace('_', ' ')),
    datasets: [
      {
        data: Object.values(statusDist),
        backgroundColor: [
          '#f59e0b', // PENDING
          '#0ea5e9', // ASSIGNED
          '#8b5cf6', // IN_PROGRESS
          '#3b82f6', // INSPECTION
          '#a855f7', // REPAIRING
          '#06b6d4', // TESTING
          '#10b981', // COMPLETED
          '#ef4444', // CANCELLED
        ],
        borderColor: '#111827',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', boxWidth: 12, padding: 12 },
      },
    },
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Admin Control Center</h1>
          <p>Workshop telemetry, technician allocation, financial indicators, and vehicle intake.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/engineers" className="btn btn-secondary">
            <UserCheck size={16} /> Engineers
          </Link>
          <Link to="/admin/services" className="btn btn-primary">
            <Wrench size={16} /> Service Queue
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.total_customers || 0}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Car size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.total_vehicles || 0}</h3>
            <p>Fleet Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.pending_services || 0}</h3>
            <p>Pending Tickets</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Wrench size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.active_services || 0}</h3>
            <p>Active Bay Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <h3>{kpis.completed_services || 0}</h3>
            <p>Completed Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div className="stat-details">
            <h3>${kpis.total_revenue?.toLocaleString() || '0'}</h3>
            <p>Billed Revenue</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Monthly Service Request Volume</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Historical volume across 6 months
              </p>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Job Status Distribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Breakdown of all bay stages
              </p>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Split Grid: Recent Requests & Engineer Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Service Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Recent Intake Requests</h3>
            <Link to="/admin/services" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Full Queue →
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <Link to={`/admin/services/${req.id}`} style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {req.request_number}
                      </Link>
                    </td>
                    <td>{req.customer_name}</td>
                    <td>{req.car_details?.brand} {req.car_details?.model}</td>
                    <td><StatusBadge status={req.current_status} /></td>
                    <td>{req.engineer_name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engineer Workload Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Technician Workload</h3>
            <Link to="/admin/engineers" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Manage →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {engineerWorkload.map((eng) => (
              <div
                key={eng.id}
                style={{
                  padding: '0.85rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{eng.name}</strong>
                  <span className="badge badge-assigned" style={{ fontSize: '0.7rem' }}>{eng.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {eng.employee_id} • {eng.specialization}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>Active Jobs: <strong style={{ color: 'var(--accent)' }}>{eng.active_jobs}</strong></span>
                  <span>Completed: <strong style={{ color: 'var(--success)' }}>{eng.completed_jobs}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
